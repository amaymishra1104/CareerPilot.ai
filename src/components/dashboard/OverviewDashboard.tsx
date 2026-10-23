'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MailCheck, 
  AlertTriangle,
  ArrowUpRight,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { PipelineVisualizer } from './PipelineVisualizer';
import { Company, Contact, WorkflowExecution, WorkflowLog } from '@/types';

interface OverviewDashboardProps {
  companies: Company[];
  contacts: Contact[];
  enrichedCount: number;
  draftsCount: number;
  latestExecution?: WorkflowExecution;
  logs: WorkflowLog[];
  onNavigateTab: (tab: string) => void;
  onRunPipeline: () => void;
  onResumePipeline: () => void;
  isRunningWorkflow: boolean;
}

export function OverviewDashboard({
  companies,
  contacts,
  enrichedCount,
  draftsCount,
  latestExecution,
  logs,
  onNavigateTab,
  onRunPipeline,
  onResumePipeline,
  isRunningWorkflow
}: OverviewDashboardProps) {
  const pendingApprovals = contacts.filter(c => c.approval_status === 'PENDING').length;
  const approvedLeads = contacts.filter(c => c.approval_status === 'APPROVED').length;
  const rejectedLeads = contacts.filter(c => c.approval_status === 'REJECTED').length;
  const workflowErrors = latestExecution?.stats.workflow_errors || 0;

  const currentStage = latestExecution?.current_stage || 'company_search';
  const workflowStatus = latestExecution?.status || 'IDLE';

  const metrics = [
    {
      title: 'Companies Found',
      value: companies.length,
      subtext: 'US QSR & Fast-Casual',
      icon: Building2,
      tab: 'companies',
      color: 'indigo'
    },
    {
      title: 'Leads Identified',
      value: contacts.length,
      subtext: 'Decision-makers',
      icon: Users,
      tab: 'leads',
      color: 'sky'
    },
    {
      title: 'Leads Enriched',
      value: enrichedCount,
      subtext: 'Verified evidence & hooks',
      icon: Sparkles,
      tab: 'enrichment',
      color: 'purple'
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      subtext: 'Mandatory Human Gate',
      icon: Clock,
      tab: 'approvals',
      color: 'amber',
      highlight: pendingApprovals > 0
    },
    {
      title: 'Approved Leads',
      value: approvedLeads,
      subtext: 'Eligible for sequence',
      icon: CheckCircle2,
      tab: 'approvals',
      color: 'emerald'
    },
    {
      title: 'Rejected Leads',
      value: rejectedLeads,
      subtext: 'Strictly zero drafts',
      icon: XCircle,
      tab: 'approvals',
      color: 'rose'
    },
    {
      title: 'Email Drafts Created',
      value: draftsCount,
      subtext: '4-Email Sequences',
      icon: MailCheck,
      tab: 'drafts',
      color: 'emerald'
    },
    {
      title: 'Workflow Errors',
      value: workflowErrors,
      subtext: 'Logged exceptions',
      icon: AlertTriangle,
      tab: 'workflow',
      color: workflowErrors > 0 ? 'rose' : 'slate'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Pipeline Control Center
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            OSVI.ai Journey Outreach Engine
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Targeting US multi-unit QSR operators (20–200 locations) experiencing customer communication fragmentation. Orchestrating multi-agent teamwork and outcome-driven outreach.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {workflowStatus === 'AWAITING_APPROVAL' && (
            <button
              onClick={() => onNavigateTab('approvals')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review {pendingApprovals} Pending Leads</span>
            </button>
          )}

          {workflowStatus === 'AWAITING_APPROVAL' && approvedLeads > 0 && (
            <button
              onClick={onResumePipeline}
              disabled={isRunningWorkflow}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Resume to Stage 5</span>
            </button>
          )}

          <button
            onClick={onRunPipeline}
            disabled={isRunningWorkflow}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunningWorkflow ? 'animate-spin' : ''}`} />
            <span>{isRunningWorkflow ? 'Executing Pipeline...' : 'Run Pipeline From Stage 1'}</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Visual Pipeline */}
      <PipelineVisualizer
        currentStage={currentStage}
        workflowStatus={workflowStatus}
        companiesCount={companies.length}
        leadsCount={contacts.length}
        enrichedCount={enrichedCount}
        pendingApprovals={pendingApprovals}
        approvedCount={approvedLeads}
        draftsCount={draftsCount}
        onStageClick={onNavigateTab}
      />

      {/* 8-Metric Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Pipeline Health & Execution Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                onClick={() => onNavigateTab(m.tab)}
                className={`p-4 rounded-xl border bg-slate-900/50 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:bg-slate-900/90 cursor-pointer group ${
                  m.highlight
                    ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                    {m.title}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {m.value}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{m.subtext}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Workflow Execution Stream & Logs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Latest Execution Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Workflow State
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              workflowStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
              workflowStatus === 'AWAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-300' :
              workflowStatus === 'RUNNING' ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' :
              'bg-slate-800 text-slate-400'
            }`}>
              {workflowStatus}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Current Stage:</span>
              <p className="font-semibold text-slate-200 mt-0.5 capitalize">
                {currentStage.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Summary:</span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                {latestExecution?.summary || 'No workflow execution recorded yet. Click "Run Pipeline" to begin.'}
              </p>
            </div>
            {latestExecution?.started_at && (
              <div>
                <span className="text-slate-400">Started:</span>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                  {new Date(latestExecution.started_at).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Logs Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent Stage Execution Logs
              </h4>
              <button
                onClick={() => onNavigateTab('workflow')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Full Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[11px] font-mono">
              {logs.length === 0 ? (
                <p className="text-slate-400 py-4 text-center font-sans">
                  No execution logs yet. Logs will stream here during pipeline execution.
                </p>
              ) : (
                logs.slice(0, 5).map((log) => (
                  <div 
                    key={log.id} 
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                      log.level === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.level === 'error' ? 'bg-rose-500/20 text-rose-300' :
                      log.level === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {log.stage}
                    </span>
                    <span className="text-slate-300 leading-tight">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
