'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  SendHorizontal, 
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  CheckCircle
} from 'lucide-react';
import { PipelineStage, WorkflowStatus } from '@/types';

interface PipelineVisualizerProps {
  currentStage: PipelineStage;
  workflowStatus: WorkflowStatus;
  companiesCount: number;
  leadsCount: number;
  enrichedCount: number;
  pendingApprovals: number;
  approvedCount: number;
  draftsCount: number;
  onStageClick: (stage: string) => void;
}

export function PipelineVisualizer({
  currentStage,
  workflowStatus,
  companiesCount,
  leadsCount,
  enrichedCount,
  pendingApprovals,
  approvedCount,
  draftsCount,
  onStageClick
}: PipelineVisualizerProps) {
  const stages = [
    {
      id: 'companies',
      step: 1,
      name: 'Company Search',
      description: 'US QSR & Fast-Casual groups (20-200 units)',
      count: companiesCount,
      countLabel: 'companies',
      icon: Building2,
      active: currentStage === 'company_search',
    },
    {
      id: 'leads',
      step: 2,
      name: 'Lead Discovery',
      description: 'COOs, VP Ops & Guest Exp leaders',
      count: leadsCount,
      countLabel: 'leads identified',
      icon: Users,
      active: currentStage === 'lead_search',
    },
    {
      id: 'enrichment',
      step: 3,
      name: 'Enrichment Engine',
      description: 'Verified signals, sources & hooks',
      count: enrichedCount,
      countLabel: 'enriched profiles',
      icon: Sparkles,
      active: currentStage === 'enrichment',
    },
    {
      id: 'approvals',
      step: 4,
      name: 'Human Approval Gate',
      description: 'Mandatory review — PENDING by default',
      count: pendingApprovals,
      countLabel: 'pending review',
      badgeText: pendingApprovals > 0 ? `${pendingApprovals} Pending` : `${approvedCount} Approved`,
      badgeType: pendingApprovals > 0 ? 'warning' : 'success',
      icon: ShieldCheck,
      active: currentStage === 'human_approval',
      isGate: true
    },
    {
      id: 'sequences',
      step: 5,
      name: '4-Email Sequences',
      description: 'Drafts only (Days 1, 4, 8, 13) — never auto-sent',
      count: draftsCount,
      countLabel: 'email drafts',
      icon: SendHorizontal,
      active: currentStage === 'email_generation',
    }
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-2">
            <span>5-Stage Journey Orchestration Pipeline</span>
            {workflowStatus === 'AWAITING_APPROVAL' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-normal">
                <PauseCircle className="w-3.5 h-3.5" />
                Workflow Paused at Gate
              </span>
            )}
            {workflowStatus === 'COMPLETED' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-normal">
                <CheckCircle className="w-3.5 h-3.5" />
                Pipeline Completed
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict human-in-the-loop governance: approved leads generate 4-email sequence drafts; unapproved leads generate zero drafts.
          </p>
        </div>
      </div>

      {/* Five-Stage Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              onClick={() => onStageClick(stage.id)}
              className={`relative rounded-xl p-4 transition-all cursor-pointer border ${
                stage.isGate
                  ? 'bg-gradient-to-b from-amber-950/20 to-slate-900/80 border-amber-500/30 hover:border-amber-400/50'
                  : 'bg-slate-950/50 border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-900/50'
              } ${stage.active ? 'ring-2 ring-indigo-500/50 border-indigo-500 shadow-md shadow-indigo-500/10' : ''}`}
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  stage.isGate 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  STAGE 0{stage.step}
                </span>

                {stage.badgeText && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    stage.badgeType === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {stage.badgeText}
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${
                  stage.isGate ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-100">{stage.name}</h4>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 leading-snug min-h-[30px] mb-3">
                {stage.description}
              </p>

              {/* Metric Counter */}
              <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                <span className="text-lg font-bold text-slate-100">{stage.count}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{stage.countLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
