import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApprovalGate } from '@/lib/approvals/gate';
import { verifyPasscode } from '@/lib/auth/passcode';

export async function GET(req: Request) {
  try {
    const auth = verifyPasscode(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

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
    const auth = verifyPasscode(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, action, reviewerNotes, rejectionReason, reviewerName } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    if (!['APPROVE', 'REJECT', 'RESET'].includes(action)) {
      return NextResponse.json({ error: 'action must be APPROVE, REJECT, or RESET.' }, { status: 400 });
    }

    const reviewerIdentity = reviewerName || auth.reviewerIdentity;

    let updatedContact;
    if (action === 'APPROVE') {
      updatedContact = ApprovalGate.approveLead(leadId, reviewerNotes, reviewerIdentity);
    } else if (action === 'REJECT') {
      updatedContact = ApprovalGate.rejectLead(leadId, reviewerNotes, rejectionReason, reviewerIdentity);
    } else {
      updatedContact = ApprovalGate.resetToPending(leadId, reviewerNotes, reviewerIdentity);
    }

    return NextResponse.json({
      success: true,
      contact: updatedContact,
      approvalStatus: updatedContact.approval_status,
      reviewerIdentity
    });
  } catch (error: any) {
    const isNotFound = error.message?.toLowerCase().includes('not found');
    return NextResponse.json({ error: error.message }, { status: isNotFound ? 404 : 500 });
  }
}
