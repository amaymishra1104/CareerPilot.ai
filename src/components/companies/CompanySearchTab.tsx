'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Upload, 
  ExternalLink, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  Globe,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Company, ICPConfig, Provenance } from '@/types';
import { CsvImportModal } from './CsvImportModal';

interface CompanySearchTabProps {
  companies: Company[];
  icp: ICPConfig;
  onSearchCompanies: (filters: any) => Promise<void>;
  onImportCsv: (csvText: string) => Promise<any>;
  onFindLeadsForCompany: (companyId: string) => void;
  isSearching: boolean;
}

export function CompanySearchTab({
  companies,
  icp,
  onSearchCompanies,
  onImportCsv,
  onFindLeadsForCompany,
  isSearching
}: CompanySearchTabProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSignal, setSelectedSignal] = useState('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchCompanies({
      query,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      buyingSignal: selectedSignal !== 'all' ? selectedSignal : undefined
    });
  };

  const getProvenanceBadge = (prov: Provenance) => {
    switch (prov) {
      case 'live':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            LIVE INTEL
          </span>
        );
      case 'manually_sourced':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
            MANUAL CSV
          </span>
        );
      case 'demo':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            DEMO DATA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Stage 1: US QSR Company Search</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies US multi-unit quick-service and fast-casual groups matching the ICP location sweet-spot (20–200 units).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import via CSV</span>
            </button>

            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setSelectedSignal('all');
                onSearchCompanies({});
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Reset search filters to show all ingested companies"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching...' : 'Run Company Search'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company name, brand, or headquarters..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Restaurant Categories</option>
              {icp.restaurantCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Buying Signals</option>
              {icp.buyingSignals.map(sig => (
                <option key={sig} value={sig}>{sig}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Companies Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {companies.length} Companies Ingested
          </span>
          <span className="text-[11px] text-slate-400">
            All records maintain full provenance tracking & verified sources
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">No companies found matching current filters.</p>
            <button
              onClick={() => handleSearch()}
              className="text-xs text-indigo-400 hover:underline"
            >
              Run search with default criteria
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Company & Web</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Locations</th>
                  <th className="py-3 px-4">Headquarters</th>
                  <th className="py-3 px-4">Buying Signals</th>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{comp.name}</span>
                      </div>
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{comp.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize text-[11px] border border-slate-700">
                        {comp.restaurant_category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-200">
                        {comp.estimated_locations} units
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {comp.estimated_locations >= 20 && comp.estimated_locations <= 200 ? 'ICP Match' : 'Out of range'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{comp.headquarters}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {comp.buying_signals.map((sig, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getProvenanceBadge(comp.provenance)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onFindLeadsForCompany(comp.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                        title="Discover executive decision makers at this company"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Find Leads</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportCsv={onImportCsv}
      />
    </div>
  );
}
