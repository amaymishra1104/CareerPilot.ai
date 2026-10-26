import { PersonalizedEmailDraft, IntegrationSettings } from '@/types';
import { GmailIntegrationService } from '@/lib/integrations/gmail';
import { Store } from '@/lib/storage';

export class CareerGmailDraftService {
  /**
   * Creates a Gmail draft for a personalized email draft.
   * STRICT SAFETY GUARANTEES:
   * 1. Calls users.drafts.create ONLY.
   * 2. Recipient email is strictly gated to the authorized operator/test inbox.
   * 3. Target prospect email is documented inside the draft header for human inspection.
   * 4. Duplicate prevention is enforced.
   */
  static async createGmailDraftForOutreach(
    draft: PersonalizedEmailDraft,
    settings: IntegrationSettings
  ): Promise<{ success: boolean; gmailDraftId?: string; error?: string }> {
    const authorizedUserInbox = (
      settings.gmail_connected_email || 
      process.env.USER_INBOX || 
      process.env.TEST_INBOX || 
      'amaymishra1104@gmail.com'
    ).toLowerCase().trim();

    // Enforce safety recipient guardrail
    GmailIntegrationService.assertSafeRecipient(authorizedUserInbox, authorizedUserInbox);

    // Check if already drafted in Gmail
    if (draft.created_in_gmail && draft.gmail_draft_id) {
      return {
        success: true,
        gmailDraftId: draft.gmail_draft_id
      };
    }

    // Check if live Gmail OAuth is connected
    const hasLiveGmail = Boolean(
      settings.gmail_connected &&
      settings.gmail_refresh_token &&
      settings.gmail_client_id &&
      settings.gmail_client_secret
    );

    if (!hasLiveGmail) {
      // Save in internal queue with explicit notice
      draft.status = 'APPROVED';
      draft.created_in_gmail = false;
      draft.updated_at = new Date().toISOString();
      Store.savePersonalizedDraft(draft);

      return {
        success: false,
        error: 'Live Gmail OAuth is not connected. Saved to Internal Draft Queue. Connect your Google account in Settings to push directly to Gmail drafts.'
      };
    }

    try {
      const accessToken = await GmailIntegrationService.refreshAccessToken(
        settings.gmail_refresh_token!,
        settings.gmail_client_id!,
        settings.gmail_client_secret!
      );

      // Prepend human review safety header to draft body
      const safetyNote = `[CAREERPILOT AI DRAFT REVIEW]\nTarget Prospect: ${draft.recipient_name} <${draft.recipient_email}>\nRole/Company Opportunity: ${draft.subject}\nStatus: PENDING HUMAN REVIEW (Draft Only - Never Automatically Sent)\n--------------------------------------------------\n\n`;
      const fullDraftBody = safetyNote + draft.body;

      const draftId = await GmailIntegrationService.createGmailDraft(
        accessToken,
        authorizedUserInbox,
        draft.recipient_name,
        `[Draft Review] ${draft.subject}`,
        fullDraftBody,
        authorizedUserInbox
      );

      draft.gmail_draft_id = draftId;
      draft.created_in_gmail = true;
      draft.status = 'DRAFTED_IN_GMAIL';
      draft.updated_at = new Date().toISOString();
      Store.savePersonalizedDraft(draft);

      return {
        success: true,
        gmailDraftId: draftId
      };
    } catch (err: any) {
      draft.creation_error = err.message;
      draft.updated_at = new Date().toISOString();
      Store.savePersonalizedDraft(draft);

      return {
        success: false,
        error: `Gmail API Draft Error: ${err.message}`
      };
    }
  }
}
