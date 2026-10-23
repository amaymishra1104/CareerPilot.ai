'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  RotateCcw, 
  Play, 
  PauseCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  Webhook,
  Copy,
  Check
} from 'lucide-react';
import { WorkflowExecution, WorkflowLog, IntegrationSettings } from '@/types';

interface WorkflowLogsTabProps {
  executions: WorkflowExecution[];
  latestExecution?: WorkflowExecution;
  logs: WorkflowLog[];
  settings: IntegrationSettings;
  onRunPipeline: () => Promise<void>;
  onResumePipeline: () => Promise<void>;
  isRunning: boolean;
}

export function WorkflowLogsTab({
  executions,
  latestExecution,
  logs,
  settings,
  onRunPipeline,
  onResumePipeline,
  isRunning
}: WorkflowLogsTabProps) {
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('all');

  const webhookSecret = settings.n8n_webhook_secret || '<SET_IN_SETTINGS_OR_ENV>';
  const curlExample = `curl -X POST http://localhost:3000/api/workflows/webhook \\
  -H "Content-Type: application/json" \\
  -H "x-osvi-secret: ${webhookSecret}" \\
  -d '{"trigger": "n8n_daily_cron"}'`;

  const copySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (stageFilter === 'all') return true;
    return l.stage === stageFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Workflow Execution & Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage-by-stage execution runner with automatic pause at Stage 4 (Approval Gate) and resume mechanics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {latestExecution?.status === 'AWAITING_APPROVAL' && (
            <button
              onClick={onResumePipeline}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Resume Stage 5 Post-Approval</span>
            </button>
          )}

          <button
            onClick={onRunPipeline}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing...' : 'Trigger Workflow Run'}</span>
          </button>
        </div>
      </div>

      {/* Execution Status Card */}
      {latestExecution && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                latestExecution.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                latestExecution.status === 'AWAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                latestExecution.status === 'RUNNING' ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' :
                'bg-slate-800 text-slate-300'
              }`}>
                STATUS: {latestExecution.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {latestExecution.id}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span>Started: {new Date(latestExecution.started_at).toLocaleTimeString()}</span>
              {latestExecution.completed_at && (
                <span>Completed: {new Date(latestExecution.completed_at).toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
            {latestExecution.summary}
          </p>

          {/* Stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Companies</span>
              <span className="font-bold text-white text-xs">{latestExecution.stats.companies_found}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Leads Identified</span>
              <span className="font-bold text-white text-xs">{latestExecution.stats.leads_identified}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Enriched</span>
              <span className="font-bold text-white text-xs">{latestExecution.stats.leads_enriched}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Pending</span>
              <span className="font-bold text-amber-300 text-xs">{latestExecution.stats.pending_approvals}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Approved</span>
              <span className="font-bold text-emerald-300 text-xs">{latestExecution.stats.approved_leads}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Drafts Created</span>
              <span className="font-bold text-emerald-300 text-xs">{latestExecution.stats.drafts_created}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">Errors</span>
              <span className={`font-bold text-xs ${latestExecution.stats.workflow_errors > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {latestExecution.stats.workflow_errors}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* n8n Webhook Configuration Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              n8n & External Automation Webhook
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono">
            POST /api/workflows/webhook
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Trigger this entire 5-stage pipeline externally from n8n, Make, or GitHub Actions. Secured via the configurable secret token header <code className="text-purple-300">x-osvi-secret</code>.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 truncate">
            Secret: {webhookSecret}
          </div>
          <button
            onClick={copySecret}
            className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0"
          >
            {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSecret ? 'Copied' : 'Copy Secret'}</span>
          </button>
          <button
            onClick={copyCurl}
            className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5 text-purple-400" />}
            <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL Command'}</span>
          </button>
        </div>
      </div>

      {/* Stage Logs Terminal */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="text-xs font-mono font-bold text-slate-300 ml-2">
              workflow_execution.log ({filteredLogs.length} events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="company_search">Stage 1: company_search</option>
              <option value="lead_search">Stage 2: lead_search</option>
              <option value="enrichment">Stage 3: enrichment</option>
              <option value="human_approval">Stage 4: human_approval</option>
              <option value="email_generation">Stage 5: email_generation</option>
            </select>
          </div>
        </div>

        <div className="p-4 max-h-[460px] overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-400 py-6 text-center font-sans">
              No logs found. Run the pipeline to view real-time execution steps.
            </p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-400 shrink-0 select-none">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                  log.level === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                  log.level === 'error' ? 'bg-rose-500/20 text-rose-300' :
                  log.level === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  [{log.stage}]
                </span>
                <span className={`text-slate-300 ${log.level === 'error' ? 'text-rose-300 font-bold' : ''}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
