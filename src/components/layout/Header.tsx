'use client';

import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Mail, 
  Database, 
  HelpCircle,
  Play,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
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
  demoMode,
  apolloConnected = false,
  geminiConnected = false,
  onResetDemo,
  onOpenGuidedDemo,
  onOpenLimitations,
  gmailConnected,
  activeTab,
  setActiveTab,
  onRunWorkflow,
  isRunningWorkflow
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold tracking-tight text-white">OSVI<span className="text-indigo-400">.ai</span></span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                Journey GTM
              </span>
              {apolloConnected ? (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Apollo.io live API connected for company and people discovery"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>APOLLO LIVE</span>
                </span>
              ) : (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Apollo API key not configured. Operating in Curated Sandbox Mode. Click to configure in Settings."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>CURATED SANDBOX (APOLLO OFF)</span>
                </span>
              )}
              {geminiConnected && (
                <span 
                  onClick={() => setActiveTab('settings')}
                  className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
                  title="Google Gemini LLM connected for evidence synthesis and copy generation"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>GEMINI LLM</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              QSR Journey Orchestration Outreach Engine
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Limitations & Architectural Disclosures */}
          <button
            onClick={onOpenLimitations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            title="Read transparent architectural audit, boundaries, and zero-send safeguards"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Known Limitations &amp; Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Quick Guided Demo Tour */}
          <button
            onClick={onOpenGuidedDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-200" />
            <span>Guided Evaluator Demo</span>
          </button>

          {/* Direct Documentation View */}
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Documentation PDF</span>
            <span className="sm:hidden">Docs</span>
          </button>

          {/* Run Full Pipeline */}
          <button
            onClick={onRunWorkflow}
            disabled={isRunningWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 text-indigo-400 ${isRunningWorkflow ? 'animate-spin' : ''}`} />
            <span>{isRunningWorkflow ? 'Executing...' : 'Run Pipeline'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            title="Reset dataset back to fresh curated baseline"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Sandbox</span>
          </button>

          {/* Integration Status Badges */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <div 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer ${
                gmailConnected 
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={gmailConnected ? 'Gmail OAuth connected: creates real drafts in amaymishra1104@gmail.com' : 'Gmail not connected: will save into internal Draft Queue'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{gmailConnected ? 'Gmail Drafts' : 'Draft Queue'}</span>
            </div>

            <div 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Storage Persistence: Atomic local JSON store with temp DB test isolation"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Atomic JSON DB</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
