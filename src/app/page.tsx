'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { IcpTab } from '@/components/icp/IcpTab';
import { CompanySearchTab } from '@/components/companies/CompanySearchTab';
import { LeadSearchTab } from '@/components/leads/LeadSearchTab';
import { EnrichmentWorkspaceTab } from '@/components/enrichment/EnrichmentWorkspaceTab';
import { ApprovalQueueTab } from '@/components/approvals/ApprovalQueueTab';
import { EmailSequenceBuilderTab } from '@/components/sequences/EmailSequenceBuilderTab';
import { DraftQueueTab } from '@/components/drafts/DraftQueueTab';
import { WorkflowLogsTab } from '@/components/workflow/WorkflowLogsTab';
import { DentalAdaptationTab } from '@/components/dental/DentalAdaptationTab';
import { DocumentationTab } from '@/components/docs/DocumentationTab';
import { SettingsTab } from '@/components/settings/SettingsTab';
import { GuidedDemoModal } from '@/components/demo/GuidedDemoModal';

import { 
  ICPConfig, 
  Company, 
  Contact, 
  EnrichmentRecord, 
  ApprovalHistoryItem, 
  EmailSequence, 
  EmailDraftRecord, 
  WorkflowExecution, 
  WorkflowLog, 
  IntegrationSettings 
} from '@/types';
import { INITIAL_ICP, INITIAL_SETTINGS } from '@/lib/seed';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [icp, setIcp] = useState<ICPConfig>(INITIAL_ICP);
  const [settings, setSettings] = useState<IntegrationSettings>(INITIAL_SETTINGS);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enrichments, setEnrichments] = useState<Record<string, EnrichmentRecord>>({});
  const [sequences, setSequences] = useState<Record<string, EmailSequence>>({});
  const [drafts, setDrafts] = useState<EmailDraftRecord[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [latestExecution, setLatestExecution] = useState<WorkflowExecution | undefined>();
  const [logs, setLogs] = useState<WorkflowLog[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingCompanies, setIsSearchingCompanies] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);

  // Load all initial data
  const loadPlatformData = useCallback(async () => {
    try {
      const [
        icpRes,
        settingsRes,
        companiesRes,
        contactsRes,
        draftsRes,
        historyRes,
        workflowRes,
        seqsRes
      ] = await Promise.all([
        fetch('/api/icp').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/companies').then(r => r.json()),
        fetch('/api/leads').then(r => r.json()),
        fetch('/api/drafts').then(r => r.json()),
        fetch('/api/approvals').then(r => r.json()),
        fetch('/api/workflows').then(r => r.json()),
        fetch('/api/sequences').then(r => r.json())
      ]);

      if (icpRes && !icpRes.error) setIcp(icpRes);
      if (settingsRes && !settingsRes.error) setSettings(settingsRes);
      if (Array.isArray(companiesRes)) setCompanies(companiesRes);
      if (Array.isArray(contactsRes)) setContacts(contactsRes);
      if (Array.isArray(draftsRes)) setDrafts(draftsRes);
      if (Array.isArray(historyRes)) setApprovalHistory(historyRes);
      if (workflowRes && !workflowRes.error) {
        setExecutions(workflowRes.executions || []);
        setLatestExecution(workflowRes.latest);
        setLogs(workflowRes.logs || []);
      }
      if (Array.isArray(seqsRes)) {
        const seqMap: Record<string, EmailSequence> = {};
        for (const s of seqsRes) {
          seqMap[s.lead_id] = s;
        }
        setSequences(seqMap);
      }

      // Fetch enrichments for contacts
      if (Array.isArray(contactsRes) && contactsRes.length > 0) {
        const enrichMap: Record<string, EnrichmentRecord> = {};
        for (const c of contactsRes) {
          try {
            const enrichRes = await fetch(`/api/enrichment?leadId=${c.id}`);
            if (enrichRes.ok) {
              const enrichData = await enrichRes.json();
              enrichMap[c.id] = enrichData;
            }
          } catch {
            // Ignore missing enrichments
          }
        }
        setEnrichments(enrichMap);
      }
    } catch (err) {
      console.error('Error loading platform state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  // Handle URL params for Gmail OAuth callback redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Handlers
  const handleResetDemo = async () => {
    await fetch('/api/demo/seed', { method: 'POST' });
    await loadPlatformData();
  };

  const handleSaveIcp = async (updated: Partial<ICPConfig>) => {
    const res = await fetch('/api/icp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const saved = await res.json();
      setIcp(saved);
    }
  };

  const handleSaveSettings = async (updated: Partial<IntegrationSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
    }
  };

  const handleSearchCompanies = async (filters: any) => {
    setIsSearchingCompanies(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Search Notice: ${data.error || 'Provider encountered an error'}`);
        return;
      }
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (err: any) {
      alert(`Network error searching companies: ${err.message}`);
    } finally {
      setIsSearchingCompanies(false);
    }
  };

  const handleImportCsv = async (csvText: string) => {
    const res = await fetch('/api/companies/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText })
    });
    const data = await res.json();
    if (data.success) {
      await loadPlatformData();
    }
    return data;
  };

  const handleSearchLeadsForCompany = async (companyId: string) => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.contacts) {
        setContacts(prev => {
          const others = prev.filter(c => c.company_id !== companyId);
          return [...data.contacts, ...others];
        });
      }
      await loadPlatformData();
    }
  };

  const handleEnrichLead = async (leadId: string) => {
    setIsEnriching(true);
    try {
      const res = await fetch('/api/enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      if (res.ok) {
        const data = await res.json();
        setEnrichments(prev => ({
          ...prev,
          [leadId]: data.enrichment
        }));
      }
    } finally {
      setIsEnriching(false);
    }
  };

  const handleApproveLead = async (leadId: string, reviewerNotes?: string) => {
    const res = await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, action: 'APPROVE', reviewerNotes })
    });
    if (res.ok) {
      const data = await res.json();
      setContacts(prev => prev.map(c => c.id === leadId ? data.contact : c));
      const histRes = await fetch('/api/approvals');
      if (histRes.ok) setApprovalHistory(await histRes.json());
    }
  };

  const handleRejectLead = async (leadId: string, reviewerNotes?: string, rejectionReason?: string) => {
    const res = await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, action: 'REJECT', reviewerNotes, rejectionReason })
    });
    if (res.ok) {
      const data = await res.json();
      setContacts(prev => prev.map(c => c.id === leadId ? data.contact : c));
      const histRes = await fetch('/api/approvals');
      if (histRes.ok) setApprovalHistory(await histRes.json());
    }
  };

  const handleGenerateSequence = async (leadId: string) => {
    setIsGeneratingSequence(true);
    try {
      const res = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      if (res.ok) {
        const data = await res.json();
        setSequences(prev => ({
          ...prev,
          [leadId]: data.sequence
        }));
      } else {
        const err = await res.json();
        alert(`Approval Gate Blocked: ${err.error}`);
      }
    } finally {
      setIsGeneratingSequence(false);
    }
  };

  const handleRegenerateEmail = async (leadId: string, stepNumber: number) => {
    setIsGeneratingSequence(true);
    try {
      const res = await fetch('/api/sequences/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, stepNumber })
      });
      if (res.ok) {
        const data = await res.json();
        setSequences(prev => ({
          ...prev,
          [leadId]: data.sequence
        }));
      }
    } finally {
      setIsGeneratingSequence(false);
    }
  };

  const handleUpdateEmail = async (leadId: string, stepNumber: number, subject: string, body: string) => {
    const res = await fetch('/api/sequences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, stepNumber, subject, body })
    });
    if (res.ok) {
      const data = await res.json();
      setSequences(prev => ({
        ...prev,
        [leadId]: data.sequence
      }));
    }
  };

  const handleCreateDrafts = async (sequenceId: string) => {
    setIsDrafting(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId })
      });
      if (res.ok) {
        const data = await res.json();
        const draftsRes = await fetch('/api/drafts');
        if (draftsRes.ok) setDrafts(await draftsRes.json());
      } else {
        const err = await res.json();
        alert(`Draft Creation Error: ${err.error}`);
      }
    } finally {
      setIsDrafting(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/drafts/export?format=csv';
  };

  const handleExportJson = () => {
    window.location.href = '/api/drafts/export?format=json';
  };

  const handleRunWorkflow = async () => {
    setIsRunningWorkflow(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });
      if (res.ok) {
        const data = await res.json();
        setLatestExecution(data.execution);
        setLogs(data.logs || []);
        await loadPlatformData();
      }
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const handleResumeWorkflow = async () => {
    setIsRunningWorkflow(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' })
      });
      if (res.ok) {
        const data = await res.json();
        setLatestExecution(data.execution);
        setLogs(data.logs || []);
        await loadPlatformData();
      }
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const handleTestRejectedLeadGate = async (leadId: string): Promise<{ blocked: boolean; error: string }> => {
    // Explicitly call the sequences API on the rejected lead to demonstrate backend enforcement
    const res = await fetch('/api/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId })
    });

    if (res.status === 403) {
      const err = await res.json();
      return { blocked: true, error: err.error || 'Server Gate: HTTP 403 Forbidden' };
    }

    return { blocked: false, error: 'Lead was not blocked by server' };
  };

  const pendingApprovalsCount = contacts.filter(c => c.approval_status === 'PENDING').length;
  const approvedCount = contacts.filter(c => c.approval_status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      <Header
        demoMode={settings.demo_mode_active}
        onResetDemo={handleResetDemo}
        onOpenGuidedDemo={() => setIsGuidedDemoOpen(true)}
        gmailConnected={settings.gmail_connected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunWorkflow={handleRunWorkflow}
        isRunningWorkflow={isRunningWorkflow}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalCount={pendingApprovalsCount}
          approvedCount={approvedCount}
          draftsCount={drafts.length}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh] text-xs text-slate-400">
              Loading OSVI.ai Journey platform state...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <OverviewDashboard
                  companies={companies}
                  contacts={contacts}
                  enrichedCount={Object.keys(enrichments).length}
                  draftsCount={drafts.length}
                  latestExecution={latestExecution}
                  logs={logs}
                  onNavigateTab={setActiveTab}
                  onRunPipeline={handleRunWorkflow}
                  onResumePipeline={handleResumeWorkflow}
                  isRunningWorkflow={isRunningWorkflow}
                />
              )}

              {activeTab === 'icp' && (
                <IcpTab
                  icp={icp}
                  onSaveIcp={handleSaveIcp}
                />
              )}

              {activeTab === 'companies' && (
                <CompanySearchTab
                  companies={companies}
                  icp={icp}
                  onSearchCompanies={handleSearchCompanies}
                  onImportCsv={handleImportCsv}
                  onFindLeadsForCompany={(companyId) => {
                    handleSearchLeadsForCompany(companyId);
                    setActiveTab('leads');
                  }}
                  isSearching={isSearchingCompanies}
                />
              )}

              {activeTab === 'leads' && (
                <LeadSearchTab
                  contacts={contacts}
                  companies={companies}
                  onEnrichLead={async (leadId) => {
                    await handleEnrichLead(leadId);
                    setActiveTab('enrichment');
                  }}
                  onNavigateToApprovals={(leadId) => {
                    setActiveTab('approvals');
                  }}
                  onSearchLeadsForCompany={handleSearchLeadsForCompany}
                  isEnriching={isEnriching}
                />
              )}

              {activeTab === 'enrichment' && (
                <EnrichmentWorkspaceTab
                  contacts={contacts}
                  companies={companies}
                  enrichments={enrichments}
                  onEnrichLead={handleEnrichLead}
                  onNavigateToApprovals={(leadId) => {
                    setActiveTab('approvals');
                  }}
                  isEnriching={isEnriching}
                />
              )}

              {activeTab === 'approvals' && (
                <ApprovalQueueTab
                  contacts={contacts}
                  companies={companies}
                  enrichments={enrichments}
                  approvalHistory={approvalHistory}
                  onApproveLead={handleApproveLead}
                  onRejectLead={handleRejectLead}
                  onNavigateToSequences={(leadId) => {
                    setActiveTab('sequences');
                  }}
                />
              )}

              {activeTab === 'sequences' && (
                <EmailSequenceBuilderTab
                  contacts={contacts}
                  companies={companies}
                  sequences={sequences}
                  settings={settings}
                  onGenerateSequence={handleGenerateSequence}
                  onRegenerateEmail={handleRegenerateEmail}
                  onUpdateEmail={handleUpdateEmail}
                  onCreateDrafts={handleCreateDrafts}
                  isGenerating={isGeneratingSequence}
                  isDrafting={isDrafting}
                />
              )}

              {activeTab === 'drafts' && (
                <DraftQueueTab
                  drafts={drafts}
                  settings={settings}
                  onRefreshDrafts={loadPlatformData}
                  onExportCsv={handleExportCsv}
                  onExportJson={handleExportJson}
                />
              )}

              {activeTab === 'workflow' && (
                <WorkflowLogsTab
                  executions={executions}
                  latestExecution={latestExecution}
                  logs={logs}
                  settings={settings}
                  onRunPipeline={handleRunWorkflow}
                  onResumePipeline={handleResumeWorkflow}
                  isRunning={isRunningWorkflow}
                />
              )}

              {activeTab === 'docs' && (
                <DocumentationTab />
              )}

              {activeTab === 'dental' && (
                <DentalAdaptationTab />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onResetDemo={handleResetDemo}
                />
              )}
            </>
          )}
        </main>
      </div>

      <GuidedDemoModal
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsGuidedDemoOpen(false);
        }}
        onApproveLead={handleApproveLead}
        onRejectLead={handleRejectLead}
        onGenerateSequence={handleGenerateSequence}
        onTestRejectedLeadGate={handleTestRejectedLeadGate}
      />
    </div>
  );
}
