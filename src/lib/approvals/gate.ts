import { Store } from '@/lib/storage';
import { Contact, ApprovalStatus } from '@/types';

export class ApprovalGate {
  /**
   * Strictly asserts that a lead is APPROVED.
   * Throws an error if the lead is PENDING or REJECTED.
   * This is enforced at the server API layer before any sequence generation or draft creation.
   */
  static assertApproved(leadId: string): Contact {
    const contact = Store.getContactById(leadId);
    if (!contact) {
      throw new Error(`Lead ${leadId} not found.`);
    }

    if (contact.approval_status !== 'APPROVED') {
      const errorMsg = `Server Gate Violation: Lead ${contact.full_name} (${contact.company_name}) has status '${contact.approval_status}'. Only APPROVED leads can generate sequences or email drafts.`;
      const err = new Error(errorMsg);
      (err as any).statusCode = 403;
      (err as any).approvalStatus = contact.approval_status;
      throw err;
    }

    return contact;
  }

  static approveLead(leadId: string, reviewerNotes?: string): Contact {
    return Store.updateContactApproval(leadId, 'APPROVED', reviewerNotes);
  }

  static rejectLead(leadId: string, reviewerNotes?: string, rejectionReason?: string): Contact {
    return Store.updateContactApproval(leadId, 'REJECTED', reviewerNotes, rejectionReason);
  }

  static resetToPending(leadId: string, reviewerNotes?: string): Contact {
    return Store.updateContactApproval(leadId, 'PENDING', reviewerNotes);
  }
}
