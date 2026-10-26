'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check 
} from 'lucide-react';
import { PersonalizedEmailDraft, IntegrationSettings } from '@/types';

interface CareerDraftQueueTabProps {
  drafts: PersonalizedEmailDraft[];
  settings: IntegrationSettings;
  onPushToGmail: (draftId: string) => Promise<{ success: boolean; gmailDraftId?: string; error?: string }>;
  onRefresh: () => void;
}

export function CareerDraftQueueTab({
  drafts,
  settings,
  onPushToGmail,
  onRefresh
}: CareerDraftQueueTabProps) {
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePush = async (id: string) => {
    setPushingId(id);
    try {
      const res = await onPushToGmail(id);
      if (res.success) {
        alert(`Draft pushed to Gmail into your test inbox! Draft ID: ${res.gmailDraftId}`);
        onRefresh();
      } else {
        alert(res.error || 'Saved in queue.');
      }
    } catch (err: any) {
      alert(`Error pushing to Gmail: ${err.message}`);
    } finally {
      setPushingId(null);
    }
  };

  const copyDraft = (draft: PersonalizedEmailDraft) => {
    const text = `To: ${draft.recipient_name} <${draft.recipient_email}>\nSubject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCsv = () => {
    const headers = ['ID', 'Recipient Name', 'Recipient Email', 'Delivery Target Email', 'Subject', 'Status', 'Gmail Draft ID', 'Created At'];
    const rows = drafts.map(d => [
      d.id,
      `"${d.recipient_name.replace(/"/g, '""')}"`,
      `"${d.recipient_email}"`,
      `"${d.delivery_target_email}"`,
      `"${d.subject.replace(/"/g, '""')}"`,
      d.status,
      d.gmail_draft_id || 'Internal Queue',
      d.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careerpilot_outreach_drafts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <span>Email Draft Review Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review personalized outreach drafts. Under strict compliance rules, drafts are created only in your verified test inbox and never sent automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            disabled={drafts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs cursor-pointer disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Safety Compliance Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-3 text-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Gmail Integration: Draft Creation Only</div>
            <div className="text-slate-600 text-[11px]">
              Destination: <strong className="text-slate-900">{settings.gmail_connected_email || 'amaymishra1104@gmail.com'}</strong> • Zero automatic message send calls exist in application codebase.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className={`px-2.5 py-1 rounded-full font-semibold border ${
            settings.gmail_connected
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            {settings.gmail_connected ? 'Gmail OAuth Live' : 'Internal Queue Mode'}
          </span>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.length > 0 ? (
          drafts.map(draft => (
            <div
              key={draft.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{draft.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold uppercase border border-indigo-200">
                      {draft.email_type.replace('_', ' ')}
                    </span>
                    {draft.gmail_draft_created || draft.created_in_gmail ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Created in Gmail: {draft.gmail_draft_id}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        Internal Draft Queue
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Target Contact: <strong className="text-slate-800">{draft.recipient_name}</strong> &lt;{draft.recipient_email}&gt;
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyDraft(draft)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Copy draft"
                  >
                    {copiedId === draft.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handlePush(draft.id)}
                    disabled={pushingId === draft.id}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {pushingId === draft.id ? 'Creating...' : 'Create Gmail Draft'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                {draft.body}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Created: {new Date(draft.created_at).toLocaleDateString()}</span>
                <span>Tone: <strong className="text-slate-600">{draft.tone}</strong></span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            No outreach drafts in the queue. Select a job and generate an email to get started.
          </div>
        )}
      </div>
    </div>
  );
}
