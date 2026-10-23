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
  RefreshCw,
  Info,
  Check
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
  const [locationFilter, setLocationFilter] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchCompanies({
      query: query.trim() || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: locationFilter.trim() || undefined,
      buyingSignal: selectedSignal !== 'all' ? selectedSignal : undefined
    });
  };

  const getSourceBadge = (comp: Company) => {
    if (comp.source_provider === 'apollo' || comp.provenance === 'live') {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            APOLLO LIVE
          </span>
          {comp.provider_company_id && (
            <span className="text-[9px] font-mono text-slate-400">
              ID: {comp.provider_company_id.slice(0, 10)}...
            </span>
          )}
        </div>
      );
    }
    if (comp.provenance === 'manually_sourced') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
          MANUAL CSV
        </span>
      );
    }
    if (comp.provenance === 'real_curated') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
          CURATED BASELINE
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
        DEMO DATA
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Stage 1: US QSR Company Search (Apollo.io)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Discovers real US quick-service and fast-casual restaurant groups. Differentiates Apollo employee headcount from restaurant location counts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setSelectedSignal('all');
                setLocationFilter('');
                onSearchCompanies({});
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Reset search filters to show all ingested companies"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching Apollo...' : 'Search Companies'}</span>
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
                placeholder="Search company name, brand (e.g. Taziki's, Sweetgreen)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Location (e.g. United States, Texas)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
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
        </form>

        {/* Notice regarding Apollo Employee Count vs Restaurant Locations */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Data Integrity Notice:</strong> Apollo.io returns employee headcount, which is distinct from physical restaurant store locations. Store counts without independent verification are marked &quot;Unknown / Verification Required&quot; to prevent data fabrication.
          </span>
        </div>
      </div>

      {/* Companies Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {companies.length} Companies Discovered &amp; Tracked
          </span>
          <span className="text-[11px] text-slate-400">
            Live Apollo entries labeled with provider ID &amp; retrieval timestamp
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">No restaurant companies found with current search filters.</p>
            <button
              onClick={() => {
                setQuery('');
                setLocationFilter('');
                setSelectedCategory('all');
                onSearchCompanies({});
              }}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Show all ingested companies
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Company &amp; Domain</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Headcount (Employees)</th>
                  <th className="py-3 px-4">Store Footprint</th>
                  <th className="py-3 px-4">Headquarters</th>
                  <th className="py-3 px-4">Source / Provider</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((comp) => {
                  const hasVerifiedStores = typeof comp.estimated_locations === 'number' && comp.estimated_locations > 0;
                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{comp.name}</span>
                        </div>
                        {comp.website && (
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{comp.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize text-[11px] border border-slate-700">
                          {comp.restaurant_category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {comp.employee_count ? (
                          <div className="font-mono text-slate-200">
                            {comp.employee_count} employees
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not reported</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {hasVerifiedStores ? (
                          <div>
                            <span className="font-mono font-semibold text-slate-200">
                              {comp.estimated_locations} units
                            </span>
                            <div className="text-[10px] text-emerald-400">
                              {comp.estimated_locations >= 20 && comp.estimated_locations <= 200 ? 'ICP Target (20-200)' : 'Verified count'}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            Unknown (Needs Check)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{comp.headquarters}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getSourceBadge(comp)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onFindLeadsForCompany(comp.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Discover real decision-makers via Apollo"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Discover People</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
