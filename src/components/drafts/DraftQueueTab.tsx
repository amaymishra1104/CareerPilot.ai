'use client';

import React, { useState } from 'react';
import { 
  MailCheck, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText,
  Clock,
  Eye,
  RefreshCw,
  Mail
} from 'lucide-react';
import { EmailDraftRecord, IntegrationSettings } from '@/types';

interface DraftQueueTabProps {
  drafts: EmailDraftRecord[];
  settings: IntegrationSettings;
  onRefreshDrafts: () => Promise<void>;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export function DraftQueueTab({
  drafts,
  settings,
  onRefreshDrafts,
  onExportCsv,
  onExportJson
}: DraftQueueTabProps) {
  const [selectedDraft, setSelectedDraft] = useState<EmailDraftRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-emerald-400" />
            <span>Email Draft Queue & Gmail Integration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified drafts created safely. <strong className="text-slate-300">Safety Guarantee:</strong> OSVI.ai never sends emails automatically. No background sending or autonomous schedulers exist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onRefreshDrafts}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh Draft Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection & Safety Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          settings.gmail_connected
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-slate-950/70 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.gmail_connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold block">
                {settings.gmail_connected ? 'Gmail OAuth 2.0 Connected' : 'Internal Draft Queue (Sandbox Mode)'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {settings.gmail_connected
                  ? `Authenticated as: ${settings.gmail_connected_email || 'Connected Google Account'}`
                  : 'Drafts saved locally with instant CSV/JSON export'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
            {settings.gmail_connected ? 'Live Gmail' : 'Queue Mode'}
          </span>
        </div>

        {/* Safety guarantee callout */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">Draft-Only Safety Guarantee</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Every message is saved exclusively to Gmail drafts or the internal draft queue. No endpoint or capability exists to trigger email transmissions.
            </p>
          </div>
        </div>
      </div>

      {/* Drafts List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {drafts.length} Email Drafts in Queue
          </span>
          <span className="text-[11px] text-slate-400">
            Organized by sequence day intervals (Day 1, 4, 8, 13)
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <MailCheck className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">No email drafts generated yet.</p>
            <p className="text-[11px] text-slate-400">
              Approve a lead in Stage 4 and click "Generate 4 Emails" to populate drafts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Step & Schedule</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject Line</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Created Timestamp</th>
                  <th className="py-3 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Step 0{draft.sequence_step}
                        </span>
                        <span className="text-slate-300">{draft.scheduled_day_text}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{draft.recipient_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{draft.recipient_email}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-200 font-medium">
                      {draft.subject}
                    </td>

                    <td className="py-3 px-4">
                      {draft.created_in_gmail ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Gmail Draft ({draft.gmail_draft_id?.slice(0, 8)}...)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>Internal Draft Queue</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(draft.created_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDraft(draft)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal for Single Draft */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                  {selectedDraft.scheduled_day_text}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedDraft.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedDraft(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400">
                <strong className="text-slate-300">To:</strong> {selectedDraft.recipient_name} &lt;{selectedDraft.recipient_email}&gt;
              </p>
              <p className="text-slate-400">
                <strong className="text-slate-300">Status:</strong> {selectedDraft.created_in_gmail ? `Saved to Gmail Drafts (${selectedDraft.gmail_draft_id})` : 'Saved in Internal Draft Queue'}
              </p>
            </div>

            <div 
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: selectedDraft.body_html }}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDraft(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
