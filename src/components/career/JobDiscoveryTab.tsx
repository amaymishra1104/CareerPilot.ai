'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Plus, 
  Filter, 
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { JobListing, Provenance } from '@/types';

interface JobDiscoveryTabProps {
  jobs: JobListing[];
  onSearchLive: (provider: string, query: string) => Promise<any>;
  onImportCsv: (csvText: string) => Promise<any>;
  onAddManualJob: (job: any) => Promise<any>;
  onSelectJobForMatching: (job: JobListing) => void;
  isSearching: boolean;
}

export function JobDiscoveryTab({
  jobs,
  onSearchLive,
  onImportCsv,
  onAddManualJob,
  onSelectJobForMatching,
  isSearching
}: JobDiscoveryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'remotive' | 'arbeitnow' | 'demo'>('all');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [csvInput, setCsvInput] = useState('');

  // Filter State
  const [filterKeyword, setFilterKeyword] = useState('');

  // Manual Job Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualLocation, setManualLocation] = useState('Remote');
  const [manualDesc, setManualDesc] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualSkills, setManualSkills] = useState('');

  const filteredJobs = jobs.filter(j => {
    if (!filterKeyword) return true;
    const kw = filterKeyword.toLowerCase();
    return (
      j.title.toLowerCase().includes(kw) ||
      j.company.toLowerCase().includes(kw) ||
      j.location.toLowerCase().includes(kw) ||
      j.required_skills.some(s => s.toLowerCase().includes(kw))
    );
  });

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearchLive(selectedProvider, searchQuery);
  };

  const submitCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) {
      alert('Please paste valid CSV content.');
      return;
    }
    try {
      const res = await onImportCsv(csvInput);
      if (res.jobs) {
        setShowCsvModal(false);
        setCsvInput('');
        alert(`Successfully imported and deduplicated ${res.imported} job openings!`);
      }
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    }
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualCompany || !manualDesc) {
      alert('Please provide title, company, and job description.');
      return;
    }

    try {
      await onAddManualJob({
        title: manualTitle,
        company: manualCompany,
        location: manualLocation,
        description: manualDesc,
        job_url: manualUrl,
        required_skills: manualSkills ? manualSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined
      });
      setShowManualModal(false);
      setManualTitle('');
      setManualCompany('');
      setManualDesc('');
      setManualUrl('');
      setManualSkills('');
    } catch (err: any) {
      alert(`Failed to add job: ${err.message}`);
    }
  };

  const getProvenanceBadge = (prov: Provenance) => {
    switch (prov) {
      case 'live':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">LIVE API</span>;
      case 'real_public_web':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold">CAREER BOARD</span>;
      case 'csv_imported':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-semibold">CSV IMPORT</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">VERIFIED DEMO</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <span>Real Job Discovery &amp; Crawling</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Query live developer job feeds (Remotive, Arbeitnow), import company postings via CSV, or enter job URLs. All openings are automatically deduplicated.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600" />
            <span>Add Single Job</span>
          </button>
        </div>
      </div>

      {/* Live Provider Search Bar */}
      <form onSubmit={handleLiveSearch} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live openings by role, stack or keyword (e.g., Next.js, Python, Full Stack)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Live Providers (Remotive + Arbeitnow)</option>
            <option value="remotive">Remotive Live Tech API</option>
            <option value="arbeitnow">Arbeitnow Global Board API</option>
            <option value="demo">Curated Real Dataset</option>
          </select>

          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Fetching Feeds...' : 'Discover Openings'}</span>
          </button>
        </div>
      </form>

      {/* Filter & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{filteredJobs.length}</span>
          <span>openings in database</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-semibold">Automatic deduplication active</span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="Filter list by company, skill or city..."
            className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[11px]"
          />
        </div>
      </div>

      {/* Jobs Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug">{job.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-indigo-700">{job.company}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{job.location}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {getProvenanceBadge(job.provenance)}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.required_skills.slice(0, 5).map(skill => (
                  <span 
                    key={skill}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                Source: {job.data_source}
              </div>

              <div className="flex items-center gap-2">
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Open official job URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onSelectJobForMatching(job)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-[11px] cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Match &amp; Tailor</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Bulk Import Job Listings (CSV)</span>
              </h2>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Paste comma-separated rows. Required header columns: <code className="text-indigo-600 font-mono font-semibold">Title,Company,Location,Description,Skills,URL</code></p>
            </div>

            <form onSubmit={submitCsv} className="space-y-4 text-xs">
              <textarea
                rows={8}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Title,Company,Location,Description,Skills,URL&#10;Software Engineer Intern,Stripe,San Francisco,Distributed systems in TypeScript,TypeScript;Go;PostgreSQL,https://stripe.com/jobs/1&#10;Junior Fullstack Dev,Vercel,Remote,Frontend DX with Next.js,Next.js;React;TypeScript,https://vercel.com/careers/2"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Import Listings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Single Job Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Add Single Job Listing</span>
              </h2>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={submitManual} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Job Title *</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Company *</label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="e.g. OpenAI"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Location</label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, CA"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Job Posting URL</label>
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://company.com/careers/listing"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Required Skills (Comma-Separated)</label>
                <input
                  type="text"
                  value={manualSkills}
                  onChange={(e) => setManualSkills(e.target.value)}
                  placeholder="e.g. TypeScript, React, PostgreSQL, Docker"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Job Description / Requirements *</label>
                <textarea
                  rows={4}
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Paste job posting details..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[11px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
