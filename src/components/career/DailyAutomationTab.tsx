'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  Save, 
  Power
} from 'lucide-react';
import { DailyAutomationConfig } from '@/types';

interface DailyAutomationTabProps {
  config: DailyAutomationConfig;
  onUpdateConfig: (config: Partial<DailyAutomationConfig>) => Promise<void>;
  onRunNow: () => Promise<any>;
  isRunning: boolean;
}

export function DailyAutomationTab({
  config,
  onUpdateConfig,
  onRunNow,
  isRunning
}: DailyAutomationTabProps) {
  const [report, setReport] = useState<any>(null);

  const toggleEnabled = async () => {
    try {
      await onUpdateConfig({ is_enabled: !config.is_enabled });
    } catch (err: any) {
      alert(`Error toggling automation: ${err.message}`);
    }
  };

  const handleRun = async () => {
    try {
      const rep = await onRunNow();
      setReport(rep);
    } catch (err: any) {
      alert(`Workflow execution error: ${err.message}`);
    }
  };

  const stages = [
    { num: 1, title: 'Job Feed Discovery', desc: 'Queries authorized APIs (Remotive, Arbeitnow) & company feeds' },
    { num: 2, title: 'Listing Deduplication', desc: 'Normalizes and filters out previously seen opportunities' },
    { num: 3, title: 'Transparent Match Scoring', desc: 'Compares requirements with actual resume skills and coursework' },
    { num: 4, title: 'Automatic Resume Selection', desc: 'Recommends optimal resume profile (Technical, AI/ML, or GTM)' },
    { num: 5, title: 'Hiring Contact Discovery', desc: 'Identifies technical recruiters and talent leads via Apollo and directories' },
    { num: 6, title: 'Factual Resume Tailoring', desc: 'Reorders projects and emphasizes matching skills without hallucinations' },
    { num: 7, title: 'Personalized Outreach Draft', desc: 'Synthesizes professional email draft with grounded evidence claims' },
    { num: 8, title: 'Review Queue & Safety Gate', desc: 'Pushes draft to operator test queue for mandatory human review' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Daily Job Search &amp; Outreach Automation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurable autonomous workflow that crawls new jobs daily, scores matches, prepares tailored resumes, and queues drafts for your morning review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              config.is_enabled 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{config.is_enabled ? 'AUTOMATION ACTIVE' : 'AUTOMATION PAUSED'}</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || !config.is_enabled}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing Daily Pipeline...' : 'Run Daily Workflow Now'}</span>
          </button>
        </div>
      </div>

      {/* Latest Execution Report Card */}
      {(report || config.last_run_summary) && (
        <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Latest Automation Execution Summary</span>
            </div>
            <span className="text-slate-500 font-medium">
              {config.last_run_timestamp ? new Date(config.last_run_timestamp).toLocaleString() : 'Just now'}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {report?.summary || config.last_run_summary}
          </p>

          {report && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Jobs Discovered</div>
                <div className="text-base font-bold text-slate-900">{report.jobsDiscovered}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">New Openings</div>
                <div className="text-base font-bold text-sky-700">{report.newJobsAdded}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Scored Matches</div>
                <div className="text-base font-bold text-indigo-700">{report.matchesScored}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Resumes Tailored</div>
                <div className="text-base font-bold text-amber-700">{report.resumesTailored}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Drafts Queued</div>
                <div className="text-base font-bold text-purple-700">{report.draftsPrepared}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8-Stage Pipeline Architecture Visualizer */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          8-Stage Daily Automation Architecture
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stages.map(st => (
            <div 
              key={st.num}
              className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px] flex items-center justify-center border border-indigo-200">
                    {st.num}
                  </span>
                  <span className="font-bold text-slate-900">{st.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Stage #{st.num}</span>
                <span className="text-emerald-700 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="font-bold text-slate-900 text-sm">
          Automation Execution Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Discovery Provider</label>
            <select
              value={config.discovery_provider}
              onChange={(e) => onUpdateConfig({ discovery_provider: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Available (Remotive + Arbeitnow)</option>
              <option value="remotive">Remotive API</option>
              <option value="arbeitnow">Arbeitnow API</option>
              <option value="demo">Curated Feed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Default Outreach Tone</label>
            <select
              value={config.preferred_tone}
              onChange={(e) => onUpdateConfig({ preferred_tone: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="professional">Professional &amp; Direct</option>
              <option value="enthusiastic_student">Enthusiastic Student / Fresher</option>
              <option value="concise_impactful">Concise &amp; Bulleted</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Daily Role Processing Cap</label>
            <input
              type="number"
              min={1}
              max={20}
              value={config.max_daily_jobs}
              onChange={(e) => onUpdateConfig({ max_daily_jobs: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-slate-500 text-[11px]">
          <span>Changes to automation parameters save immediately.</span>
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
            <Save className="w-3.5 h-3.5" />
            <span>Auto-Saved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
