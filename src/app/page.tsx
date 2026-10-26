'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// CareerPilot AI Components
import { CareerDashboardTab } from '@/components/career/CareerDashboardTab';
import { ResumeLibraryTab } from '@/components/career/ResumeLibraryTab';
import { JobPreferencesTab } from '@/components/career/JobPreferencesTab';
import { JobDiscoveryTab } from '@/components/career/JobDiscoveryTab';
import { JobMatchingTab } from '@/components/career/JobMatchingTab';
import { ResumeTailoringTab } from '@/components/career/ResumeTailoringTab';
import { RecruiterDiscoveryTab } from '@/components/career/RecruiterDiscoveryTab';
import { PersonalizedOutreachTab } from '@/components/career/PersonalizedOutreachTab';
import { CareerDraftQueueTab } from '@/components/career/CareerDraftQueueTab';
import { ApplicationTrackerTab } from '@/components/career/ApplicationTrackerTab';
import { DailyAutomationTab } from '@/components/career/DailyAutomationTab';
import { SettingsTab } from '@/components/settings/SettingsTab';
import { GuidedDemoModal } from '@/components/demo/GuidedDemoModal';
import { KnownLimitationsModal } from '@/components/common/KnownLimitationsModal';

import { 
  IntegrationSettings,
  UserProfile,
  JobPreferences,
  ResumeRecord,
  JobListing,
  JobMatchResult,
  RecruiterContact,
  TailoredResumeRecord,
  PersonalizedEmailDraft,
  JobApplicationRecord,
  DailyAutomationConfig,
  ApplicationStatus,
  ResumeProfileType
} from '@/types';

