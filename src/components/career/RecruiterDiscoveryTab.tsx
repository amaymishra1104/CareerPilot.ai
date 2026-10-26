'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  Building, 
  Mail, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import { JobListing, RecruiterContact } from '@/types';

interface RecruiterDiscoveryTabProps {
  jobs: JobListing[];
  contacts: RecruiterContact[];
  onDiscoverContacts: (jobId: string) => Promise<any>;
  onSelectContactForEmail: (contact: RecruiterContact, job: JobListing) => void;
  isDiscovering: boolean;
}

export function RecruiterDiscoveryTab({
  jobs,
  contacts,
  onDiscoverContacts,
  onSelectContactForEmail,
  isDiscovering
}: RecruiterDiscoveryTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const jobContacts = contacts.filter(c => c.job_id === selectedJobId || c.company.toLowerCase() === currentJob?.company.toLowerCase());

  const handleDiscover = async () => {
    if (!currentJob) return;
    try {
      await onDiscoverContacts(currentJob.id);
    } catch (err: any) {
      alert(`Recruiter discovery error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Recruiter &amp; Hiring Contact Discovery</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Identify technical recruiters, early-career recruiting leads, and hiring managers for your target company.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Sources Only • Zero Fabricated Contacts</span>
          </span>
        </div>
      </div>

      {/* Opportunity Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex-1 w-full sm:w-auto space-y-1">
          <label className="text-slate-700 font-semibold">Select Target Job Opening</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.company} ({j.location})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
          <span>{isDiscovering ? 'Searching Apollo & Directories...' : 'Discover Hiring Contacts'}</span>
        </button>
      </div>

      {/* Discovered Contacts Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Discovered Contacts for {currentJob?.company} ({jobContacts.length})
        </div>

        {jobContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobContacts.map(contact => (
              <div 
                key={contact.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{contact.name}</h2>
                      <div className="text-xs text-indigo-700 font-semibold mt-0.5">{contact.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{contact.company}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      contact.source_provider === 'apollo' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}>
                      {contact.source_provider === 'apollo' ? 'APOLLO LIVE' : 'CAREERS DIRECTORY'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Routing Address: {contact.email && contact.email !== 'unavailable' ? contact.email : 'Gated to Test Inbox (Test Mode)'}
                      </span>
                    </div>
                    {contact.verification_notes && (
                      <div className="text-[11px] text-slate-600 pt-1 font-medium">
                        {contact.verification_notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {contact.public_profile_url ? (
                    <a
                      href={contact.public_profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                    >
                      <span>Public Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span />}

                  <button
                    onClick={() => onSelectContactForEmail(contact, currentJob)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    <span>Generate Outreach</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <p>No contacts resolved yet for {currentJob?.company}.</p>
            <button
              onClick={handleDiscover}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs cursor-pointer transition-colors"
            >
              Discover Hiring Contacts Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
