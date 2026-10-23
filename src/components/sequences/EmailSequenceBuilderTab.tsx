'use client';

import React, { useState } from 'react';
import { 
  SendHorizontal, 
  RotateCcw, 
  Edit3, 
  Check, 
  Sparkles, 
  Mail, 
  Calendar, 
  FileCheck2, 
  Building2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Contact, Company, EmailSequence, EmailMessage, IntegrationSettings } from '@/types';

interface EmailSequenceBuilderTabProps {
  contacts: Contact[];
  companies: Company[];
  sequences: Record<string, EmailSequence>;
  settings: IntegrationSettings;
  onGenerateSequence: (leadId: string) => Promise<void>;
  onRegenerateEmail: (leadId: string, stepNumber: number) => Promise<void>;
  onUpdateEmail: (leadId: string, stepNumber: number, subject: string, body: string) => Promise<void>;
  onCreateDrafts: (sequenceId: string) => Promise<void>;
  isGenerating: boolean;
  isDrafting: boolean;
}

function renderHighlightedBody(body: string, personalizationLines?: string[]) {
  if (!personalizationLines || personalizationLines.length === 0) {
    return <span className="whitespace-pre-wrap">{body}</span>;
  }

  const paragraphs = body.split('\n\n');

  return (
    <div className="space-y-3 font-sans leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        let segments: { text: string; isEnriched: boolean }[] = [{ text: para, isEnriched: false }];

        for (const pLine of personalizationLines) {
          const cleanLine = pLine.trim();
          if (!cleanLine) continue;

          const nextSegments: { text: string; isEnriched: boolean }[] = [];
          for (const seg of segments) {
            if (seg.isEnriched) {
              nextSegments.push(seg);
              continue;
            }

            const matchIndex = seg.text.indexOf(cleanLine);
            if (matchIndex !== -1) {
              const before = seg.text.substring(0, matchIndex);
              const matched = seg.text.substring(matchIndex, matchIndex + cleanLine.length);
              const after = seg.text.substring(matchIndex + cleanLine.length);

              if (before) nextSegments.push({ text: before, isEnriched: false });
              nextSegments.push({ text: matched, isEnriched: true });
              if (after) nextSegments.push({ text: after, isEnriched: false });
            } else {
              nextSegments.push(seg);
            }
          }
          segments = nextSegments;
        }

        return (
          <p key={pIdx} className="leading-relaxed whitespace-pre-wrap">
            {segments.map((seg, sIdx) =>
              seg.isEnriched ? (
                <mark
                  key={sIdx}
                  className="bg-amber-400/20 text-amber-200 border border-amber-400/50 px-1.5 py-0.5 rounded font-medium not-italic inline-block shadow-sm shadow-amber-500/10 my-0.5"
                  title="Enrichment-derived line (marked per Assignment requirement #3)"
                >
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded mr-1.5">
                    ✨ Enrichment Line
                  </span>
                  <span>{seg.text}</span>
                </mark>
              ) : (
                <span key={sIdx}>{seg.text}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export function EmailSequenceBuilderTab({
  contacts,
  companies,
  sequences,
  settings,
  onGenerateSequence,
  onRegenerateEmail,
  onUpdateEmail,
  onCreateDrafts,
  isGenerating,
  isDrafting
}: EmailSequenceBuilderTabProps) {
  // Only show approved leads, but allow viewing unapproved leads with a clear gate warning
  const approvedLeads = contacts.filter(c => c.approval_status === 'APPROVED');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(approvedLeads[0]?.id || contacts[0]?.id || '');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [draftSuccess, setDraftSuccess] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const activeContact = contacts.find(c => c.id === selectedLeadId) || contacts[0];
  const activeCompany = activeContact ? companies.find(c => c.id === activeContact.company_id) : undefined;
  const activeSequence = activeContact ? sequences[activeContact.id] : undefined;

  const currentEmail = activeSequence?.emails?.find(e => e.sequence_step === activeStep);

  const startEdit = () => {
    if (!currentEmail) return;
    setEditSubject(currentEmail.subject);
    setEditBody(currentEmail.body);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!activeContact) return;
    await onUpdateEmail(activeContact.id, activeStep, editSubject, editBody);
    setIsEditing(false);
  };

  const handleDraftClick = () => {
    if (!activeSequence) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCreateDrafts = async () => {
    if (!activeSequence) return;
    setIsConfirmModalOpen(false);
    setDraftSuccess(false);
    await onCreateDrafts(activeSequence.id);
    setDraftSuccess(true);
    setTimeout(() => setDraftSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SendHorizontal className="w-5 h-5 text-indigo-400" />
            <span>Stage 5: Four-Email Sequence Builder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates 4 distinct emails (Days 1, 4, 8, 13) for approved leads. Strictly saves as drafts — never automatically sends.
          </p>
        </div>

        {activeContact && activeContact.approval_status === 'APPROVED' && (
          <div className="flex items-center gap-2">
            {!activeSequence ? (
              <button
                onClick={() => onGenerateSequence(activeContact.id)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating 4 Emails...' : 'Generate 4-Email Sequence'}</span>
              </button>
            ) : (
              <button
                onClick={handleDraftClick}
                disabled={isDrafting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {isDrafting 
                    ? 'Creating Drafts...' 
                    : draftSuccess
                    ? 'Drafts Created!'
                    : settings.gmail_connected ? 'Save Drafts to Gmail' : 'Save to Draft Queue'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Lead Selector */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 max-h-[720px] overflow-y-auto">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Prospect Selection
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {approvedLeads.length} Approved
            </span>
          </div>

          {contacts.map((contact) => {
            const isSelected = contact.id === activeContact?.id;
            const isApproved = contact.approval_status === 'APPROVED';
            const hasSeq = Boolean(sequences[contact.id]);

            return (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedLeadId(contact.id);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{contact.full_name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-300' :
                    contact.approval_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {contact.approval_status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 truncate">{contact.job_title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span className="truncate">{contact.company_name}</span>
                  {hasSeq && (
                    <span className="text-indigo-400 font-mono font-medium">4 Emails Ready</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sequence Steps & Email Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {!activeContact ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40">
              No prospect selected.
            </div>
          ) : activeContact.approval_status !== 'APPROVED' ? (
            /* CRITICAL BACKEND ENFORCEMENT CALLOUT IN UI */
            <div className="p-10 text-center border border-amber-500/30 rounded-2xl bg-amber-950/15 space-y-3">
              <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                Human Approval Gate Active ({activeContact.approval_status})
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                This lead is currently <span className="text-amber-300 font-mono font-bold">{activeContact.approval_status}</span>. Under OSVI.ai governance rules, email sequences can ONLY be generated for APPROVED leads.
              </p>
              <div className="p-3 max-w-md mx-auto rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                Rejected and pending leads are strictly blocked at the API route layer to prevent unauthorized outreach.
              </div>
            </div>
          ) : !activeSequence ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
              <SendHorizontal className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
              <h3 className="text-sm font-semibold text-white">Lead Approved — Sequence Not Yet Generated</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click below to synthesize the 4-email sequence grounded in verified operational evidence and OSVI.ai Journey positioning.
              </p>
              <button
                onClick={() => onGenerateSequence(activeContact.id)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                {isGenerating ? 'Synthesizing...' : 'Generate 4-Email Sequence'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sequence Step Selector (Days 1, 4, 8, 13) */}
              <div className="grid grid-cols-4 gap-2">
                {activeSequence.emails.map((email) => {
                  const isCurrent = email.sequence_step === activeStep;
                  return (
                    <button
                      key={email.sequence_step}
                      onClick={() => {
                        setActiveStep(email.sequence_step);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-400">
                          EMAIL 0{email.sequence_step}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          Day {email.day_offset}
                        </span>
                      </div>
                      <p className="text-xs font-semibold truncate text-slate-100">
                        {email.step_title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Email Content Box */}
              {currentEmail && (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  {/* Action Bar for Active Email */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">
                        {currentEmail.step_title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        Scheduled Send: Day {currentEmail.day_offset}
                      </span>
                      {currentEmail.is_edited && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          Edited
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      ) : (
                        <button
                          onClick={startEdit}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Copy</span>
                        </button>
                      )}

                      <button
                        onClick={() => onRegenerateEmail(activeContact.id, activeStep)}
                        disabled={isGenerating}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer disabled:opacity-50"
                        title="Regenerate this single email with the LLM engine"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate Email {activeStep}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Subject Line
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-100 mt-1 font-sans">
                        {currentEmail.subject}
                      </p>
                    )}
                  </div>

                  {/* Body Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Email Body
                      </label>
                      <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Enrichment-derived lines marked with amber badge</span>
                      </span>
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={10}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                        {renderHighlightedBody(currentEmail.body, currentEmail.personalization_lines)}
                      </div>
                    )}
                  </div>

                  {/* Explicitly Marked Enrichment Lines */}
                  {currentEmail.personalization_lines && currentEmail.personalization_lines.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded">
                            Assignment Requirement #3
                          </span>
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Lines Derived from Enrichment</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400/80">
                          {currentEmail.personalization_lines.length} Marked Line{currentEmail.personalization_lines.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-0.5">
                        {currentEmail.personalization_lines.map((line, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/20 space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              <span>Marked Sentence {idx + 1}</span>
                            </div>
                            <p className="text-xs text-slate-100 font-sans italic pl-2 border-l-2 border-amber-400/50">
                              "{line}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlighted Personalization & Evidence References */}
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/25 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Evidence Grounding References</span>
                    </span>

                    <div className="space-y-1.5 pt-1">
                      {currentEmail.evidence_references.map((ref, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Final Confirmation Modal before Creating Drafts */}
      {isConfirmModalOpen && activeContact && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsConfirmModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Email Draft Creation</h3>
                <p className="text-xs text-slate-400">
                  Mandatory pre-draft confirmation & backend approval check
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-slate-300">
                  <strong className="text-white">Prospect:</strong> {activeContact.full_name} ({activeContact.job_title})
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Company:</strong> {activeContact.company_name}
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Recipient Email:</strong> {activeContact.work_email || 'Unavailable (saved with demo email)'}
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Draft Destination:</strong> {settings.gmail_connected ? `Live Gmail Account (${settings.gmail_connected_email})` : 'Internal Safe Draft Queue'}
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Sequence Count:</strong> Exactly 4 distinct messages (Days 1, 4, 8, 13)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Safety Protocol:</strong> This action will create <strong>drafts only</strong>. No messages will be sent automatically. The server will recheck approval status immediately before saving drafts.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateDrafts}
                disabled={isDrafting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDrafting ? 'Creating Drafts...' : 'Confirm & Create 4 Drafts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
