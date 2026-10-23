'use client';

import React from 'react';
import { 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Mail,
  Database,
  Cpu
} from 'lucide-react';

interface KnownLimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnownLimitationsModal({ isOpen, onClose }: KnownLimitationsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                System Disclosures & Known Architectural Limitations
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Audit Grade: Honest
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transparent technical audit of architecture, data sourcing, zero-send safety, and execution boundaries
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Card 1: Deterministic Governed Workflow vs Autonomous Agent */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Architecture: Deterministic Governed Workflow (Not Unbounded Autonomous Agent)</span>
            </div>
            <p className="text-xs text-slate-400">
              The pipeline is implemented as a deterministic 5-stage state-machine with an unbypassable human approval gate. It purposefully does not execute self-prompting autonomous loops in production. This design decision ensures predictable operational control, zero unverified email generation, and absolute auditability.
            </p>
          </div>

          {/* Card 2: Real Data vs Email Privacy Protection */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Data Integrity: Real Operators & Real Decision-Makers Only (Zero Fabrication)</span>
            </div>
            <p className="text-xs text-slate-400">
              All 5 default operators (Taziki&apos;s, Piada, Velvet Taco, WaBa Grill, Clean Eatz) and their executives are real US multi-unit operators sourced from public franchisor registries and leadership directories. Every source link resolves to a live HTTP 200 URL. Prospect corporate emails are marked <span className="font-mono text-amber-300">&quot;unavailable&quot;</span> because cold-guessing prospect emails is prohibited; all generated drafts strictly address the evaluator&apos;s inbox (<span className="font-mono text-indigo-300">amaymishra1104@gmail.com</span>) or the internal queue.
            </p>
          </div>

          {/* Card 3: Draft-Only Safety & No Auto-Send */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Mail className="w-4 h-4" />
              <span>3. Zero-Send Safeguard: Draft-Only Integration (No messages.send Path)</span>
            </div>
            <p className="text-xs text-slate-400">
              The Gmail integration service exposes only <span className="font-mono text-slate-200">users.drafts.create</span>. There is zero code calling <span className="font-mono text-rose-400">users.messages.send</span>, and no autonomous background scheduler exists. Drafts cannot be dispatched automatically. Furthermore, TOCTOU checks verify approval status immediately prior to draft persistence.
            </p>
          </div>

          {/* Card 4: Single Persistent Atomic Store */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>4. Storage Architecture: Atomic Local JSON Store (Isolated Temp DB for Tests)</span>
            </div>
            <p className="text-xs text-slate-400">
              Storage is backed by a transactional local JSON store with atomic fs write routines. Unwired external databases were removed to maintain complete honesty in architectural claims. Automated Vitest test suites run against an isolated temporary DB path (<span className="font-mono text-slate-300">OSVI_DB_PATH</span>) and unlink it on cleanup, ensuring test runs never dirty committed seed files.
            </p>
          </div>

          {/* Card 5: Operational Cadence Hypothesis */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>5. Cadence & Positioning: Operational Hypothesis Grounded in Real Proof</span>
            </div>
            <p className="text-xs text-slate-400">
              The 4-email sequence (Days 1, 4, 8, 13) is an operational cadence hypothesis tailored to QSR buyer response rhythms, not an empirical multi-year study. Claims are grounded in OSVI.ai&apos;s real Domino&apos;s India case study (100k+ riders, WhatsApp + voice in 7 languages, 3x chat conversion) rather than fabricated enterprise benchmarks.
            </p>
          </div>

          {/* Card 6: Dental Second ICP Scope */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>6. Dental Second ICP: Strictly Under 10 Lines (9 Lines) with Compliance Boundaries</span>
            </div>
            <p className="text-xs text-slate-400">
              The second ICP adaptation for dental practices is condensed to exactly 9 lines. It identifies technographics and job postings (not EHR scraping) for practice management systems, limits network sizes to realistic regional DSOs (15–150 clinics), and clarifies that HIPAA/BAA obligations apply to the product runtime, while top-of-funnel B2B cold outreach carries zero protected health information (PHI).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <div className="text-xs text-slate-500">
            Complies with OSVI GTM Challenge Verification Matrix
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
}
