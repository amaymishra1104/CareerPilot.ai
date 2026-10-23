'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ShieldCheck,
  Building2,
  Globe
} from 'lucide-react';
import { Contact, Company, EmailVerificationStatus, Provenance } from '@/types';

interface LeadSearchTabProps {
  contacts: Contact[];
  companies: Company[];
  onEnrichLead: (leadId: string) => Promise<void>;
  onNavigateToApprovals: (leadId: string) => void;
  onSearchLeadsForCompany: (companyId: string) => Promise<void>;
  isEnriching: boolean;
}

export function LeadSearchTab({
  contacts,
  companies,
  onEnrichLead,
  onNavigateToApprovals,
  onSearchLeadsForCompany,
  isEnriching
}: LeadSearchTabProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredContacts = contacts.filter(c => {
    const matchesComp = selectedCompanyId === 'all' || c.company_id === selectedCompanyId;
    const matchesSearch = !searchFilter.trim() || 
      c.full_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.job_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesComp && matchesSearch;
  });

  const getEmailStatusBadge = (status: EmailVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            VERIFIED
          </span>
        );
      case 'unverified':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            UNVERIFIED
          </span>
        );
      case 'unavailable':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Stage 2: Decision-Maker Discovery (Lead Search)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies VP of Operations, COOs, and Customer Experience heads. Deduplicates strictly by email and executive name.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Ingested Companies ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {selectedCompanyId !== 'all' && (
              <button
                onClick={() => onSearchLeadsForCompany(selectedCompanyId)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Scan Executives
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter leads by executive name, title, or company..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {filteredContacts.length} Decision-Makers Identified
          </span>
          <span className="text-[11px] text-slate-400">
            Unknown emails remain unavailable (never fabricated)
          </span>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">No decision-makers found with current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Executive Name</th>
                  <th className="py-3 px-4">Title & Company</th>
                  <th className="py-3 px-4">Work Email & Status</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContacts.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{lead.full_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lead.professional_profile_url && (
                          <a
                            href={lead.professional_profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Executive Profile</span>
                          </a>
                        )}
                        <a
                          href={lead.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Source URL</span>
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{lead.job_title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{lead.company_name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {lead.work_email ? (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-200">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{lead.work_email}</span>
                          {getEmailStatusBadge(lead.email_verification_status)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                          <span>Email unavailable</span>
                          {getEmailStatusBadge('unavailable')}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.approval_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        lead.approval_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {lead.approval_status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.provenance === 'live' ? 'bg-emerald-500/15 text-emerald-300' :
                        lead.provenance === 'manually_sourced' ? 'bg-indigo-500/15 text-indigo-300' :
                        'bg-amber-500/15 text-amber-300'
                      }`}>
                        {lead.provenance.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEnrichLead(lead.id)}
                          disabled={isEnriching}
                          className="px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Run evidence extraction and personalization synthesis"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Enrich</span>
                        </button>

                        <button
                          onClick={() => onNavigateToApprovals(lead.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
