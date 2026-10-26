'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check 
} from 'lucide-react';
import { 
  JobListing, 
  ResumeRecord, 
  TailoredResumeRecord 
} from '@/types';

interface ResumeTailoringTabProps {
  jobs: JobListing[];
  resumes: ResumeRecord[];
  tailoredResumes: TailoredResumeRecord[];
  onGenerateTailored: (jobId: string, resumeId: string) => Promise<TailoredResumeRecord>;
  onApproveTailored: (id: string) => Promise<void>;
  onProceedToOutreach: (job: JobListing, tailored: TailoredResumeRecord) => void;
}

export function ResumeTailoringTab({
  jobs,
  resumes,
  tailoredResumes,
  onGenerateTailored,
  onApproveTailored,
  onProceedToOutreach
}: ResumeTailoringTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const currentResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];

  // Find existing tailored resume for current job
  const tailored = tailoredResumes.find(t => t.job_id === selectedJobId);

  const handleGenerate = async () => {
    if (!currentJob || !currentResume) return;
    setIsGenerating(true);
    try {
      await onGenerateTailored(currentJob.id, currentResume.id);
    } catch (err: any) {
      alert(`Tailoring generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!tailored) return;
    try {
      await onApproveTailored(tailored.id);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const copyToClipboard = () => {
    if (!tailored) return;
    navigator.clipboard.writeText(tailored.plain_text_preview);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const printResume = () => {
    if (!tailored) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${tailored.tailored_title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #111; padding: 40px; max-width: 800px; margin: auto; }
              h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 12px; }
              h2 { font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
              p, li { font-size: 12px; }
              ul { padding-left: 20px; }
              .meta { font-size: 11px; color: #555; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit; font-size: 12px;">${tailored.plain_text_preview}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Job-Specific Resume Tailoring (Strict Factual Mode)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reorder projects and highlight verified skills to match job descriptions. Absolutely zero fabrication of skills, degrees, or achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Factual Integrity Guarantee</span>
          </span>
        </div>
      </div>

      {/* Target Job & Resume Selectors */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-700 font-semibold">Target Job Opening</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.company}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 font-semibold">Source Resume Profile (Immutable Original)</label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {resumes.map(r => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.profile_type})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Tailoring Resume...' : 'Generate Factual Tailored Copy'}</span>
          </button>
        </div>
      </div>

      {/* Audit Banner: Changes Made & Validation Warnings */}
      {tailored && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Changes Made Audit */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Permitted Tailoring Changes Audited ({tailored.changes_made.length})</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              {tailored.changes_made.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800 text-[11px] uppercase shrink-0">[{c.section}]:</span>
                  <span className="text-slate-700 text-[11px]">{c.details}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Warnings */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Omitted Unverified Requirements ({tailored.validation_warnings.length})</span>
            </div>
            <div className="space-y-1 text-slate-700 text-[11px]">
              {tailored.validation_warnings.length > 0 ? (
                tailored.validation_warnings.map((w, idx) => (
                  <div key={idx} className="text-amber-900 font-medium">• {w}</div>
                ))
              ) : (
                <div className="text-slate-500 italic">No omissions. All listed qualifications match verified resume records.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison: Before (Original) vs After (Tailored) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Immutable Resume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-700">Original Source Profile</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">IMMUTABLE BASELINE</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-4 max-h-[600px] overflow-y-auto font-mono text-[11px]">
            <div>
              <div className="font-bold text-slate-900 uppercase text-xs mb-1">SKILLS</div>
              <div>{currentResume.structured_data.skills.join(' • ')}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-xs mb-1">PROJECTS (ORIGINAL ORDER)</div>
              {currentResume.structured_data.projects.map((p, idx) => (
                <div key={idx} className="mb-2">
                  <div className="text-indigo-700 font-bold">• {p.title}</div>
                  <div className="text-slate-600 pl-3">{p.description}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-xs mb-1">EXPERIENCE</div>
              {currentResume.structured_data.experience.map((e, idx) => (
                <div key={idx} className="mb-2">
                  <div className="text-slate-900 font-bold">{e.role} at {e.company}</div>
                  <div className="text-slate-600 pl-3">{e.description_bullets.join(' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tailored Resume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-700">Tailored Copy for {currentJob.company}</span>
            </div>
            {tailored?.approved_by_user ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                APPROVED
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                AWAITING USER APPROVAL
              </span>
            )}
          </div>

          {tailored ? (
            <div className="p-5 rounded-2xl bg-white border border-indigo-200 text-xs text-slate-800 space-y-4 max-h-[600px] overflow-y-auto shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs font-bold text-indigo-900">{tailored.tailored_title}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Copy plain text"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={printResume}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Print / Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <pre className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800">
                {tailored.plain_text_preview}
              </pre>

              {/* Approval Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                {!tailored.approved_by_user ? (
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Tailored Resume</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approved for Application &amp; Outreach</span>
                  </div>
                )}

                <button
                  onClick={() => onProceedToOutreach(currentJob, tailored)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <span>Proceed to Outreach Draft</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-3">
              <p>No tailored resume generated yet for this job.</p>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Generate Factual Tailored Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
