'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Check, 
  Building2, 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { IntegrationSettings } from '@/types';

interface SettingsTabProps {
  settings: IntegrationSettings;
  onSaveSettings: (settings: Partial<IntegrationSettings>) => Promise<void>;
  onResetDemo: () => void;
}

export function SettingsTab({
  settings,
  onSaveSettings,
  onResetDemo
}: SettingsTabProps) {
  const [formData, setFormData] = useState<IntegrationSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isApolloConfigured = Boolean(
    formData.apollo_api_key || 
    formData.search_api_key || 
    (settings as any).apollo_configured
  );

  const isGeminiConfigured = Boolean(
    formData.gemini_api_key || 
    formData.llm_api_key || 
    (settings as any).gemini_configured
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    try {
      await onSaveSettings(formData);
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Integrations &amp; Service Credentials</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Apollo.io Recruiter Discovery, Google Gemini LLM, and Gmail OAuth credentials. All keys remain strictly server-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-100" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Integrations'}</span>
          </button>
        </div>
      </div>

      {/* Live Provider Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Apollo Connection Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${isApolloConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">Apollo.io Recruiter Search</span>
                {isApolloConfigured ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    CONFIGURED (LIVE)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    NOT CONFIGURED
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-snug">
                {isApolloConfigured 
                  ? 'Active: Real company hiring contacts and technical recruiters discovered directly via Apollo API.'
                  : 'Add your Apollo API key below or via APOLLO_API_KEY in .env.local to enable live discovery.'}
              </p>
            </div>
          </div>
        </div>

        {/* Gemini LLM Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${isGeminiConfigured ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">Google Gemini LLM</span>
                {isGeminiConfigured ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    ACTIVE (gemini-3.5-flash)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    DETERMINISTIC FALLBACK
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-snug">
                Powers evidence-grounded resume tailoring without hallucination and personalized recruiter outreach generation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apollo.io Configuration Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Apollo.io Recruiter Discovery Integration</h3>
              <p className="text-xs text-slate-500">
                Discovers actual corporate recruiters, hiring managers, and university talent leads.
              </p>
            </div>
          </div>

          <a
            href="https://docs.apollo.io/docs/create-api-key"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
          >
            <span>Get Apollo API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">Search Intelligence Provider Mode</label>
            <select
              value={formData.search_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, search_provider: e.target.value as any }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="public_web">Real Public-Source Discovery (Career Pages &amp; Public Portals)</option>
              <option value="apollo">Apollo.io API (Live People Search)</option>
              <option value="mock_demo">Curated Sandbox Mode (Offline Datasets)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">Apollo API Key (APOLLO_API_KEY)</label>
            <input
              type="password"
              placeholder="Enter your Apollo API Key (e.g. apollo_live_...)"
              value={formData.apollo_api_key || formData.search_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, apollo_api_key: e.target.value, search_api_key: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2 text-[11px] text-slate-500">
            <strong>Security Guarantee:</strong> Your Apollo API key is stored strictly on the server and is never returned in client JavaScript or log files.
          </div>
        </div>
      </div>

      {/* Google Gemini LLM Configuration Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Gemini LLM Intelligence</h3>
              <p className="text-xs text-slate-500">
                Powers evidence-grounded resume tailoring, project prioritization, and personalized email outreach.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">LLM Provider</label>
            <select
              value={formData.llm_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, llm_provider: e.target.value as any }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="gemini">Google Gemini (Recommended — gemini-3.5-flash)</option>
              <option value="openai">OpenAI (GPT-4o-mini)</option>
              <option value="mock_demo">Deterministic Grounded Synthesizer (No API Key)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block">Gemini API Key (GEMINI_API_KEY)</label>
            <input
              type="password"
              placeholder="AQ.Ab8RN6J38137..."
              value={formData.gemini_api_key || formData.llm_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gemini_api_key: e.target.value, llm_api_key: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Gmail OAuth Integration Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gmail API Integration (OAuth 2.0)</h3>
              <p className="text-xs text-slate-500">
                Creates email drafts in the user&apos;s authentic Gmail account. Never automatically sends.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formData.gmail_connected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Connected: {formData.gmail_connected_email}</span>
              </span>
            ) : (
              <button
                onClick={handleConnectGmail}
                disabled={isConnectingGmail}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isConnectingGmail ? 'Connecting...' : 'Connect Google Account'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Google OAuth Client ID</label>
            <input
              type="text"
              placeholder="xxxxxxxxxx.apps.googleusercontent.com"
              value={formData.gmail_client_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gmail_client_id: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700">Google OAuth Client Secret</label>
            <input
              type="password"
              placeholder="GOCSPX-xxxxxxxxxxxxxx"
              value={formData.gmail_client_secret || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, gmail_client_secret: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-700">OAuth Authorized Redirect URI</label>
            <input
              type="text"
              readOnly
              value={formData.gmail_redirect_uri || 'http://localhost:3000/api/auth/gmail/callback'}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Sandbox Reset Button */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-900 text-xs block">Reset to Curated Baseline</span>
          <p className="text-slate-500 mt-0.5 text-[11px]">
            Restores initial sample data for verified tech openings (Stripe, Vercel, Hugging Face, Figma) and resume profiles.
          </p>
        </div>

        <button
          onClick={handleResetSandbox}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          <span>{resetSuccess ? 'Reset Complete!' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </div>
  );
}
