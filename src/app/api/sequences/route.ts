import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';
import { EmailSequenceGenerator } from '@/lib/sequences/generator';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (leadId) {
      const seq = Store.getSequenceByLeadId(leadId);
      return NextResponse.json(seq || null);
    }

    const allSeqs = Store.getSequences();
    return NextResponse.json(allSeqs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    // MANDATORY SERVER-SIDE APPROVAL GATE ENFORCEMENT
    // This strictly checks that the lead status is 'APPROVED'.
    // If PENDING or REJECTED, throws HTTP 403.
    let contact;
    try {
      contact = ApprovalGate.assertApproved(leadId);
    } catch (gateErr: any) {
      return NextResponse.json(
        { 
          error: gateErr.message, 
          approvalStatus: gateErr.approvalStatus || 'UNAPPROVED',
          violatesApprovalGate: true 
        }, 
        { status: 403 }
      );
    }

    const company = Store.getCompanyById(contact.company_id);
    if (!company) {
      return NextResponse.json({ error: `Company ${contact.company_id} not found.` }, { status: 404 });
    }

    let enrichment = Store.getEnrichmentByLeadId(leadId);
    if (!enrichment) {
      return NextResponse.json({ error: 'Lead has not been enriched yet. Run enrichment before sequence generation.' }, { status: 400 });
    }

    const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
    Store.saveSequence(sequence);

    return NextResponse.json({
      success: true,
      sequence
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { leadId, stepNumber, subject, body: emailBody } = body;

    if (!leadId || !stepNumber) {
      return NextResponse.json({ error: 'leadId and stepNumber are required.' }, { status: 400 });
    }

    // MANDATORY SERVER-SIDE APPROVAL GATE ENFORCEMENT
    // Ensure that only APPROVED leads can have sequence copy updated
    try {
      ApprovalGate.assertApproved(leadId);
    } catch (gateErr: any) {
      return NextResponse.json(
        { 
          error: gateErr.message, 
          approvalStatus: gateErr.approvalStatus || 'UNAPPROVED',
          violatesApprovalGate: true 
        }, 
        { status: 403 }
      );
    }

    const seq = Store.getSequenceByLeadId(leadId);
    if (!seq) {
      return NextResponse.json({ error: `Sequence for lead ${leadId} not found.` }, { status: 404 });
    }

    const email = seq.emails.find(e => e.sequence_step === stepNumber);
    if (!email) {
      return NextResponse.json({ error: `Email step ${stepNumber} not found in sequence.` }, { status: 404 });
    }

    if (subject !== undefined) email.subject = subject;
    if (emailBody !== undefined) email.body = emailBody;
    email.is_edited = true;
    seq.status = 'MODIFIED';
    seq.updated_at = new Date().toISOString();

    Store.saveSequence(seq);

    // Propagate edits to existing drafts if already drafted
    const existingDrafts = Store.getDrafts(leadId, true);
    const targetDraft = existingDrafts.find(d => d.sequence_step === stepNumber);
    if (targetDraft) {
      if (subject !== undefined) targetDraft.subject = subject;
      if (emailBody !== undefined) targetDraft.body_html = emailBody.replace(/\n/g, '<br/>');
      targetDraft.updated_at = new Date().toISOString();
      Store.saveDraft(targetDraft);
    }

    return NextResponse.json({
      success: true,
      sequence: seq
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
