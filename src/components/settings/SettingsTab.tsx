'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Key, 
  Mail, 
  Webhook, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Database,
  Building2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { IntegrationSettings } from '@/types';

interface SettingsTabProps {
  settings: IntegrationSettings & { apollo_configured?: boolean; gemini_configured?: boolean };
  onSaveSettings: (updated: Partial<IntegrationSettings>) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export function SettingsTab({
  settings,
  onSaveSettings,
  onResetDemo
}: SettingsTabProps) {
  const [formData, setFormData] = useState<IntegrationSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);

  const isApolloConfigured = Boolean((settings as any).apollo_configured || formData.apollo_api_key || formData.search_api_key);
  const isGeminiConfigured = Boolean((settings as any).gemini_configured || formData.gemini_api_key || formData.llm_api_key);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    try {
      const res = await fetch('/api/auth/gmail');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert(data.error || 'Please enter Gmail Client ID first.');
      }
    } catch (err: any) {
      alert(`Gmail Connect Error: ${err.message}`);
    } finally {
      setIsConnectingGmail(false);
    }
  };

  const handleResetSandbox = async () => {
    if (confirm('Are you sure you want to reset the platform database back to initial sample records?')) {
      await onResetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Integrations &amp; Service Credentials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Apollo.io B2B Intelligence, Google Gemini LLM, and Gmail OAuth credentials. All keys remain strictly server-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Integrations'}</span>
          </button>
        </div>
      </div>

      {/* Live Provider Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Apollo Connection Card */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isApolloConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Apollo.io B2B Search</span>
                {isApolloConfigured ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CONFIGURED (LIVE)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    NOT CONFIGURED
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] mt-1 leading-snug">
                {isApolloConfigured 
                  ? 'Active: Real US restaurant chains & decision-makers discovered directly via Apollo API.'
                  : 'Add your Apollo API key below or via APOLLO_API_KEY in .env.local to enable live discovery.'}
              </p>
            </div>
          </div>
        </div>

        {/* Gemini LLM Card */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isGeminiConfigured ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Google Gemini LLM</span>
                {isGeminiConfigured ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ACTIVE (gemini-3.5-flash)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    DETERMINISTIC FALLBACK
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] mt-1 leading-snug">
                Synthesizes evidence-grounded personalization hooks and structured 4-email sequence synthesis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apollo.io Configuration Box */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Apollo.io B2B Intelligence Integration</h3>
              <p className="text-xs text-slate-400">
                Discovers real US restaurant organizations, executive decision-makers, and business contact status.
              </p>
            </div>
          </div>

          <a
            href="https://docs.apollo.io/docs/create-api-key"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Get Apollo API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block">Search Intelligence Provider Mode</label>
            <select
              value={formData.search_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, search_provider: e.target.value as any }))}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="apollo">Apollo.io API (Live Provider)</option>
              <option value="mock_demo">Curated US QSR Demo Provider (Offline Sandbox)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block">Apollo API Key (APOLLO_API_KEY)</label>
            <input
              type="password"
              placeholder="Enter your Apollo API Key (e.g. apollo_live_...)"
              value={formData.apollo_api_key || formData.search_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, apollo_api_key: e.target.value, search_api_key: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2 text-[11px] text-slate-400">
            <strong>Security Guarantee:</strong> Your Apollo API key is stored strictly on the server and is never returned in client JavaScript or log files. If left blank, the platform defaults to the curated US QSR baseline dataset.
          </div>
        </div>
      </div>

      {/* Google Gemini LLM Configuration Box */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Gemini LLM Intelligence</h3>
              <p className="text-xs text-slate-400">
                Powers evidence-grounded research summaries, ICP fit analysis, and personalized 4-email sequence synthesis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block">LLM Provider</label>
            <select
              value={formData.llm_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, llm_provider: e.target.value as any }))}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini">Google Gemini (Recommended — gemini-3.5-flash)</option>
              <option value="openai">OpenAI (GPT-4o-mini)</option>
              <option value="mock_demo">Deterministic Grounded Synthesizer (No API Key)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block">Gemini API Key (GEMINI_API_KEY)</label>
            <input
              type="password"
              placeholder="AQ.Ab8RN6J38137..."
              value={formData.gemini_api_key || formData.llm_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gemini_api_key: e.target.value, llm_api_key: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Gmail OAuth Integration Box */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gmail API Integration (OAuth 2.0)</h3>
              <p className="text-xs text-slate-400">
                Creates email sequence drafts in the user&apos;s authentic Gmail account. Never automatically sends.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formData.gmail_connected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected: {formData.gmail_connected_email}</span>
              </span>
            ) : (
              <button
                onClick={handleConnectGmail}
                disabled={isConnectingGmail}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isConnectingGmail ? 'Connecting...' : 'Connect Google Account'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-400">Google OAuth Client ID</label>
            <input
              type="text"
              placeholder="xxxxxxxxxx.apps.googleusercontent.com"
              value={formData.gmail_client_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gmail_client_id: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400">Google OAuth Client Secret</label>
            <input
              type="password"
              placeholder="GOCSPX-xxxxxxxxxxxxxx"
              value={formData.gmail_client_secret || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gmail_client_secret: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-400">OAuth Authorized Redirect URI</label>
            <input
              type="text"
              readOnly
              value={formData.gmail_redirect_uri || 'http://localhost:3000/api/auth/gmail/callback'}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Sandbox Reset Button */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="font-bold text-white text-xs block">Reset to Curated Sandbox</span>
          <p className="text-slate-400 mt-0.5 text-[11px]">
            Restores initial sample data for Taziki&apos;s, Teriyaki Madness, and Starbird.
          </p>
        </div>

        <button
          onClick={handleResetSandbox}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>{resetSuccess ? 'Reset Complete!' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </div>
  );
}
