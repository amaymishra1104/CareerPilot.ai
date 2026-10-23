import crypto from 'crypto';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';
import { EmailDraftRecord, IntegrationSettings } from '@/types';

export class GmailIntegrationService {
  /**
   * Generates Google OAuth 2.0 authorization URL for Gmail compose/drafts scope.
   * Includes CSRF-protecting state parameter.
   */
  static getAuthUrl(clientId: string, redirectUri: string, state?: string): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const authState = state || crypto.randomBytes(16).toString('hex');
    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      state: authState,
      scope: [
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ')
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  /**
   * Exchanges authorization code for tokens.
   */
  static async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Token exchange failed: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch user email
    let userEmail = '';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        userEmail = userData.email || '';
      }
    } catch (e) {
      console.warn('Could not fetch user email info:', e);
    }

    return {
      accessToken,
      refreshToken: refreshToken || '',
      email: userEmail
    };
  }

  /**
   * Refreshes access token using stored refresh token.
   */
  static async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!res.ok) {
      throw new Error(`Token refresh failed: ${await res.text()}`);
    }

    const data = await res.json();
    return data.access_token;
  }

  /**
   * Creates a draft in Gmail.
   * STRICT SAFETY GUARANTEE: Calls users.drafts.create ONLY. Never calls users.messages.send.
   */
  static async createGmailDraft(
    accessToken: string,
    toEmail: string,
    toName: string,
    subject: string,
    bodyText: string
  ): Promise<string> {
    // Build RFC 2822 MIME message
    const formattedSubject = subject.replace(/[\r\n]/g, '');
    const rawMessage = [
      `To: ${toName} <${toEmail}>`,
      `Subject: =?utf-8?B?${Buffer.from(formattedSubject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      bodyText
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          raw: encodedMessage
        }
      })
    });

    if (!draftRes.ok) {
      const err = await draftRes.text();
      throw new Error(`Gmail API Draft creation failed (${draftRes.status}): ${err}`);
    }

    const data = await draftRes.json();
    return data.id; // Gmail draft ID
  }

  /**
   * Orchestrates draft creation for an approved lead's 4-email sequence.
   * STRICT SERVER GATE & TOCTOU DEFENSE: Re-checks approval status before each draft write.
   * Verifies evidence hash has not changed since approval.
   */
  static async createDraftsForSequence(
    sequenceId: string,
    settings: IntegrationSettings
  ): Promise<{ draftsCreated: number; results: EmailDraftRecord[]; error?: string }> {
    const sequences = Store.getSequences();
    const seq = sequences.find(s => s.id === sequenceId);
    if (!seq) {
      throw new Error(`Sequence ${sequenceId} not found.`);
    }

    // MANDATORY GATE: Initial assertion of approved status
    const contact = ApprovalGate.assertApproved(seq.lead_id);

    // EVIDENCE INTEGRITY CHECK: Snapshot hash comparison
    const enrichment = Store.getEnrichmentByLeadId(seq.lead_id);
    if (enrichment && contact.approval_evidence_hash) {
      const currentHash = crypto.createHash('sha256').update(JSON.stringify({
        overview: enrichment.company_overview,
        locations: enrichment.location_count_verifiable,
        challenges: enrichment.operational_challenges,
        signals: enrichment.verified_buying_signals,
        hook: enrichment.personalization_hook
      })).digest('hex');

      if (currentHash !== contact.approval_evidence_hash) {
        throw new Error(`Evidence integrity violation: Enrichment record for ${contact.full_name} was modified after approval. Please re-review and re-approve the updated evidence before creating drafts.`);
      }
    }

    // SAFETY GUARANTEE: Never invent fake emails; send drafts to user's authorized inbox
    const authorizedUserInbox = settings.gmail_connected_email || process.env.USER_INBOX || 'amaymishra1104@gmail.com';
    const recipientEmail = (contact.work_email && contact.work_email !== 'unavailable' && !contact.work_email.includes('.demo'))
      ? contact.work_email
      : authorizedUserInbox;

    const draftRecords: EmailDraftRecord[] = [];
    let gmailAccessToken = '';

    // Check if live Gmail OAuth is connected
    const hasLiveGmail = Boolean(
      settings.gmail_connected &&
      settings.gmail_refresh_token &&
      settings.gmail_client_id &&
      settings.gmail_client_secret
    );

    if (hasLiveGmail) {
      try {
        gmailAccessToken = await this.refreshAccessToken(
          settings.gmail_refresh_token!,
          settings.gmail_client_id!,
          settings.gmail_client_secret!
        );
      } catch (e: any) {
        console.warn('Could not refresh Gmail token, falling back to Internal Draft Queue:', e.message);
      }
    }

    for (const email of seq.emails) {
      // TOCTOU DEFENSE: Re-verify approval status immediately before saving each draft
      ApprovalGate.assertApproved(seq.lead_id);

      // Check for duplicate draft prevention during retries
      const existingDrafts = Store.getDrafts(seq.lead_id, true);
      const alreadyCreated = existingDrafts.find(d => d.sequence_step === email.sequence_step);

      if (alreadyCreated && (alreadyCreated.created_in_gmail || !hasLiveGmail)) {
        // If content changed via sequence editing, update existing draft copy
        if (alreadyCreated.subject !== email.subject || alreadyCreated.body_html !== email.body.replace(/\n/g, '<br/>')) {
          alreadyCreated.subject = email.subject;
          alreadyCreated.body_html = email.body.replace(/\n/g, '<br/>');
          alreadyCreated.updated_at = new Date().toISOString();
          Store.saveDraft(alreadyCreated);
        }
        draftRecords.push(alreadyCreated);
        continue;
      }

      let gmailDraftId: string | undefined = undefined;
      let createdInGmail = false;
      let errorMsg: string | undefined = undefined;

      if (gmailAccessToken) {
        try {
          gmailDraftId = await this.createGmailDraft(
            gmailAccessToken,
            recipientEmail,
            contact.full_name,
            email.subject,
            email.body
          );
          createdInGmail = true;
        } catch (err: any) {
          errorMsg = err.message;
        }
      }

      const draftRecord: EmailDraftRecord = {
        id: `draft-${seq.lead_id}-step-${email.sequence_step}`,
        sequence_id: seq.id,
        lead_id: seq.lead_id,
        sequence_step: email.sequence_step,
        recipient_email: recipientEmail,
        recipient_name: contact.full_name,
        subject: email.subject,
        body_html: email.body.replace(/\n/g, '<br/>'),
        scheduled_day_text: `Day ${email.day_offset} (Sequence Step ${email.sequence_step})`,
        gmail_draft_id: gmailDraftId,
        created_in_gmail: createdInGmail,
        creation_error: errorMsg,
        created_at: new Date().toISOString()
      };

      Store.saveDraft(draftRecord);
      draftRecords.push(draftRecord);
    }

    // Update sequence status
    seq.status = gmailAccessToken ? 'DRAFTED_IN_GMAIL' : 'GENERATED';
    Store.saveSequence(seq);

    return {
      draftsCreated: draftRecords.length,
      results: draftRecords
    };
  }

  /**
   * Exports drafts as CSV format
   */
  static exportDraftsToCsv(drafts: EmailDraftRecord[]): string {
    const headers = ['Step', 'Scheduled Day', 'Recipient Name', 'Recipient Email', 'Subject', 'Body Text', 'Gmail Draft ID', 'Created At'];
    const rows = drafts.map(d => [
      d.sequence_step,
      `"${d.scheduled_day_text}"`,
      `"${d.recipient_name.replace(/"/g, '""')}"`,
      `"${d.recipient_email}"`,
      `"${d.subject.replace(/"/g, '""')}"`,
      `"${d.body_html.replace(/<br\/>/g, '\n').replace(/"/g, '""')}"`,
      d.gmail_draft_id || 'Internal Queue',
      d.created_at
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
