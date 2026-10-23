'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Sparkles, 
  Building2, 
  AlertCircle,
  FileText,
  SendHorizontal,
  ChevronRight
} from 'lucide-react';
import { Contact, Company, EnrichmentRecord, ApprovalHistoryItem, ApprovalStatus } from '@/types';
import { LeadDetailModal } from './LeadDetailModal';

interface ApprovalQueueTabProps {
  contacts: Contact[];
  companies: Company[];
  enrichments: Record<string, EnrichmentRecord>;
  approvalHistory: ApprovalHistoryItem[];
  onApproveLead: (leadId: string, notes?: string) => Promise<void>;
  onRejectLead: (leadId: string, notes?: string, reason?: string) => Promise<void>;
  onNavigateToSequences: (leadId: string) => void;
}

export function ApprovalQueueTab({
  contacts,
  companies,
  enrichments,
  approvalHistory,
  onApproveLead,
  onRejectLead,
  onNavigateToSequences
}: ApprovalQueueTabProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [inspectingContact, setInspectingContact] = useState<Contact | null>(null);

  const pendingCount = contacts.filter(c => c.approval_status === 'PENDING').length;
  const approvedCount = contacts.filter(c => c.approval_status === 'APPROVED').length;
  const rejectedCount = contacts.filter(c => c.approval_status === 'REJECTED').length;

  const filteredContacts = contacts.filter(c => {
    if (filter === 'ALL') return true;
    return c.approval_status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Stage 4: Mandatory Human Approval Gate</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every prospect requires human sign-off before sequence generation. Enforced strictly at the server API layer.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({contacts.length})
            </button>
          </div>
        </div>

        {/* Governance banner */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              <strong>Gate Rule:</strong> Only leads with status <span className="text-emerald-400 font-mono">APPROVED</span> can generate 4-email sequences. Unapproved leads are strictly blocked.
            </span>
          </div>
          {approvedCount > 0 && (
            <span className="text-indigo-400 font-medium">
              {approvedCount} lead(s) ready for sequence generation
            </span>
          )}
        </div>
      </div>

      {/* Leads Approval Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40">
          <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs">No leads currently in status {filter}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredContacts.map((lead) => {
            const company = companies.find(c => c.id === lead.company_id);
            const enrichment = enrichments[lead.id];
            const leadHistory = approvalHistory.filter(h => h.lead_id === lead.id);

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold shrink-0">
                      {lead.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{lead.full_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.approval_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          lead.approval_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {lead.approval_status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          [{lead.provenance}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {lead.job_title} • <span className="text-indigo-300 font-medium">{lead.company_name}</span> ({company?.estimated_locations || 50} units in {company?.headquarters})
                      </p>
                    </div>
                  </div>

                  {/* Actions for this lead */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectingContact(lead)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect Evidence</span>
                    </button>

                    {lead.approval_status !== 'APPROVED' && (
                      <button
                        onClick={() => onApproveLead(lead.id, 'Approved by reviewer')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {lead.approval_status !== 'REJECTED' && (
                      <button
                        onClick={() => onRejectLead(lead.id, 'Disqualified during queue review', 'Does not match current criteria')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {lead.approval_status === 'APPROVED' && (
                      <button
                        onClick={() => onNavigateToSequences(lead.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
                      >
                        <SendHorizontal className="w-3.5 h-3.5" />
                        <span>Build 4 Emails</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Personalization hook snippet */}
                {enrichment ? (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Verified Personalization Hook Preview</span>
                    </span>
                    <p className="text-slate-200 italic leading-snug">
                      "{enrichment.personalization_hook}"
                    </p>
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      Citation: {enrichment.personalization_evidence_claim} (Confidence: {enrichment.confidence_score}/100)
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Lead not enriched yet. Run enrichment before reviewing evidence.
                  </p>
                )}

                {/* Notes or rejection reason display */}
                {(lead.reviewer_notes || lead.rejection_reason) && (
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-3">
                    {lead.reviewer_notes && (
                      <span><strong>Notes:</strong> {lead.reviewer_notes}</span>
                    )}
                    {lead.rejection_reason && (
                      <span className="text-rose-400"><strong>Rejection Reason:</strong> {lead.rejection_reason}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Evidence Modal */}
      {inspectingContact && (
        <LeadDetailModal
          isOpen={Boolean(inspectingContact)}
          onClose={() => setInspectingContact(null)}
          contact={inspectingContact}
          company={companies.find(c => c.id === inspectingContact.company_id)}
          enrichment={enrichments[inspectingContact.id]}
          history={approvalHistory.filter(h => h.lead_id === inspectingContact.id)}
          onApprove={async (id, notes) => {
            await onApproveLead(id, notes);
          }}
          onReject={async (id, notes, reason) => {
            await onRejectLead(id, notes, reason);
          }}
        />
      )}
    </div>
  );
}
