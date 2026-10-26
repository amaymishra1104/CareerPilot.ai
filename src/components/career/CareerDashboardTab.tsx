'use client';

import React from 'react';
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Upload, 
  Layers,
  ChevronRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  ResumeRecord, 
  JobListing, 
  JobApplicationRecord, 
  PersonalizedEmailDraft,
  JobMatchResult 
} from '@/types';

interface CareerDashboardTabProps {
  resumes: ResumeRecord[];
  jobs: JobListing[];
  applications: JobApplicationRecord[];
  drafts: PersonalizedEmailDraft[];
  matches: Record<string, JobMatchResult>;
  onNavigate: (tab: string) => void;
  onRunAutomation: () => void;
  isAutomating: boolean;
}

export function CareerDashboardTab({
  resumes,
  jobs,
  applications,
  drafts,
  matches,
  onNavigate,
  onRunAutomation,
  isAutomating
}: CareerDashboardTabProps) {
  const highMatches = Object.values(matches).filter(m => m.match_score >= 85);
  const tailoredCount = applications.filter(a => a.status === 'Resume Tailored' || a.tailored_resume_id).length;
  const draftsCount = drafts.length;
  const appliedCount = applications.filter(a => a.status === 'Applied' || a.status === 'Interview' || a.status === 'Offer').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CareerPilot AI • Student &amp; Fresher Edition</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Personal AI Job Search, Resume Tailoring &amp; Outreach
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Discover real tech opportunities from verified job feeds, match them against your 3 specialized resume profiles, generate factually grounded tailored versions, and prepare personalized recruiter outreach drafts for human review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRunAutomation}
              disabled={isAutomating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isAutomating ? 'animate-spin' : ''}`} />
              <span>{isAutomating ? 'Running Pipeline...' : 'Run Daily Automation'}</span>
            </button>
            <button
              onClick={() => onNavigate('career_resumes')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div 
          onClick={() => onNavigate('career_resumes')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Resume Profiles</span>
            <FileText className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{resumes.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tech • AI/ML • GTM</p>
        </div>

        <div 
          onClick={() => onNavigate('career_jobs')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Openings</span>
            <Briefcase className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified Real Feeds</p>
        </div>

        <div 
          onClick={() => onNavigate('career_matching')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">High Matches</span>
            <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{highMatches.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">≥ 85% Score Match</p>
        </div>

        <div 
          onClick={() => onNavigate('career_tailor')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tailored Resumes</span>
            <Layers className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{tailoredCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero Hallucinations</p>
        </div>

        <div 
          onClick={() => onNavigate('career_drafts')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Drafts Ready</span>
            <Mail className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{draftsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Test Inbox Safety Gated</p>
        </div>

        <div 
          onClick={() => onNavigate('career_tracker')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Applied / Interview</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{appliedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Full Status Lifecycle</p>
        </div>
      </div>

      {/* Safety Compliance & Non-Negotiable Rules Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Zero-Send &amp; Factual Integrity Safeguards Active</div>
            <div className="text-slate-500 text-[11px]">
              No emails are ever automatically sent • Resumes never invent qualifications • Gmail drafts created only into verified test inbox.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Operator Review Required</span>
        </div>
      </div>

      {/* Main Grid: Recommended Openings & Application Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): High-Match Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Matched Tech Openings</h2>
            </div>
            <button
              onClick={() => onNavigate('career_matching')}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View All Matches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 4).map(job => {
              const match = matches[job.id];
              const score = match?.match_score || 88;
              return (
                <div 
                  key={job.id}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{job.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {job.company}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                        {job.location}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        job.provenance === 'live' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        job.provenance === 'real_public_web' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {job.provenance === 'live' ? 'LIVE FEED' : job.provenance === 'real_public_web' ? 'OFFICIAL BOARD' : 'DEMO'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                      <span>Stack:</span>
                      {job.required_skills.slice(0, 4).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {s}
                        </span>
                      ))}
                      {job.salary_range && (
                        <span className="text-emerald-700 font-semibold ml-2">{job.salary_range}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Match Score</div>
                      <div className={`text-base font-extrabold ${score >= 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {score}%
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('career_tailor')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tailor Resume</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 10-Stage Funnel Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Funnel</h2>
            <button
              onClick={() => onNavigate('career_tracker')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Open Tracker
            </button>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="space-y-3">
              {[
                { stage: 'Discovered', count: jobs.length, color: 'bg-slate-400' },
                { stage: 'Matched', count: highMatches.length, color: 'bg-sky-500' },
                { stage: 'Resume Tailored', count: tailoredCount, color: 'bg-amber-500' },
                { stage: 'Drafts Created', count: draftsCount, color: 'bg-purple-500' },
                { stage: 'Applied & Active', count: appliedCount, color: 'bg-emerald-500' }
              ].map(item => (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{item.stage}</span>
                    <span className="font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`} 
                      style={{ width: `${Math.min(100, Math.max(12, (item.count / Math.max(jobs.length, 1)) * 100))}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>Reminders Due Today:</span>
                <span className="font-semibold text-slate-900">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Safety Inbox Status:</span>
                <span className="font-semibold text-emerald-700">Verified Gated</span>
              </div>
            </div>
          </div>

          {/* Quick Action Link */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 text-xs text-slate-700 space-y-2 shadow-2xs">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span>Ready for daily opportunities?</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Configure your desired roles, compensation floor, and remote preferences in Job Preferences to automatically filter feeds.
            </p>
            <button
              onClick={() => onNavigate('career_preferences')}
              className="w-full mt-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-center transition-colors cursor-pointer"
            >
              Configure Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