import { 
  INITIAL_SETTINGS,
  DEFAULT_USER_PROFILE,
  DEFAULT_JOB_PREFERENCES,
  DEFAULT_RESUMES,
  DEFAULT_DAILY_AUTOMATION_CONFIG
} from '@/lib/seed';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('career_dashboard');

  // Integration Settings
  const [settings, setSettings] = useState<IntegrationSettings>(INITIAL_SETTINGS);

  // CareerPilot AI State
  const [_userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>(DEFAULT_JOB_PREFERENCES);
  const [resumes, setResumes] = useState<ResumeRecord[]>(DEFAULT_RESUMES);
  const [careerJobs, setCareerJobs] = useState<JobListing[]>([]);
  const [careerMatches, setCareerMatches] = useState<Record<string, JobMatchResult>>({});
  const [careerContacts, setCareerContacts] = useState<RecruiterContact[]>([]);
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResumeRecord[]>([]);
  const [careerDrafts, setCareerDrafts] = useState<PersonalizedEmailDraft[]>([]);
  const [careerApplications, setCareerApplications] = useState<JobApplicationRecord[]>([]);
  const [careerAutomationConfig, setCareerAutomationConfig] = useState<DailyAutomationConfig>(DEFAULT_DAILY_AUTOMATION_CONFIG);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);
  const [isLimitationsOpen, setIsLimitationsOpen] = useState(false);

  // CareerPilot Action States
  const [isSearchingCareerJobs, setIsSearchingCareerJobs] = useState(false);
  const [isDiscoveringRecruiters, setIsDiscoveringRecruiters] = useState(false);
  const [isAutomatingCareer, setIsAutomatingCareer] = useState(false);

  // Load all platform data
  const loadPlatformData = useCallback(async () => {
    try {
      const [
        settingsRes,
        profileRes,
        prefRes,
        resumesRes,
        jobsRes,
        matchesRes,
        recruitersRes,
        tailoredRes,
        outreachRes,
        appsRes,
        autoRes
      ] = await Promise.all([
        fetch('/api/settings').then(r => r.json()).catch(() => null),
        fetch('/api/career/profile').then(r => r.json()).catch(() => null),
        fetch('/api/career/preferences').then(r => r.json()).catch(() => null),
        fetch('/api/career/resumes').then(r => r.json()).catch(() => []),
        fetch('/api/career/jobs').then(r => r.json()).catch(() => []),
        fetch('/api/career/matches').then(r => r.json()).catch(() => []),
        fetch('/api/career/recruiters').then(r => r.json()).catch(() => []),
        fetch('/api/career/tailor').then(r => r.json()).catch(() => []),
        fetch('/api/career/outreach').then(r => r.json()).catch(() => []),
        fetch('/api/career/applications').then(r => r.json()).catch(() => []),
        fetch('/api/career/automation').then(r => r.json()).catch(() => null)
      ]);

      if (settingsRes && !settingsRes.error) setSettings(settingsRes);
      if (profileRes && !profileRes.error) setUserProfile(profileRes);
      if (prefRes && !prefRes.error) setJobPreferences(prefRes);
      if (Array.isArray(resumesRes) && resumesRes.length > 0) setResumes(resumesRes);
      if (Array.isArray(jobsRes) && jobsRes.length > 0) setCareerJobs(jobsRes);
      if (Array.isArray(matchesRes)) {
        const matchMap: Record<string, JobMatchResult> = {};
        for (const m of matchesRes) {
          matchMap[m.job_id] = m;
        }
        setCareerMatches(matchMap);
      }
      if (Array.isArray(recruitersRes)) setCareerContacts(recruitersRes);
      if (Array.isArray(tailoredRes)) setTailoredResumes(tailoredRes);
      if (Array.isArray(outreachRes)) setCareerDrafts(outreachRes);
      if (Array.isArray(appsRes)) setCareerApplications(appsRes);
      if (autoRes && !autoRes.error) setCareerAutomationConfig(autoRes);
    } catch (err) {
      console.error('Error loading CareerPilot AI state:', err);
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

  // ==========================================
  // CAREERPILOT AI HANDLERS
  // ==========================================

  const handleUploadResume = async (data: {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'json';
    content: string;
    profileType: ResumeProfileType;
    title?: string;
  }) => {
    const res = await fetch('/api/career/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const record = await res.json();
      setResumes(prev => [record, ...prev]);
      return record;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload resume');
    }
  };

  const handleDeleteResume = async (id: string) => {
    const res = await fetch(`/api/career/resumes?id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setResumes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSaveJobPreferences = async (updated: Partial<JobPreferences>) => {
    const res = await fetch('/api/career/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const saved = await res.json();
      setJobPreferences(saved);
    }
  };

  const handleSearchLiveJobs = async (provider: string, query: string) => {
    setIsSearchingCareerJobs(true);
    try {
      const res = await fetch('/api/career/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', provider, query })
      });
      const data = await res.json();
      if (res.ok && data.jobs) {
        setCareerJobs(data.jobs);
        return data;
      } else {
        alert(data.error || 'Job search error');
        return data;
      }
    } finally {
      setIsSearchingCareerJobs(false);
    }
  };

  const handleImportJobsCsv = async (csvText: string) => {
    const res = await fetch('/api/career/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'import_csv', csvText })
    });
    const data = await res.json();
    if (data.jobs) {
      setCareerJobs(data.jobs);
    }
    return data;
  };

  const handleAddManualJob = async (job: any) => {
    const res = await fetch('/api/career/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'manual', job })
    });
    const data = await res.json();
    if (res.ok && data.job) {
      setCareerJobs(prev => [data.job, ...prev]);
    }
    return data;
  };

  const handleCalculateMatch = async (jobId: string, resumeId?: string): Promise<JobMatchResult> => {
    const res = await fetch('/api/career/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, resumeId })
    });
    const match = await res.json();
    if (res.ok) {
      setCareerMatches(prev => ({
        ...prev,
        [jobId]: match
      }));
      return match;
    }
    throw new Error(match.error || 'Failed to calculate match');
  };

  const handleDiscoverRecruiters = async (jobId: string) => {
    setIsDiscoveringRecruiters(true);
    try {
      const res = await fetch('/api/career/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (res.ok && data.contacts) {
        setCareerContacts(prev => {
          const others = prev.filter(c => c.job_id !== jobId);
          return [...data.contacts, ...others];
        });
        return data;
      } else {
        alert(data.error || 'Discovery failed');
        return data;
      }
    } finally {
      setIsDiscoveringRecruiters(false);
    }
  };

  const handleGenerateTailoredResume = async (jobId: string, resumeId: string): Promise<TailoredResumeRecord> => {
    const res = await fetch('/api/career/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, resumeId })
    });
    const tailored = await res.json();
    if (res.ok) {
      setTailoredResumes(prev => {
        const others = prev.filter(t => t.id !== tailored.id && t.job_id !== jobId);
        return [tailored, ...others];
      });
      return tailored;
    }
    throw new Error(tailored.error || 'Failed to tailor resume');
  };

  const handleApproveTailoredResume = async (id: string) => {
    const res = await fetch('/api/career/tailor', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      const updated = await res.json();
      setTailoredResumes(prev => prev.map(t => t.id === id ? updated : t));
    }
  };

  const handleGenerateOutreachDraft = async (params: {
    jobId: string;
    contactId?: string;
    resumeId?: string;
    emailType: any;
    tone: any;
  }): Promise<PersonalizedEmailDraft> => {
    const res = await fetch('/api/career/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const draft = await res.json();
    if (res.ok) {
      setCareerDrafts(prev => {
        const others = prev.filter(d => d.id !== draft.id);
        return [draft, ...others];
      });
      return draft;
    }
    throw new Error(draft.error || 'Failed to generate outreach email');
  };

  const handleSaveOutreachDraftEdit = async (id: string, subject: string, body: string, signature: string) => {
    const res = await fetch('/api/career/outreach', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subject, body, signature })
    });
    if (res.ok) {
      const updated = await res.json();
      setCareerDrafts(prev => prev.map(d => d.id === id ? updated : d));
    }
  };

  const handlePushOutreachToGmail = async (draftId: string): Promise<{ success: boolean; gmailDraftId?: string; error?: string }> => {
    const res = await fetch('/api/career/drafts/gmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId })
    });
    const data = await res.json();
    if (res.ok) {
      setCareerDrafts(prev => prev.map(d => d.id === draftId ? {
        ...d,
        gmail_draft_id: data.gmailDraftId,
        gmail_draft_created: true
      } : d));
      return { success: true, gmailDraftId: data.gmailDraftId };
    }
    return { success: false, error: data.error };
  };

  const handleUpdateApplicationStatus = async (id: string, status: ApplicationStatus, notes?: string) => {
    const res = await fetch('/api/career/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes })
    });
    if (res.ok) {
      const updated = await res.json();
      setCareerApplications(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    }
  };

  const handleUpdateAutomationConfig = async (config: Partial<DailyAutomationConfig>) => {
    const res = await fetch('/api/career/automation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      const updated = await res.json();
      setCareerAutomationConfig(updated);
    }
  };

  const handleRunDailyAutomation = async () => {
    setIsAutomatingCareer(true);
    try {
      const res = await fetch('/api/career/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });
      const report = await res.json();
      await loadPlatformData();
      return report;
    } finally {
      setIsAutomatingCareer(false);
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

  const handleResetDemo = async () => {
    await fetch('/api/demo/seed', { method: 'POST' });
    await loadPlatformData();
  };

  // Badge counts
  const matchesCount = Object.keys(careerMatches).length;
  const tailoredCount = tailoredResumes.length;
  const careerDraftsCount = careerDrafts.length;
  const applicationsCount = careerApplications.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        demoMode={settings.demo_mode_active}
        apolloConnected={Boolean((settings as any).apollo_configured)}
        geminiConnected={Boolean((settings as any).gemini_configured)}
        onResetDemo={handleResetDemo}
        onOpenGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onOpenLimitations={() => setIsLimitationsOpen(true)}
        gmailConnected={settings.gmail_connected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunWorkflow={handleRunDailyAutomation}
        isRunningWorkflow={isAutomatingCareer}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          resumesCount={resumes.length}
          jobsCount={careerJobs.length}
          matchesCount={matchesCount}
          tailoredCount={tailoredCount}
          careerDraftsCount={careerDraftsCount}
          applicationsCount={applicationsCount}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh] text-xs text-slate-400">
              Loading CareerPilot AI candidate platform...
            </div>
          ) : (
            <>
              {activeTab === 'career_dashboard' && (
                <CareerDashboardTab
                  resumes={resumes}
                  jobs={careerJobs}
                  applications={careerApplications}
                  drafts={careerDrafts}
                  matches={careerMatches}
                  onNavigate={setActiveTab}
                  onRunAutomation={handleRunDailyAutomation}
                  isAutomating={isAutomatingCareer}
                />
              )}

              {activeTab === 'career_resumes' && (
                <ResumeLibraryTab
                  resumes={resumes}
                  onUploadResume={handleUploadResume}
                  onDeleteResume={handleDeleteResume}
                />
              )}

              {activeTab === 'career_preferences' && (
                <JobPreferencesTab
                  preferences={jobPreferences}
                  onSavePreferences={handleSaveJobPreferences}
                />
              )}

              {activeTab === 'career_jobs' && (
                <JobDiscoveryTab
                  jobs={careerJobs}
                  onSearchLive={handleSearchLiveJobs}
                  onImportCsv={handleImportJobsCsv}
                  onAddManualJob={handleAddManualJob}
                  onSelectJobForMatching={(job) => {
                    handleCalculateMatch(job.id);
                    setActiveTab('career_matching');
                  }}
                  isSearching={isSearchingCareerJobs}
                />
              )}

              {activeTab === 'career_matching' && (
                <JobMatchingTab
                  jobs={careerJobs}
                  resumes={resumes}
                  matches={careerMatches}
                  onCalculateMatch={handleCalculateMatch}
                  onProceedToTailor={(job, resume) => {
                    handleGenerateTailoredResume(job.id, resume.id);
                    setActiveTab('career_tailor');
                  }}
                />
              )}

              {activeTab === 'career_tailor' && (
                <ResumeTailoringTab
                  jobs={careerJobs}
                  resumes={resumes}
                  tailoredResumes={tailoredResumes}
                  onGenerateTailored={handleGenerateTailoredResume}
                  onApproveTailored={handleApproveTailoredResume}
                  onProceedToOutreach={(_job, _tailored) => {
                    setActiveTab('career_outreach');
                  }}
                />
              )}

              {activeTab === 'career_recruiters' && (
                <RecruiterDiscoveryTab
                  jobs={careerJobs}
                  contacts={careerContacts}
                  onDiscoverContacts={handleDiscoverRecruiters}
                  onSelectContactForEmail={(_contact, _job) => {
                    setActiveTab('career_outreach');
                  }}
                  isDiscovering={isDiscoveringRecruiters}
                />
              )}

              {activeTab === 'career_outreach' && (
                <PersonalizedOutreachTab
                  jobs={careerJobs}
                  resumes={resumes}
                  contacts={careerContacts}
                  drafts={careerDrafts}
                  onGenerateDraft={handleGenerateOutreachDraft}
                  onSaveDraftEdit={handleSaveOutreachDraftEdit}
                  onPushToGmail={handlePushOutreachToGmail}
                />
              )}

              {activeTab === 'career_drafts' && (
                <CareerDraftQueueTab
                  drafts={careerDrafts}
                  settings={settings}
                  onPushToGmail={handlePushOutreachToGmail}
                  onRefresh={loadPlatformData}
                />
              )}

              {activeTab === 'career_tracker' && (
                <ApplicationTrackerTab
                  applications={careerApplications}
                  onUpdateStatus={handleUpdateApplicationStatus}
                />
              )}

              {activeTab === 'career_automation' && (
                <DailyAutomationTab
                  config={careerAutomationConfig}
                  onUpdateConfig={handleUpdateAutomationConfig}
                  onRunNow={handleRunDailyAutomation}
                  isRunning={isAutomatingCareer}
                />
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
      />

      <KnownLimitationsModal
        isOpen={isLimitationsOpen}
        onClose={() => setIsLimitationsOpen(false)}
      />
    </div>
  );
}
