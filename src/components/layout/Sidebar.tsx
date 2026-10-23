'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  SendHorizontal, 
  Terminal, 
  Settings, 
  Layers, 
  SlidersHorizontal,
  MailCheck,
  Stethoscope,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalCount: number;
  approvedCount: number;
  draftsCount: number;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  pendingApprovalCount,
  approvedCount,
  draftsCount
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'icp', label: 'ICP Configuration', icon: SlidersHorizontal },
    { type: 'header', label: '5-STAGE PIPELINE' },
    { id: 'companies', label: '1. Company Search', icon: Building2 },
    { id: 'leads', label: '2. Lead Search', icon: Users },
    { id: 'enrichment', label: '3. Enrichment Engine', icon: Sparkles },
    { 
      id: 'approvals', 
      label: '4. Human Approval', 
      icon: CheckCircle2, 
      badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} pending` : undefined,
      badgeColor: 'amber'
    },
    { 
      id: 'sequences', 
      label: '5. Email Sequences', 
      icon: SendHorizontal,
      badge: approvedCount > 0 ? `${approvedCount} ready` : undefined,
      badgeColor: 'indigo'
    },
    { type: 'header', label: 'OUTPUT & EXECUTION' },
    { 
      id: 'drafts', 
      label: 'Email Draft Queue', 
      icon: MailCheck,
      badge: draftsCount > 0 ? `${draftsCount}` : undefined,
      badgeColor: 'emerald'
    },
    { id: 'workflow', label: 'Workflow Logs', icon: Terminal },
    { type: 'header', label: 'SPECIAL & SETTINGS' },
    { id: 'docs', label: 'Documentation PDF', icon: FileText, badge: 'Official', badgeColor: 'indigo' },
    { id: 'dental', label: 'Dental DSO Adaptation', icon: Stethoscope },
    { id: 'settings', label: 'Integrations & API Keys', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div 
                key={`header-${idx}`} 
                className="pt-5 pb-1 px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase"
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  item.badgeColor === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : item.badgeColor === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OSVI.ai Journey Value proposition pill */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 mt-6">
        <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>Journey Architecture</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Multi-agent orchestration layer above traditional bots, aligning QSR guest touchpoints directly with store operations.
        </p>
      </div>
    </aside>
  );
}
