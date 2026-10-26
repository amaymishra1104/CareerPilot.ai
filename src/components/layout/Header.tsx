'use client';

import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Mail, 
  Database, 
  HelpCircle, 
  Play, 
  AlertTriangle,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  demoMode: boolean;
  apolloConnected?: boolean;
  geminiConnected?: boolean;
  onResetDemo: () => void;
  onOpenGuidedDemo: () => void;
  onOpenLimitations: () => void;
  gmailConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunWorkflow: () => void;
  isRunningWorkflow: boolean;
}

export function Header({
  theme = 'light',
  onToggleTheme,
  demoMode: _demoMode,
  apolloConnected = false,
  geminiConnected = false,
  onResetDemo,
  onOpenGuidedDemo,
  onOpenLimitations,
  gmailConnected,
  activeTab: _activeTab,
  setActiveTab,
  onRunWorkflow,
  isRunningWorkflow
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md px-4 lg:px-8 py-3 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 shadow-md shadow-indigo-500/20 shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CareerPilot<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                Student &amp; Fresher Edition
              </span>

              {apolloConnected ? (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  title="Apollo.io live API connected for company and recruiter discovery"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>APOLLO LIVE</span>
                </span>
              ) : (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                  title="Apollo API key not configured. Operating in Curated Sandbox Mode."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>CURATED SANDBOX</span>
                </span>
              )}

              {geminiConnected && (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                  title="Google Gemini LLM connected for synthesis and personalization"
                >
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>GEMINI LLM</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal AI Job Search, Factual Resume Tailoring &amp; Recruiter Outreach
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Theme Toggle Button */}
          {onToggleTheme && (
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
              title={theme === 'dark' ? 'Switch to Eye-Soothing Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-slate-200">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium text-slate-700">Dark Mode</span>
                </>
              )}
            </button>
          )}

          {/* Limitations & Architectural Disclosures */}
          <button
            onClick={onOpenLimitations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-all cursor-pointer shadow-xs"
            title="Read transparent architectural audit, boundaries, and zero-send safeguards"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Audit &amp; Guardrails</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Quick Guided Demo Tour */}
          <button
            onClick={onOpenGuidedDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-100" />
            <span>Guided Tour</span>
          </button>

          {/* Run Pipeline */}
          <button
            onClick={onRunWorkflow}
            disabled={isRunningWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isRunningWorkflow ? 'animate-spin' : ''}`} />
            <span>{isRunningWorkflow ? 'Running...' : 'Daily Run'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            title="Reset dataset back to fresh curated baseline"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Integration Status Badges */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
            <div 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                gmailConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-medium' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={gmailConnected ? 'Gmail OAuth connected: creates real drafts in authorized test inbox' : 'Gmail not connected: will save into internal Draft Queue'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{gmailConnected ? 'Gmail Drafts' : 'Draft Queue'}</span>
            </div>

            <div 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              title="Storage Persistence: Atomic local JSON store with temp DB test isolation"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Atomic JSON DB</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
