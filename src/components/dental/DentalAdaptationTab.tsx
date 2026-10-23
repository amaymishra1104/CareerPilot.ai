'use client';

import React from 'react';
import { 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  SendHorizontal, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Layers,
  HeartPulse,
  Copy,
  Check
} from 'lucide-react';

export function DentalAdaptationTab() {
  const [copied, setCopied] = React.useState(false);

  const nineLineAnswer = [
    "1. Target ICP: US Dental Service Organizations (DSOs) & regional practice networks (15–150 clinics; e.g. regional group practices).",
    "2. Target Roles: Chief Operating Officer, VP of Clinical Operations, VP/Director of Patient Experience, Director of Practice Operations.",
    "3. Buying Signals: M&A clinic integrations, multi-location front-desk hiring, online booking friction, and hygiene recall leakage.",
    "4. Stage 1 (Search): Queries state dental board registries and DSO directories filtering by 15–150 clinic count instead of restaurant franchisee lists.",
    "5. Stage 2 (Leads): Targets clinical operations and patient experience executives instead of store operations directors.",
    "6. Stage 3 (Enrichment): Detects practice management software (Dentrix/Eaglesoft) via job postings and technographics (not EHR scraping).",
    "7. Stage 4 (Approval): 100% UNCHANGED — Mandatory human review gate, evidence auditing, and duplicate prevention remain identical.",
    "8. Stage 5 (Outreach): 4-email cadence (Days 1, 4, 8, 13) and draft-only queue addressing amaymishra1104@gmail.com remain 100% UNCHANGED.",
    "9. Messaging & Compliance: Shifts to patient intake and recall loops; product requires HIPAA/BAA boundaries (cold email itself has no PHI)."
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(nineLineAnswer.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const comparisonRows = [
    {
      stage: '1. Company Search',
      qsrCurrent: 'US QSR & Fast-Casual restaurant franchisee networks (20–200 locations).',
      dentalAdaptation: 'US Dental Service Organizations (DSOs) & Multi-Location Dental Practices (15–150 clinics) such as regional DSO platforms and group practices.',
      changed: true
    },
    {
      stage: '2. Lead Search',
      qsrCurrent: 'COO, VP of Operations, Head of Guest Experience, VP of Customer Experience, Head of Contact Center.',
      dentalAdaptation: 'COO, VP of Clinical Operations, Head of Patient Experience, Director of Practice Operations, Chief Revenue Officer (Dental Group level).',
      changed: true
    },
    {
      stage: '3. Enrichment Engine',
      qsrCurrent: 'Drive-thru throughput bottlenecks, order customization errors, curbside arrival desynchronization, catering inquiry volume.',
      dentalAdaptation: 'De novo practice clinic expansion, practice acquisitions (M&A integration), appointment backlog, patient intake friction, hygiene recall drop-off rates.',
      changed: true
    },
    {
      stage: '4. Human Approval Gate',
      qsrCurrent: 'Strict human sign-off on evidence, store location verifications, and operational challenges before sequence generation.',
      dentalAdaptation: '100% UNCHANGED. Human verification remains mandatory. Recheck practice counts, executive titles, and compliance status.',
      changed: false
    },
    {
      stage: '5. Email Outreach',
      qsrCurrent: 'Focus on multi-agent journey orchestration above standalone voice/chat bots for multi-unit restaurant workflows.',
      dentalAdaptation: 'Focus on Journey coordinating routine appointment reminders, intake, and recall loops — strictly routing clinical triage to licensed staff. (Product requires HIPAA/BAA; cold email outreach contains no PHI).',
      changed: true
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border border-teal-500/25 space-y-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">
            ICP Adaptation: US Multi-Location Dental Groups & DSOs
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Comparative architectural blueprint demonstrating how the OSVI.ai Journey pipeline adapts from Quick-Service Restaurants to Multi-Location Dental Practices.
        </p>
      </div>

      {/* Official 10-Line Submission Answer Card */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-teal-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
              Assignment Requirement #4
            </span>
            <span className="text-xs font-bold text-white">
              Official Submission Response (Exactly 9 Lines — Under 10 Lines)
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-md transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy 9-Line Answer'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-[11.5px] leading-relaxed text-slate-200">
          {nineLineAnswer.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-teal-400 font-bold shrink-0">{line.slice(0, 3)}</span>
              <span className="text-slate-300">{line.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Pipeline Stage Comparison: QSR vs. Dental Practice Groups
          </span>
          <span className="text-[11px] text-teal-400 font-mono">
            Architectural Invariance Analysis
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {comparisonRows.map((row, idx) => (
            <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 hover:bg-slate-800/20 transition-colors">
              <div className="md:col-span-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{row.stage}</span>
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  row.changed ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {row.changed ? 'DOMAIN ADAPTED' : 'STAGE UNCHANGED'}
                </span>
              </div>

              <div className="md:col-span-4 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                  QSR Baseline
                </span>
                <p className="leading-snug">{row.qsrCurrent}</p>
              </div>

              <div className="md:col-span-5 text-xs text-slate-200 bg-teal-950/20 p-2.5 rounded-xl border border-teal-500/20">
                <span className="text-[10px] font-bold text-teal-400 uppercase block mb-0.5">
                  Dental Practice Group (DSO) Adaptation
                </span>
                <p className="leading-snug">{row.dentalAdaptation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Invariant Stages Callout */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Which Pipeline Stages Remain 100% Invariant?</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The underlying technical architecture of the OSVI.ai automation platform requires <strong>zero structural rewrites</strong> to serve dental practice groups:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-slate-200 block">Deduplication Logic</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Person-level and practice-level deduplication operates on identical corporate identity checks.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-slate-200 block">Stage 4 Approval Gate</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Human sign-off remains strictly enforced at the API layer. No draft can ever be created for unapproved leads.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-slate-200 block">Draft-Only Safety Protocol</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Cadence (Days 1, 4, 8, 13) and draft-only creation in Gmail remain intact to ensure safe operator review.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Healthcare Safety & Compliance Callout */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Critical Healthcare Safety & PHI Boundaries
          </h3>
        </div>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            When deploying OSVI.ai Journey in dental environments, two non-negotiable boundaries govern the orchestration layer:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>Strict Clinical Diagnosis Boundaries:</strong> Journey orchestrates <em>operational</em> workflows (appointment booking, rescheduling, insurance card collection, hygiene re-care sequences). It must NEVER perform clinical triage or diagnostic assessments — any medical inquiry is instantly escalated to licensed dental staff.
            </li>
            <li>
              <strong>HIPAA & PHI Protection:</strong> All prospect outreach and automated patient communication pathways must enforce end-to-end encryption, Zero-Data Retention (ZDR) on LLM inferences, and complete Business Associate Agreement (BAA) compliance.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
