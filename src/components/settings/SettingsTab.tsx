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
  Database
} from 'lucide-react';
import { IntegrationSettings } from '@/types';

interface SettingsTabProps {
  settings: IntegrationSettings;
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
            <span>Integrations & Service Credentials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure live intelligence APIs, Gmail OAuth credentials, and automation webhooks. Secrets are stored securely server-side.
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

      {/* Persistence and Mode Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Persistence status */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Persistence Engine Active</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">
              Data persists automatically across server reloads and browser refreshes. Supports local file-backed JSON store or live Supabase PostgreSQL.
            </p>
          </div>
        </div>

        {/* Demo Mode Toggle & Reset */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-white text-xs block">Demo Sandbox Reset</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">
              Restore baseline sample records for evaluator inspection.
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
                Creates email sequence drafts in the user's authentic Gmail account. Never automatically sends.
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
            <span className="text-[10px] text-slate-400 mt-1 block">
              Add this redirect URI in your Google Cloud Console Credentials under Authorized Redirect URIs.
            </span>
          </div>
        </div>
      </div>

      {/* LLM & Search Intelligence APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LLM Provider */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              LLM Provider (Enrichment & Copy)
            </h3>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400">Provider Service</label>
            <select
              value={formData.llm_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, llm_provider: e.target.value as any }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="mock_demo">Deterministic Grounded Mock (Zero Setup)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="gemini">Google Gemini</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400">LLM API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={formData.llm_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, llm_api_key: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Search Intelligence Provider */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Company & Lead Search Provider
            </h3>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400">Search Intelligence Service</label>
            <select
              value={formData.search_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, search_provider: e.target.value as any }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="mock_demo">Curated US QSR Demo Provider (Offline)</option>
              <option value="apollo">Apollo.io API</option>
              <option value="perplexity">Perplexity Sonar Intelligence</option>
              <option value="hunter">Hunter.io</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400">Search API Key</label>
            <input
              type="password"
              placeholder="API Key..."
              value={formData.search_api_key || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, search_api_key: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* n8n Webhook Secret */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            n8n Automation Secret Token
          </h3>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400">Webhook Authentication Secret</label>
          <input
            type="text"
            value={formData.n8n_webhook_secret || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, n8n_webhook_secret: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
