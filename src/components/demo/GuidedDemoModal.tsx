'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  Briefcase, 
  Layers, 
  Users, 
  Mail, 
  Check 
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export function GuidedDemoModal({
  isOpen,
  onClose,
  onNavigateTab
}: GuidedDemoModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: '1. Inspect the 3 Resume Profiles',
      description: 'CareerPilot maintains 3 specialized resume profiles (Technical, AI/ML, and Business/GTM). Original files are preserved immutably with structured skills and project extraction.',
      tab: 'career_resumes',
      icon: FileText,
      actionLabel: 'Open Resume Library',
      execute: () => onNavigateTab('career_resumes')
    },
    {
      step: 2,
      title: '2. Configure Job Preferences',
      description: 'Set your target roles (e.g. SWE Intern, AI Engineer), compensation floor, remote/hybrid preference, and core skills to guide automated crawlers.',
      tab: 'career_preferences',
      icon: Briefcase,
      actionLabel: 'View Preferences',
      execute: () => onNavigateTab('career_preferences')
    },
    {
      step: 3,
      title: '3. Discover Real Tech Openings',
      description: 'Query live developer feeds (Remotive, Arbeitnow) or batch import jobs via CSV. Openings are normalized and deduplicated automatically.',
      tab: 'career_jobs',
      icon: Briefcase,
      actionLabel: 'Explore Jobs Feed',
      execute: () => onNavigateTab('career_jobs')
    },
    {
      step: 4,
      title: '4. Transparent Match & Auto Selection',
      description: 'The matching engine computes a multi-factor score (skills 40%, projects 30%, experience 15%, location 15%) and automatically recommends the best profile.',
      tab: 'career_matching',
      icon: Sparkles,
      actionLabel: 'Open Matching Engine',
      execute: () => onNavigateTab('career_matching')
    },
    {
      step: 5,
      title: '5. Factual Resume Tailoring',
      description: 'Generate a job-tailored resume that reorders relevant projects and emphasizes matching skills with zero hallucination. Inspect the side-by-side diff.',
      tab: 'career_tailor',
      icon: Layers,
      actionLabel: 'Inspect Factual Tailoring',
      execute: () => onNavigateTab('career_tailor')
    },
    {
      step: 6,
      title: '6. Discover Recruiters & Hiring Leads',
      description: 'Identify technical recruiters, early-career recruiting leads, and hiring managers via Apollo.io or verified company portals. Zero fabricated contacts.',
      tab: 'career_recruiters',
      icon: Users,
      actionLabel: 'Find Hiring Contacts',
      execute: () => onNavigateTab('career_recruiters')
    },
    {
      step: 7,
      title: '7. Personalized Outreach (Test Gated)',
      description: 'Synthesize outreach across 7 email types anchored on resume evidence claims. Pushes drafts strictly to your authorized test inbox with zero auto-send.',
      tab: 'career_outreach',
      icon: Mail,
      actionLabel: 'Review Outreach Drafts',
      execute: () => onNavigateTab('career_outreach')
    },
    {
      step: 8,
      title: '8. 10-Stage Application Tracker',
      description: 'Track applications from Discovered through Matched, Resume Tailored, Draft Created, Applied, Interview, and Offer with follow-up reminders.',
      tab: 'career_tracker',
      icon: CheckCircle2,
      actionLabel: 'Open Application Kanban',
      execute: () => onNavigateTab('career_tracker')
    }
  ];

  const current = demoSteps.find(s => s.step === currentStep) || demoSteps[0];
  const Icon = current.icon;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">CareerPilot AI Interactive Tour</h2>
              <p className="text-xs text-slate-500">Step-by-step walkthrough of the job discovery and factual tailoring platform</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white gap-2 overflow-x-auto">
          {demoSteps.map(s => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : currentStep > s.step
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>{s.step}</span>
              {currentStep > s.step && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-sm">
              <Icon className="w-5 h-5 text-indigo-600" />
              <span>{current.title}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety &amp; Compliance Rule</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Resumes strictly reflect documented coursework and projects with zero hallucinated credentials. Outreach drafts are created only in the operator test inbox.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                current.execute();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {currentStep < demoSteps.length ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(demoSteps.length, prev + 1))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
