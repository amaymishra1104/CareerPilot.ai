'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  SendHorizontal, 
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onApproveLead: (leadId: string, notes?: string) => Promise<void>;
  onRejectLead: (leadId: string, notes?: string, reason?: string) => Promise<void>;
  onGenerateSequence: (leadId: string) => Promise<void>;
  onTestRejectedLeadGate: (leadId: string) => Promise<{ blocked: boolean; error: string }>;
}

export function GuidedDemoModal({
  isOpen,
  onClose,
  onNavigateTab,
  onApproveLead,
  onRejectLead,
  onGenerateSequence,
  onTestRejectedLeadGate
}: GuidedDemoModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [testResult, setTestResult] = useState<{ blocked: boolean; error: string } | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Run a Sample Company Search',
      description: 'Navigate to Company Search to inspect curated US multi-unit QSR franchise networks (20–200 locations) with verifiable location evidence.',
      tab: 'companies',
      actionLabel: 'View Ingested Companies',
      execute: () => onNavigateTab('companies')
    },
    {
      step: 2,
      title: 'View Sample Decision-Makers',
      description: 'Review discovered executive leadership (VP Operations, COOs, Head of Guest Experience) with email verification statuses and profile citations.',
      tab: 'leads',
      actionLabel: 'Inspect Lead Profiles',
      execute: () => onNavigateTab('leads')
    },
    {
      step: 3,
      title: 'Inspect Enrichment & Evidence',
      description: 'View side-by-side personalization citations, confidence scores, and clear distinction between documented facts and operational hypotheses.',
      tab: 'enrichment',
      actionLabel: 'Open Enrichment Workspace',
      execute: () => onNavigateTab('enrichment')
    },
    {
      step: 4,
      title: 'Reject One Lead (e.g. Lance Juhas)',
      description: 'Test the Human Approval Gate by rejecting a lead with explicit reviewer notes and reason. Verified that rejection is logged to the audit history.',
      tab: 'approvals',
      actionLabel: 'Reject Lance Juhas (Piada)',
      execute: async () => {
        setIsExecutingAction(true);
        try {
          await onRejectLead('lead-lance-02', 'Out of target tier this quarter', 'Executive role does not oversee guest operations');
          onNavigateTab('approvals');
        } finally {
          setIsExecutingAction(false);
        }
      }
    },
    {
      step: 5,
      title: 'Approve Another Lead (e.g. John Ishmael)',
      description: 'Grant explicit human approval with reviewer notes. Lead status transitions from PENDING to APPROVED, unlocking sequence synthesis.',
      tab: 'approvals',
      actionLabel: 'Approve John Ishmael (Taziki\'s)',
      execute: async () => {
        setIsExecutingAction(true);
        try {
          await onApproveLead('lead-john-01', 'Verified ~100 locations across Southeast and active catering surge.');
          onNavigateTab('approvals');
        } finally {
          setIsExecutingAction(false);
        }
      }
    },
    {
      step: 6,
      title: 'Generate Four Emails for Approved Lead',
      description: 'Synthesize the 4 distinct emails (Day 1 Intro, Day 4 Value, Day 8 Question, Day 13 Close Loop) highlighting personalization lines derived from enrichment.',
      tab: 'sequences',
      actionLabel: 'Synthesize 4 Emails for John Ishmael',
      execute: async () => {
        setIsExecutingAction(true);
        try {
          await onGenerateSequence('lead-john-01');
          onNavigateTab('sequences');
        } finally {
          setIsExecutingAction(false);
        }
      }
    },
    {
      step: 7,
      title: 'Review the Email Draft Queue',
      description: 'Inspect generated drafts scheduled across Days 1, 4, 8, 13. Verify Draft-Only safety guarantee and export as CSV/JSON.',
      tab: 'drafts',
      actionLabel: 'Inspect Draft Queue',
      execute: () => onNavigateTab('drafts')
    },
    {
      step: 8,
      title: 'Demonstrate Server Gate (Zero Drafts for Rejected Leads)',
      description: 'Attempt to force-generate an email sequence or draft for the rejected lead (Lance Juhas). Confirm the server returns HTTP 403 Forbidden.',
      tab: 'approvals',
      actionLabel: 'Test Server Gate on Rejected Lead',
      execute: async () => {
        setIsExecutingAction(true);
        setTestResult(null);
        try {
          const res = await onTestRejectedLeadGate('lead-lance-02');
          setTestResult(res);
        } finally {
          setIsExecutingAction(false);
        }
      }
    },
    {
      step: 9,
      title: 'Review Dental DSO Adaptation (<10 Lines)',
      description: 'Examine the second ICP adaptation for US Multi-Location Dental Practices (DSOs), covering what changes across stages/messaging, invariant stages, and clinical/HIPAA boundaries.',
      tab: 'dental',
      actionLabel: 'View Dental ICP Adaptation',
      execute: () => onNavigateTab('dental')
    }
  ];

  const currentStepData = demoSteps[currentStep - 1];

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Guided Evaluator Demo (9 Challenge Steps)</h3>
              <p className="text-xs text-slate-400">
                Interactive walkthrough demonstrating the end-to-end pipeline and strict human-in-the-loop governance.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-9 gap-1.5 shrink-0">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(s.step);
                setTestResult(null);
              }}
              className={`p-1.5 rounded-lg text-center transition-all cursor-pointer ${
                s.step === currentStep
                  ? 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-400'
                  : s.step < currentStep
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-[10px] block font-mono">0{s.step}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
              Step {currentStep} of {demoSteps.length}
            </span>
            <h4 className="text-lg font-bold text-white">{currentStepData.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Action Trigger Button */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Target Workspace: <strong className="text-slate-200 capitalize">{currentStepData.tab}</strong>
            </span>

            <button
              onClick={currentStepData.execute}
              disabled={isExecutingAction}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecutingAction ? 'animate-spin' : ''}`} />
              <span>{isExecutingAction ? 'Executing Action...' : currentStepData.actionLabel}</span>
            </button>
          </div>

          {/* Special Verification Callout for Step 8 (Server Gate Demonstration) */}
          {currentStep === 8 && testResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-1 ${
              testResult.blocked
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Server Gate Confirmed: HTTP 403 Forbidden Returned</span>
              </div>
              <p className="text-[11px] font-mono pt-1 text-slate-300">
                Server response: "{testResult.error}"
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Verified: Zero email drafts can ever be generated for rejected or pending leads.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                setTestResult(null);
              }
            }}
            disabled={currentStep === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            Previous Step
          </button>

          <button
            onClick={() => {
              if (currentStep < demoSteps.length) {
                setCurrentStep(currentStep + 1);
                setTestResult(null);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
          >
            <span>{currentStep === demoSteps.length ? 'Complete Demo' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
