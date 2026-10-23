import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId') || undefined;
    const history = Store.getApprovalHistory(leadId);
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, action, reviewerNotes, rejectionReason } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    if (!['APPROVE', 'REJECT', 'RESET'].includes(action)) {
      return NextResponse.json({ error: 'action must be APPROVE, REJECT, or RESET.' }, { status: 400 });
    }

    let updatedContact;
    if (action === 'APPROVE') {
      updatedContact = ApprovalGate.approveLead(leadId, reviewerNotes);
    } else if (action === 'REJECT') {
      updatedContact = ApprovalGate.rejectLead(leadId, reviewerNotes, rejectionReason);
    } else {
      updatedContact = ApprovalGate.resetToPending(leadId, reviewerNotes);
    }

    return NextResponse.json({
      success: true,
      contact: updatedContact,
      approvalStatus: updatedContact.approval_status
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
