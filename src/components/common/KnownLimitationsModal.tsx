'use client';

import React from 'react';
import { 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                System Disclosures &amp; Architectural Guardrails
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
                  Audit Grade: Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Transparent technical audit of architecture, data sourcing, zero-send safety, and resume integrity
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Card 1: Zero Email Sending */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>1. Zero Automatic Email Sending (Drafts Only in Test Inbox)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The application contains zero code calling Gmail send endpoints (<code className="text-rose-600 font-mono font-semibold">users.messages.send</code> or <code className="text-rose-600 font-mono font-semibold">users.drafts.send</code>). All outreach generation creates drafts strictly within the operator test inbox (<code className="text-indigo-600 font-mono font-semibold">amaymishra1104@gmail.com</code>). No email is ever dispatched without manual operator review.
            </p>
          </div>

          {/* Card 2: Factual Resume Integrity */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Strict Factual Resume Tailoring (Zero Hallucination Guarantee)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tailoring permits reordering projects, active verb polishing, and emphasizing demonstrated skills. It is architecturally prohibited from fabricating skills, certifications, employment dates, degrees, or metrics. Any unmet job requirements are explicitly reported in validation warnings and omitted.
            </p>
          </div>

          {/* Card 3: Real Data Sources & Apollo Hybrid Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>3. Authorized Data Feeds &amp; Public API Providers</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Job discovery queries authorized free feeds (Remotive API, Arbeitnow API) and permitted public postings. Recruiter discovery connects to Apollo.io for live people searches with official careers portal fallbacks. It never fabricates recruiters or emails.
            </p>
          </div>

          {/* Card 4: Data Isolation & SaaS Readiness */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <Database className="w-4 h-4 text-purple-600" />
              <span>4. Storage Architecture: Atomic Store with User-Level Partitioning</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Resume profiles, preference records, and application statuses are user-partitioned with unique identifiers and private filesystem access control, ready for seamless multi-user SaaS database migration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="text-xs text-slate-500">
            CareerPilot AI Architectural Safeguards
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
}
