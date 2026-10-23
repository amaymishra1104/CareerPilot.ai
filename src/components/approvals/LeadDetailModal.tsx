'use client';

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  ExternalLink, 
  FileCheck2, 
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Contact, Company, EnrichmentRecord, ApprovalHistoryItem } from '@/types';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  company?: Company;
  enrichment?: EnrichmentRecord;
  history: ApprovalHistoryItem[];
  onApprove: (leadId: string, notes: string) => Promise<void>;
  onReject: (leadId: string, notes: string, reason: string) => Promise<void>;
}

export function LeadDetailModal({
  isOpen,
  onClose,
  contact,
  company,
  enrichment,
  history,
  onApprove,
  onReject
}: LeadDetailModalProps) {
  const [notes, setNotes] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('Outside current ICP store count sweet-spot');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(contact.id, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(contact.id, notes, rejectionReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{contact.full_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  contact.approval_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  contact.approval_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  CURRENT STATUS: {contact.approval_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {contact.job_title} at <span className="text-slate-200">{contact.company_name}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Decision-Maker Evidence Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Work Email</span>
              <p className="font-mono text-slate-200 mt-1">{contact.work_email || 'Unavailable'}</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Status: {contact.email_verification_status}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Company Scale</span>
              <p className="font-bold text-slate-200 mt-1">{company?.estimated_locations || 50} Locations</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{company?.headquarters}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Data Provenance</span>
              <p className="font-bold text-amber-300 mt-1 uppercase">{contact.provenance}</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Tagged audit trail</span>
            </div>
          </div>

          {/* Enrichment & Personalization Hook with Evidence */}
          {enrichment && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalization Hook Derived for Email 1</span>
              </span>
              <p className="text-slate-200 text-xs italic bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                "{enrichment.personalization_hook}"
              </p>
              <div className="flex items-start gap-1.5 text-[11px] text-emerald-400 mt-1">
                <FileCheck2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Citation Claim: {enrichment.personalization_evidence_claim}</span>
              </div>
            </div>
          )}

          {/* Operational Challenges (Facts vs Hypotheses) */}
          {enrichment && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Operational Analysis & Hypotheses
              </h4>
              <div className="space-y-2">
                {enrichment.operational_challenges.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start justify-between gap-3">
                    <p className="text-slate-300 leading-snug">{c.description}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                      c.is_hypothesis ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {c.is_hypothesis ? 'HYPOTHESIS' : 'FACT'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval History Audit Trail */}
          {history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Approval Audit History</span>
              </h4>
              <div className="space-y-1.5">
                {history.map((h) => (
                  <div key={h.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300">{h.previous_status} → {h.new_status}</span>
                      {h.reviewer_notes && <span className="text-slate-400 ml-2 italic">"{h.reviewer_notes}"</span>}
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(h.changed_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Input Form */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Reviewer Notes & Action
            </h4>

            <div>
              <label className="text-[11px] font-medium text-slate-400">Reviewer Notes (Recorded in Audit Trail)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes justifying approval or rejection..."
                className="w-full mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400">Rejection Reason (If rejecting)</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="Outside current ICP store count sweet-spot">Outside current ICP store count sweet-spot</option>
                <option value="Executive role does not oversee guest operations or technology">Executive role does not oversee guest operations or technology</option>
                <option value="Duplicate franchise group or already in pipeline">Duplicate franchise group or already in pipeline</option>
                <option value="Insufficient verifiable evidence or invalid source">Insufficient verifiable evidence or invalid source</option>
                <option value="Other strategic disqualification">Other strategic disqualification</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Strict Backend Enforcement: Approved leads unlock sequence generation; Rejected leads generate zero drafts.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>REJECT LEAD</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>APPROVE FOR OUTREACH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
