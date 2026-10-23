import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';
import { EmailSequenceGenerator } from '@/lib/sequences/generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, stepNumber } = body;

    if (!leadId || !stepNumber) {
      return NextResponse.json({ error: 'leadId and stepNumber are required.' }, { status: 400 });
    }

    // Server-side approval assertion
    const contact = ApprovalGate.assertApproved(leadId);
    const company = Store.getCompanyById(contact.company_id);
    const enrichment = Store.getEnrichmentByLeadId(leadId);

    if (!company || !enrichment) {
      return NextResponse.json({ error: 'Company or enrichment not found for lead.' }, { status: 400 });
    }

    const seq = Store.getSequenceByLeadId(leadId);
    if (!seq) {
      return NextResponse.json({ error: 'Sequence not found.' }, { status: 404 });
    }

    const regeneratedEmail = EmailSequenceGenerator.regenerateSingleEmail(
      Number(stepNumber),
      contact,
      company,
      enrichment
    );

    const emailIdx = seq.emails.findIndex(e => e.sequence_step === Number(stepNumber));
    if (emailIdx >= 0) {
      seq.emails[emailIdx] = regeneratedEmail;
    } else {
      seq.emails.push(regeneratedEmail);
    }

    seq.updated_at = new Date().toISOString();
    Store.saveSequence(seq);

    // Propagate reset to existing drafts if already drafted
    const existingDrafts = Store.getDrafts(leadId, true);
    const targetDraft = existingDrafts.find(d => d.sequence_step === Number(stepNumber));
    if (targetDraft) {
      targetDraft.subject = regeneratedEmail.subject;
      targetDraft.body_html = regeneratedEmail.body.replace(/\n/g, '<br/>');
      targetDraft.updated_at = new Date().toISOString();
      Store.saveDraft(targetDraft);
    }

    return NextResponse.json({
      success: true,
      email: regeneratedEmail,
      sequence: seq
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: (error as any).statusCode || 500 });
  }
}
