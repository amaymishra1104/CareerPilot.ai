'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Clock 
} from 'lucide-react';
import { JobApplicationRecord, ApplicationStatus } from '@/types';

interface ApplicationTrackerTabProps {
  applications: JobApplicationRecord[];
  onUpdateStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<any>;
}

export function ApplicationTrackerTab({
  applications,
  onUpdateStatus
}: ApplicationTrackerTabProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchKw, setSearchKw] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const STATUSES: ApplicationStatus[] = [
    'Discovered',
    'Matched',
    'Resume Tailored',
    'Awaiting Review',
    'Draft Created',
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Withdrawn'
  ];

  const filtered = applications.filter(a => {
    if (!searchKw) return true;
    const kw = searchKw.toLowerCase();
    return a.company.toLowerCase().includes(kw) || 
           a.role.toLowerCase().includes(kw) || 
           a.status.toLowerCase().includes(kw);
  });

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await onUpdateStatus(id, newStatus);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const app = applications.find(a => a.id === id);
      if (app) {
        await onUpdateStatus(id, app.status, notesInput);
        setEditingNotesId(null);
      }
    } catch (err: any) {
      alert(`Save notes failed: ${err.message}`);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Discovered': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Matched': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Resume Tailored': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Awaiting Review': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Draft Created': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Applied': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Interview': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Offer': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Rejected': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <span>Job Application Lifecycle Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track opportunities across 10 stages from initial discovery to interviews and offers. Prevents duplicate applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKw}
            onChange={(e) => setSearchKw(e.target.value)}
            placeholder="Search tracked applications by company or role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
          />
        </div>

        <div className="text-slate-500 text-xs">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> active applications
        </div>
      </div>

      {/* View Mode 1: Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUSES.map(colStatus => {
            const colApps = filtered.filter(a => a.status === colStatus);
            return (
              <div
                key={colStatus}
                className="w-72 shrink-0 rounded-2xl bg-slate-50/70 border border-slate-200/90 p-3.5 flex flex-col gap-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">{colStatus}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colApps.map(app => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{app.role}</div>
                          <div className="text-indigo-700 text-[11px] font-semibold mt-0.5">{app.company}</div>
                        </div>

                        {app.match_score && (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {app.match_score}%
                          </span>
                        )}
                      </div>

                      {/* Status Transition Select */}
                      <div className="pt-1">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="w-full text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes / Follow-up */}
                      {app.follow_up_reminder_date && (
                        <div className="text-[10px] text-amber-800 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Follow-up: {new Date(app.follow_up_reminder_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 italic">
                          "{app.notes}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{new Date(app.date_discovered).toLocaleDateString()}</span>
                        {app.job_url && (
                          <a href={app.job_url} target="_blank" rel="noreferrer" className="hover:text-indigo-600 flex items-center gap-0.5 font-medium">
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Full Data Table */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Company &amp; Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Match</th>
                <th className="py-3 px-4">Hiring Contact</th>
                <th className="py-3 px-4">Discovered / Applied</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.role}</div>
                    <div className="text-[11px] text-indigo-700 font-semibold">{app.company}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold focus:outline-none cursor-pointer ${getStatusColor(app.status)}`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    {app.match_score ? (
                      <span className="font-extrabold text-emerald-700">{app.match_score}%</span>
                    ) : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{app.contact_name || 'Talent Team'}</div>
                    <div className="text-[10px] text-slate-400">{app.contact_email || 'Test Gated'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500">
                    <div>Disc: {new Date(app.date_discovered).toLocaleDateString()}</div>
                    {app.date_applied && (
                      <div className="text-emerald-700 font-semibold">Applied: {new Date(app.date_applied).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs">
                    {editingNotesId === app.id ? (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-[10px]"
                        />
                        <button onClick={() => saveNotes(app.id)} className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-semibold">
                          Save
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setEditingNotesId(app.id);
                          setNotesInput(app.notes || '');
                        }}
                        className="cursor-pointer hover:text-indigo-600 truncate"
                        title="Click to edit notes"
                      >
                        {app.notes || 'Click to add notes...'}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 inline-flex transition-colors"
                        title="Open posting"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
