'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  SendHorizontal, 
  Settings, 
  Layers, 
  SlidersHorizontal,
  MailCheck,
  FileText,
  Briefcase,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resumesCount?: number;
  jobsCount?: number;
  matchesCount?: number;
  tailoredCount?: number;
  careerDraftsCount?: number;
  applicationsCount?: number;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  resumesCount = 3,
  jobsCount = 6,
  matchesCount = 4,
  tailoredCount = 2,
  careerDraftsCount = 1,
  applicationsCount = 4
}: SidebarProps) {
  // Navigation for CareerPilot AI
  const navItems = [
    { id: 'career_dashboard', label: 'Career Dashboard', icon: LayoutDashboard },
    { type: 'header', label: 'CANDIDATE CORE' },
    { 
      id: 'career_resumes', 
      label: '1. Resume Library', 
      icon: FileText,
      badge: `${resumesCount} profiles`,
      badgeColor: 'indigo'
    },
    { id: 'career_preferences', label: '2. Job Preferences', icon: SlidersHorizontal },
    { 
      id: 'career_jobs', 
      label: '3. Real Job Discovery', 
      icon: Briefcase,
      badge: `${jobsCount} openings`,
      badgeColor: 'sky'
    },
    { 
      id: 'career_matching', 
      label: '4. Matching & Selection', 
      icon: Sparkles,
      badge: `${matchesCount} scored`,
      badgeColor: 'emerald'
    },
    { 
      id: 'career_tailor', 
      label: '5. Factual Tailoring', 
      icon: Layers,
      badge: tailoredCount > 0 ? `${tailoredCount} ready` : undefined,
      badgeColor: 'amber'
    },
    { type: 'header', label: 'OUTREACH & TRACKING' },
    { id: 'career_recruiters', label: '6. Recruiter Discovery', icon: Users },
    { id: 'career_outreach', label: '7. Personalized Outreach', icon: SendHorizontal },
    { 
      id: 'career_drafts', 
      label: '8. Draft Queue (Test Gated)', 
      icon: MailCheck,
      badge: careerDraftsCount > 0 ? `${careerDraftsCount}` : undefined,
      badgeColor: 'purple'
    },
    { 
      id: 'career_tracker', 
      label: '9. Application Tracker', 
      icon: CheckCircle2,
      badge: `${applicationsCount}`,
      badgeColor: 'indigo'
    },
    { id: 'career_automation', label: '10. Daily Automation', icon: Clock },
    { type: 'header', label: 'SYSTEM' },
    { id: 'settings', label: 'Integrations & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-4 flex flex-col justify-between min-h-[calc(100vh-65px)] shadow-xs transition-colors duration-200">
      <div className="space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div 
                key={`header-${idx}`} 
                className="pt-4 pb-1.5 px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase"
              >
                {item.label}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id!)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  item.badgeColor === 'amber'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                    : item.badgeColor === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                    : item.badgeColor === 'sky'
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/40'
                    : item.badgeColor === 'purple'
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Gating Footer Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 mt-6 shadow-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety &amp; Privacy Gating</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Zero automated email sending. All outreach drafts are created strictly in the operator test inbox for human review.
        </p>
      </div>
    </aside>
  );
}
