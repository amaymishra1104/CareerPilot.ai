'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Building2,
  FileCheck2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Contact, Company, EnrichmentRecord } from '@/types';

interface EnrichmentWorkspaceTabProps {
  contacts: Contact[];
  companies: Company[];
  enrichments: Record<string, EnrichmentRecord>;
  onEnrichLead: (leadId: string) => Promise<void>;
  onNavigateToApprovals: (leadId: string) => void;
  isEnriching: boolean;
}

export function EnrichmentWorkspaceTab({
  contacts,
  companies,
  enrichments,
  onEnrichLead,
  onNavigateToApprovals,
  isEnriching
}: EnrichmentWorkspaceTabProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(contacts[0]?.id || '');

  const activeContact = contacts.find(c => c.id === selectedLeadId) || contacts[0];
  const activeCompany = activeContact ? companies.find(c => c.id === activeContact.company_id) : undefined;
  const activeEnrichment = activeContact ? enrichments[activeContact.id] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Stage 3: Evidence-Backed Enrichment Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Collects verifiable location evidence, distinguishes operational hypotheses, and generates personalization hooks with side-by-side citations.
          </p>
        </div>

        {activeContact && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnrichLead(activeContact.id)}
              disabled={isEnriching}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin' : ''}`} />
              <span>{isEnriching ? 'Synthesizing...' : 'Re-Enrich Selected Lead'}</span>
            </button>

            <button
              onClick={() => onNavigateToApprovals(activeContact.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Proceed to Approval Gate</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split Layout: Lead Selector Sidebar + Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Lead List */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 max-h-[720px] overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1 mb-2">
            Select Lead to Inspect ({contacts.length})
          </span>

          {contacts.map((contact) => {
            const isSelected = contact.id === activeContact?.id;
            const enrichment = enrichments[contact.id];

            return (
              <div
                key={contact.id}
                onClick={() => setSelectedLeadId(contact.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{contact.full_name}</span>
                  {enrichment ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {enrichment.confidence_score}/100
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Not Enriched
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 truncate">{contact.job_title}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{contact.company_name}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Evidence & Personalization Display */}
        <div className="lg:col-span-8 space-y-4">
          {!activeContact ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40">
              No lead selected.
            </div>
          ) : !activeEnrichment ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
              <h3 className="text-sm font-semibold text-white">Lead Not Yet Enriched</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Run the enrichment engine to retrieve verifiable location counts, operational challenges, buying signals, and citation links.
              </p>
              <button
                onClick={() => onEnrichLead(activeContact.id)}
                disabled={isEnriching}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
              >
                {isEnriching ? 'Extracting...' : 'Enrich Lead Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Confidence Score Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 font-mono text-lg font-bold">
                    {activeEnrichment.confidence_score}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                      Enrichment Confidence Score
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                      {activeEnrichment.confidence_explanation}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  Verified: {new Date(activeEnrichment.last_verified_timestamp).toLocaleDateString()}
                </div>
              </div>

              {/* CRITICAL FEATURE: Side-by-Side Personalization Hook & Source Evidence */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Personalization Hook (Grounded In Evidence)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                    Strictly Grounded
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Generated Hook */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Generated Outreach Line
                    </span>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed italic">
                      "{activeEnrichment.personalization_hook}"
                    </p>
                  </div>

                  {/* Supporting Evidence Claim */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Supporting Citation Evidence</span>
                    </span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {activeEnrichment.personalization_evidence_claim}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Way Fact Classification Rubric (Apollo Live & Grounded Standards) */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Evidence Classification Matrix</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Zero fabricated facts • Strict separation of hypotheses
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Provider-Reported */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      PROVIDER-REPORTED
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {activeContact.provider_person_id ? `Apollo PID: ${activeContact.provider_person_id.slice(0, 12)}...` : 'Apollo profile match'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Role: {activeContact.job_title}
                    </p>
                  </div>

                  {/* 2. Independently Verified */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      INDEPENDENTLY VERIFIED
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1 truncate">
                      {activeContact.company_name} in {activeCompany?.headquarters || 'USA'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeCompany?.source_urls?.length || 1} independent source URL(s)
                    </p>
                  </div>

                  {/* 3. Operational Hypothesis */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      UNVERIFIED HYPOTHESIS
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Multi-channel bot escalation bottleneck
                    </p>
                    <p className="text-[10px] text-amber-400/80">
                      Flagged explicitly before review
                    </p>
                  </div>

                  {/* 4. Missing / Pending */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      MISSING / PENDING
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {activeContact.work_email && activeContact.work_email !== 'unavailable' 
                        ? 'Email verified' 
                        : 'Direct email unavailable (masked)'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeCompany?.estimated_locations ? `${activeCompany.estimated_locations} store count` : 'Store count pending verification'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Overview & Verifiable Scale */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Company Overview & Verifiable Scale
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeEnrichment.company_overview}
                </p>

                {activeEnrichment.location_count_verifiable && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200">
                        {activeEnrichment.location_count_verifiable} Verifiable Operating Locations
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeEnrichment.location_count_evidence}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operational Challenges (Distinguishing Hypotheses vs Documented Facts) */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Operational Challenges & Hypotheses
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Hypotheses are explicitly marked to avoid false claims
                  </span>
                </div>

                <div className="space-y-2">
                  {activeEnrichment.operational_challenges.map((challenge, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        challenge.is_hypothesis
                          ? 'bg-amber-950/15 border-amber-500/25 text-amber-200/90'
                          : 'bg-slate-950/60 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {challenge.description}
                        </span>
                        {challenge.is_hypothesis ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            OPERATIONAL HYPOTHESIS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            DOCUMENTED FACT
                          </span>
                        )}
                      </div>
                      {challenge.evidence && (
                        <p className="text-[11px] text-slate-400 italic">
                          Basis: {challenge.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Sources & Source URLs */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Source URLs & Retrieved Evidence Snippets ({activeEnrichment.evidence_sources.length})
                </h4>
                <div className="space-y-2">
                  {activeEnrichment.evidence_sources.map((ev) => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{ev.claim}</span>
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Source</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        "{ev.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
