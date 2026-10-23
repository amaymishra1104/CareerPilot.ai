import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';
import { GmailIntegrationService } from '@/lib/integrations/gmail';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId') || undefined;
    const includeRevoked = searchParams.get('includeRevoked') === 'true';
    const drafts = Store.getDrafts(leadId, includeRevoked);
    return NextResponse.json(drafts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sequenceId, leadId } = body;

    const targetLeadId = leadId || (sequenceId ? Store.getSequences().find(s => s.id === sequenceId)?.lead_id : undefined);

    if (!targetLeadId) {
      return NextResponse.json({ error: 'leadId or valid sequenceId is required.' }, { status: 400 });
    }

    // MANDATORY RE-CHECK OF APPROVAL STATUS ON SERVER
    try {
      ApprovalGate.assertApproved(targetLeadId);
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

    const seq = Store.getSequenceByLeadId(targetLeadId);
    if (!seq) {
      return NextResponse.json({ error: 'Sequence not found for this lead. Generate the sequence first.' }, { status: 404 });
    }

    const settings = Store.getSettings();
    const result = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);

    return NextResponse.json({
      success: true,
      draftsCreated: result.draftsCreated,
      createdInGmail: settings.gmail_connected,
      results: result.results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: (error as any).statusCode || 500 });
  }
}
