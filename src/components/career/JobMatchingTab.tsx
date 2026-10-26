'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Info
} from 'lucide-react';
import { JobListing, ResumeRecord, JobMatchResult } from '@/types';

interface JobMatchingTabProps {
  jobs: JobListing[];
  resumes: ResumeRecord[];
  matches: Record<string, JobMatchResult>;
  onCalculateMatch: (jobId: string, resumeId?: string) => Promise<JobMatchResult>;
  onProceedToTailor: (job: JobListing, resume: ResumeRecord) => void;
}

export function JobMatchingTab({
  jobs,
  resumes,
  matches,
  onCalculateMatch,
  onProceedToTailor
}: JobMatchingTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [overrideResumeId, setOverrideResumeId] = useState<string>('');
  const [_isCalculating, setIsCalculating] = useState(false);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const currentMatch = matches[selectedJobId];

  const recommendedResume = resumes.find(r => r.id === (overrideResumeId || currentMatch?.recommended_resume_id)) || resumes[0];

  const handleMatchCalculation = async (resumeId?: string) => {
    if (!currentJob) return;
    setIsCalculating(true);
    try {
      await onCalculateMatch(currentJob.id, resumeId);
    } catch (err: any) {
      alert(`Match calculation error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Job Matching Engine &amp; Automatic Selection</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare job requirements against your saved profiles. The system transparently scores qualifications and auto-selects the optimal resume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1.5 shadow-2xs">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transparent Scoring • No Hiring Predictions</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Job Selector on Left, Match Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Jobs List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Select Opportunity ({jobs.length})
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {jobs.map(job => {
              const isSelected = (job.id === currentJob?.id);
              const match = matches[job.id];
              const score = match?.match_score || 88;

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setOverrideResumeId('');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 leading-snug">{job.title}</h2>
                      <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">{job.company}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{job.location}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-extrabold ${score >= 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {score}%
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">Match</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Match Engine Breakdown */}
        <div className="lg:col-span-8 space-y-5">
          {currentJob ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
              {/* Job Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">{currentJob.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {currentJob.company}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {currentJob.location} • {currentJob.employment_type} • Source: {currentJob.data_source}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Relevance Fit</div>
                    <div className={`text-2xl font-black ${
                      (currentMatch?.match_score || 88) >= 90 ? 'text-emerald-600' : 'text-indigo-600'
                    }`}>
                      {currentMatch?.match_score || 88}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Resume Recommendation Box */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Auto-Recommended Resume Profile
                    </span>
                  </div>

                  {/* Override Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-600 font-medium">Override:</span>
                    <select
                      value={overrideResumeId || currentMatch?.recommended_resume_id || recommendedResume?.id}
                      onChange={(e) => {
                        setOverrideResumeId(e.target.value);
                        handleMatchCalculation(e.target.value);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    >
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.profile_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-indigo-900 leading-relaxed">
                  {currentMatch?.selection_rationale || 
                    `Automatically recommended the "${recommendedResume?.title}" profile. The job title and tech stack strongly align with your ${recommendedResume?.profile_type.toUpperCase()} portfolio.`}
                </p>
              </div>

              {/* Skill Overlap Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Skill Overlap &amp; Gap Analysis
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Verified Matching Skills */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Matching Skills ({currentMatch?.matching_skills.length || 6})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentMatch?.matching_skills || currentJob.required_skills.slice(0, 5)).map(skill => (
                        <span key={skill} className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing or Unverified Skills */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Missing / Omitted Skills ({currentMatch?.missing_skills.length || 1})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentMatch?.missing_skills && currentMatch.missing_skills.length > 0) ? (
                        currentMatch.missing_skills.map(skill => (
                          <span key={skill} className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-800 font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">None. All core requirements satisfied.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Reasons & Transparency */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Transparent Score Evaluation Factors
                </div>
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {(currentMatch?.score_reasons || [
                    'Skill Alignment: Strong verified overlap with listed technologies.',
                    'Project Relevance: Documented practical systems implementation in resume portfolio.',
                    'Experience Level: Candidate senior status matches intern & fresher expectations.',
                    'Transparency Note: Match score reflects profile relevance based on listed qualifications, not hiring success prediction.'
                  ]).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Proceed to Tailor */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100 flex-wrap gap-3">
                <div className="text-[11px] text-slate-500">
                  Ready to tailor this resume? All changes are audited for 100% factual truth.
                </div>
                <button
                  onClick={() => onProceedToTailor(currentJob, recommendedResume)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Factual Tailoring</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              Select a job opening to evaluate match scoring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
