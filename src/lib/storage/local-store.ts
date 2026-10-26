import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
  IntegrationSettings,
  ApprovalStatus,
  UserProfile,
  JobPreferences,
  ResumeRecord,
  JobListing,
  RecruiterContact,
  JobMatchResult,
  TailoredResumeRecord,
  JobApplicationRecord,
  PersonalizedEmailDraft,
  DailyAutomationConfig,
  ApplicationStatus
} from '@/types';
import { 
  INITIAL_ICP, 
  INITIAL_SETTINGS, 
  DEMO_COMPANIES, 
  DEMO_CONTACTS, 
  DEMO_ENRICHMENTS,
  DEFAULT_USER_PROFILE,
  DEFAULT_JOB_PREFERENCES,
  DEFAULT_RESUMES,
  DEMO_JOB_LISTINGS,
  DEMO_RECRUITER_CONTACTS,
  DEMO_JOB_MATCHES,
  DEMO_APPLICATIONS,
  DEFAULT_DAILY_AUTOMATION_CONFIG
} from '@/lib/seed';

interface DatabaseSchema {
  icp: ICPConfig;
  settings: IntegrationSettings;
  companies: Company[];
  contacts: Contact[];
  enrichments: Record<string, EnrichmentRecord>;
  approvalHistory: ApprovalHistoryItem[];
  emailSequences: Record<string, EmailSequence>;
  emailDrafts: EmailDraftRecord[];
  workflowExecutions: WorkflowExecution[];
  workflowLogs: WorkflowLog[];

  // CareerPilot AI Collections
  userProfile?: UserProfile;
  jobPreferences?: JobPreferences;
  resumes?: ResumeRecord[];
  jobListings?: JobListing[];
  jobMatches?: Record<string, JobMatchResult>;
  recruiterContacts?: RecruiterContact[];
  tailoredResumes?: Record<string, TailoredResumeRecord>;
  jobApplications?: JobApplicationRecord[];
  personalizedDrafts?: PersonalizedEmailDraft[];
  dailyAutomationConfig?: DailyAutomationConfig;
}

function getDbPath(): string {
  if (process.env.OSVI_DB_PATH) {
    return process.env.OSVI_DB_PATH;
  }
  return path.join(process.cwd(), 'data', 'osvi-gtm-db.json');
}

function getDataDir(): string {
  return path.dirname(getDbPath());
}

function ensureDbFile(): DatabaseSchema {
  const dataDir = getDataDir();
  const dbPath = getDbPath();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const defaultFullDb: DatabaseSchema = {
    icp: INITIAL_ICP,
    settings: INITIAL_SETTINGS,
    companies: [...DEMO_COMPANIES],
    contacts: [...DEMO_CONTACTS],
    enrichments: { ...DEMO_ENRICHMENTS },
    approvalHistory: [],
    emailSequences: {},
    emailDrafts: [],
    workflowExecutions: [],
    workflowLogs: [],
    userProfile: { ...DEFAULT_USER_PROFILE },
    jobPreferences: { ...DEFAULT_JOB_PREFERENCES },
    resumes: [...DEFAULT_RESUMES],
    jobListings: [...DEMO_JOB_LISTINGS],
    jobMatches: { ...DEMO_JOB_MATCHES },
    recruiterContacts: [...DEMO_RECRUITER_CONTACTS],
    tailoredResumes: {},
    jobApplications: [...DEMO_APPLICATIONS],
    personalizedDrafts: [],
    dailyAutomationConfig: { ...DEFAULT_DAILY_AUTOMATION_CONFIG }
  };

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultFullDb, null, 2), 'utf-8');
    return defaultFullDb;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let modified = false;

    if (!parsed.userProfile) { parsed.userProfile = { ...DEFAULT_USER_PROFILE }; modified = true; }
    if (!parsed.jobPreferences) { parsed.jobPreferences = { ...DEFAULT_JOB_PREFERENCES }; modified = true; }
    if (!parsed.resumes || parsed.resumes.length === 0) { parsed.resumes = [...DEFAULT_RESUMES]; modified = true; }
    if (!parsed.jobListings || parsed.jobListings.length === 0) { parsed.jobListings = [...DEMO_JOB_LISTINGS]; modified = true; }
    if (!parsed.jobMatches) { parsed.jobMatches = { ...DEMO_JOB_MATCHES }; modified = true; }
    if (!parsed.recruiterContacts || parsed.recruiterContacts.length === 0) { parsed.recruiterContacts = [...DEMO_RECRUITER_CONTACTS]; modified = true; }
    if (!parsed.tailoredResumes) { parsed.tailoredResumes = {}; modified = true; }
    if (!parsed.jobApplications || parsed.jobApplications.length === 0) { parsed.jobApplications = [...DEMO_APPLICATIONS]; modified = true; }
    if (!parsed.personalizedDrafts) { parsed.personalizedDrafts = []; modified = true; }
    if (!parsed.dailyAutomationConfig) { parsed.dailyAutomationConfig = { ...DEFAULT_DAILY_AUTOMATION_CONFIG }; modified = true; }

    if (modified) {
      fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local db, resetting:', err);
    fs.writeFileSync(dbPath, JSON.stringify(defaultFullDb, null, 2), 'utf-8');
    return defaultFullDb;
  }
}

function saveDb(data: DatabaseSchema): void {
  const dataDir = getDataDir();
  const dbPath = getDbPath();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export class LocalStore {
  // ICP
  static getIcp(): ICPConfig {
    const db = ensureDbFile();
    return db.icp || INITIAL_ICP;
  }

  static updateIcp(icp: Partial<ICPConfig>): ICPConfig {
    const db = ensureDbFile();
    db.icp = {
      ...db.icp,
      ...icp,
      updated_at: new Date().toISOString()
    };
    saveDb(db);
    return db.icp;
  }

  // Settings
  static getSettings(): IntegrationSettings {
    const db = ensureDbFile();
    return db.settings || INITIAL_SETTINGS;
  }

  static updateSettings(settings: Partial<IntegrationSettings>): IntegrationSettings {
    const db = ensureDbFile();
    db.settings = {
      ...db.settings,
      ...settings,
      updated_at: new Date().toISOString()
    };
    saveDb(db);
    return db.settings;
  }

  // Companies
  static getCompanies(): Company[] {
    const db = ensureDbFile();
    return db.companies || [];
  }

  static getCompanyById(id: string): Company | undefined {
    const db = ensureDbFile();
    return db.companies.find(c => c.id === id);
  }

  static addCompany(company: Company): Company {
    const db = ensureDbFile();
    const existing = db.companies.find(c => c.name.toLowerCase() === company.name.toLowerCase());
    if (existing) {
      return existing;
    }
    db.companies.unshift(company);
    saveDb(db);
    return company;
  }

  static addCompanies(companies: Company[]): Company[] {
    const db = ensureDbFile();
    const added: Company[] = [];
    for (const c of companies) {
      const exists = db.companies.some(
        existing => existing.name.toLowerCase() === c.name.toLowerCase()
      );
      if (!exists) {
        db.companies.push(c);
        added.push(c);
      }
    }
    saveDb(db);
    return added;
  }

  // Contacts
  static getContacts(filter?: { company_id?: string; approval_status?: ApprovalStatus }): Contact[] {
    const db = ensureDbFile();
    let contacts = db.contacts || [];
    if (filter?.company_id) {
      contacts = contacts.filter(c => c.company_id === filter.company_id);
    }
    if (filter?.approval_status) {
      contacts = contacts.filter(c => c.approval_status === filter.approval_status);
    }
    return contacts;
  }

  static getContactById(id: string): Contact | undefined {
    const db = ensureDbFile();
    return db.contacts.find(c => c.id === id);
  }

  static addContact(contact: Contact): Contact {
    const db = ensureDbFile();
    const exists = db.contacts.some(c => 
      (c.work_email && c.work_email !== 'unavailable' && contact.work_email && contact.work_email !== 'unavailable' && c.work_email.toLowerCase() === contact.work_email.toLowerCase()) ||
      ((c.company_id === contact.company_id || (c.company_name && contact.company_name && c.company_name.toLowerCase() === contact.company_name.toLowerCase())) && c.full_name.toLowerCase() === contact.full_name.toLowerCase())
    );
    if (exists) {
      return db.contacts.find(c => c.id === contact.id) || contact;
    }
    db.contacts.unshift(contact);
    saveDb(db);
    return contact;
  }

  static addContacts(contacts: Contact[]): Contact[] {
    const db = ensureDbFile();
    const added: Contact[] = [];
    for (const c of contacts) {
      const exists = db.contacts.some(existing => 
        (existing.work_email && existing.work_email !== 'unavailable' && c.work_email && c.work_email !== 'unavailable' && existing.work_email.toLowerCase() === c.work_email.toLowerCase()) ||
        ((existing.company_id === c.company_id || (existing.company_name && c.company_name && existing.company_name.toLowerCase() === c.company_name.toLowerCase())) && existing.full_name.toLowerCase() === c.full_name.toLowerCase())
      );
      if (!exists) {
        db.contacts.push(c);
        added.push(c);
      }
    }
    saveDb(db);
    return added;
  }

  static updateContactApproval(
    lead_id: string, 
    status: ApprovalStatus, 
    reviewer_notes?: string, 
    rejection_reason?: string,
    changed_by?: string
  ): Contact {
    const db = ensureDbFile();
    const index = db.contacts.findIndex(c => c.id === lead_id);
    if (index === -1) {
      throw new Error(`Contact with id ${lead_id} not found`);
    }

    const prev = db.contacts[index];
    
    // Snapshot evidence hash at approval time to protect against post-approval tampering
    let evidenceHash = prev.approval_evidence_hash;
    if (status === 'APPROVED') {
      const enrichment = db.enrichments[lead_id];
      const hashPayload = enrichment ? JSON.stringify({
        overview: enrichment.company_overview,
        locations: enrichment.location_count_verifiable,
        challenges: enrichment.operational_challenges,
        signals: enrichment.verified_buying_signals,
        hook: enrichment.personalization_hook
      }) : '';
      evidenceHash = crypto.createHash('sha256').update(hashPayload).digest('hex');
    } else {
      evidenceHash = undefined;
    }

    const updated: Contact = {
      ...prev,
      approval_status: status,
      approval_evidence_hash: evidenceHash,
      reviewer_notes: reviewer_notes !== undefined ? reviewer_notes : prev.reviewer_notes,
      rejection_reason: rejection_reason !== undefined ? rejection_reason : prev.rejection_reason,
      reviewed_at: new Date().toISOString()
    };

    db.contacts[index] = updated;

    // Log history with authentic reviewer identity
    const reviewer = changed_by || 'amaymishra1104@gmail.com (Auditor)';
    const historyItem: ApprovalHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id,
      previous_status: prev.approval_status,
      new_status: status,
      reviewer_notes,
      rejection_reason,
      changed_at: new Date().toISOString(),
      changed_by: reviewer
    };
    db.approvalHistory = db.approvalHistory || [];
    db.approvalHistory.unshift(historyItem);

    saveDb(db);
    return updated;
  }

  static getApprovalHistory(lead_id?: string): ApprovalHistoryItem[] {
    const db = ensureDbFile();
    if (lead_id) {
      return (db.approvalHistory || []).filter(h => h.lead_id === lead_id);
    }
    return db.approvalHistory || [];
  }

  // Enrichments
  static getEnrichmentByLeadId(lead_id: string): EnrichmentRecord | undefined {
    const db = ensureDbFile();
    return db.enrichments?.[lead_id];
  }

  static saveEnrichment(enrichment: EnrichmentRecord): EnrichmentRecord {
    const db = ensureDbFile();
    db.enrichments = db.enrichments || {};
    db.enrichments[enrichment.lead_id] = enrichment;
    saveDb(db);
    return enrichment;
  }

  // Sequences
  static getSequenceByLeadId(lead_id: string): EmailSequence | undefined {
    const db = ensureDbFile();
    return db.emailSequences?.[lead_id];
  }

  static getSequences(): EmailSequence[] {
    const db = ensureDbFile();
    return Object.values(db.emailSequences || {});
  }

  static saveSequence(sequence: EmailSequence): EmailSequence {
    const db = ensureDbFile();
    db.emailSequences = db.emailSequences || {};
    db.emailSequences[sequence.lead_id] = sequence;
    saveDb(db);
    return sequence;
  }

  // Drafts
  static getDrafts(lead_id?: string, includeRevoked: boolean = false): EmailDraftRecord[] {
    const db = ensureDbFile();
    let drafts = db.emailDrafts || [];
    if (lead_id) {
      drafts = drafts.filter(d => d.lead_id === lead_id);
    }
    
    // Cross-reference approval status for each draft
    const contactsMap = new Map<string, Contact>((db.contacts || []).map(c => [c.id, c]));
    
    const mapped = drafts.map(d => {
      const contact = contactsMap.get(d.lead_id);
      const isApproved = contact?.approval_status === 'APPROVED';
      return {
        ...d,
        is_approval_revoked: !isApproved
      };
    });

    if (!includeRevoked) {
      // Hide drafts whose approval was revoked (REJECTED or PENDING)
      return mapped.filter(d => !d.is_approval_revoked).sort((a, b) => a.sequence_step - b.sequence_step);
    }

    return mapped.sort((a, b) => a.sequence_step - b.sequence_step);
  }

  static saveDraft(draft: EmailDraftRecord): EmailDraftRecord {
    const db = ensureDbFile();
    db.emailDrafts = db.emailDrafts || [];
    const index = db.emailDrafts.findIndex(
      d => d.lead_id === draft.lead_id && d.sequence_step === draft.sequence_step
    );
    if (index >= 0) {
      db.emailDrafts[index] = draft;
    } else {
      db.emailDrafts.push(draft);
    }
    saveDb(db);
    return draft;
  }

  // Workflow
  static getLatestWorkflowExecution(): WorkflowExecution | undefined {
    const db = ensureDbFile();
    const latest = (db.workflowExecutions || [])[0];
    if (latest && latest.status === 'RUNNING') {
      const elapsed = Date.now() - new Date(latest.started_at).getTime();
      // If running for more than 2 minutes without completion, auto-recover from orphaned state
      if (elapsed > 120000) {
        latest.status = 'FAILED';
        latest.summary = 'Execution interrupted or timed out. Ready to re-run.';
        latest.completed_at = new Date().toISOString();
        saveDb(db);
      }
    }
    return latest;
  }

  static getWorkflowExecutions(): WorkflowExecution[] {
    const db = ensureDbFile();
    return db.workflowExecutions || [];
  }

  static saveWorkflowExecution(execution: WorkflowExecution): WorkflowExecution {
    const db = ensureDbFile();
    db.workflowExecutions = db.workflowExecutions || [];
    const index = db.workflowExecutions.findIndex(e => e.id === execution.id);
    if (index >= 0) {
      db.workflowExecutions[index] = execution;
    } else {
      db.workflowExecutions.unshift(execution);
    }
    saveDb(db);
    return execution;
  }

  static addWorkflowLog(log: WorkflowLog): WorkflowLog {
    const db = ensureDbFile();
    db.workflowLogs = db.workflowLogs || [];
    db.workflowLogs.unshift(log);
    saveDb(db);
    return log;
  }

  static getWorkflowLogs(execution_id?: string): WorkflowLog[] {
    const db = ensureDbFile();
    if (execution_id) {
      return (db.workflowLogs || []).filter(l => l.execution_id === execution_id);
    }
    return db.workflowLogs || [];
  }

  // ==========================================================================
  // CareerPilot AI Methods
  // ==========================================================================

  // User Profile
  static getUserProfile(): UserProfile {
    const db = ensureDbFile();
    return db.userProfile || DEFAULT_USER_PROFILE;
  }

  static updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const db = ensureDbFile();
    db.userProfile = {
      ...(db.userProfile || DEFAULT_USER_PROFILE),
      ...profile,
      updated_at: new Date().toISOString()
    };
    saveDb(db);
    return db.userProfile;
  }

  // Job Preferences
  static getJobPreferences(): JobPreferences {
    const db = ensureDbFile();
    return db.jobPreferences || DEFAULT_JOB_PREFERENCES;
  }

  static updateJobPreferences(prefs: Partial<JobPreferences>): JobPreferences {
    const db = ensureDbFile();
    db.jobPreferences = {
      ...(db.jobPreferences || DEFAULT_JOB_PREFERENCES),
      ...prefs,
      updated_at: new Date().toISOString()
    };
    saveDb(db);
    return db.jobPreferences;
  }

  // Resumes
  static getResumes(userId?: string): ResumeRecord[] {
    const db = ensureDbFile();
    const resumes = db.resumes || DEFAULT_RESUMES;
    if (userId) {
      return resumes.filter(r => r.user_id === userId);
    }
    return resumes;
  }

  static getResumeById(id: string): ResumeRecord | undefined {
    const db = ensureDbFile();
    return (db.resumes || []).find(r => r.id === id);
  }

  static saveResume(resume: ResumeRecord): ResumeRecord {
    const db = ensureDbFile();
    db.resumes = db.resumes || [];
    const index = db.resumes.findIndex(r => r.id === resume.id);
    if (index >= 0) {
      db.resumes[index] = resume;
    } else {
      db.resumes.push(resume);
    }
    saveDb(db);
    return resume;
  }

  static deleteResume(id: string): boolean {
    const db = ensureDbFile();
    const initialLen = (db.resumes || []).length;
    db.resumes = (db.resumes || []).filter(r => r.id !== id);
    if (db.resumes.length !== initialLen) {
      saveDb(db);
      return true;
    }
    return false;
  }

  // Job Listings
  static getJobListings(filter?: { company?: string; location?: string; keyword?: string }): JobListing[] {
    const db = ensureDbFile();
    let jobs: JobListing[] = db.jobListings || DEMO_JOB_LISTINGS;
    if (filter) {
      if (filter.company) {
        jobs = jobs.filter((j: JobListing) => j.company.toLowerCase().includes(filter.company!.toLowerCase()));
      }
      if (filter.location) {
        jobs = jobs.filter((j: JobListing) => j.location.toLowerCase().includes(filter.location!.toLowerCase()));
      }
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        jobs = jobs.filter((j: JobListing) => 
          j.title.toLowerCase().includes(kw) || 
          j.description.toLowerCase().includes(kw) ||
          j.required_skills.some((s: string) => s.toLowerCase().includes(kw))
        );
      }
    }
    return jobs;
  }

  static getJobById(id: string): JobListing | undefined {
    const db = ensureDbFile();
    return (db.jobListings || []).find(j => j.id === id);
  }

  static addJobListing(job: JobListing): JobListing {
    const db = ensureDbFile();
    db.jobListings = db.jobListings || [];
    const existing = db.jobListings.find(j => 
      j.id === job.id || 
      (j.title.toLowerCase().trim() === job.title.toLowerCase().trim() && 
       j.company.toLowerCase().trim() === job.company.toLowerCase().trim())
    );
    if (existing) {
      return existing;
    }
    db.jobListings.unshift(job);
    saveDb(db);
    return job;
  }

  static addJobListings(jobs: JobListing[]): JobListing[] {
    const db = ensureDbFile();
    db.jobListings = db.jobListings || [];
    const added: JobListing[] = [];
    for (const job of jobs) {
      const exists = db.jobListings.some(j => 
        j.id === job.id || 
        (j.title.toLowerCase().trim() === job.title.toLowerCase().trim() && 
         j.company.toLowerCase().trim() === job.company.toLowerCase().trim())
      );
      if (!exists) {
        db.jobListings.unshift(job);
        added.push(job);
      }
    }
    if (added.length > 0) {
      saveDb(db);
    }
    return added;
  }

  static updateJobListing(id: string, updates: Partial<JobListing>): JobListing | undefined {
    const db = ensureDbFile();
    db.jobListings = db.jobListings || [];
    const idx = db.jobListings.findIndex(j => j.id === id);
    if (idx >= 0) {
      db.jobListings[idx] = { ...db.jobListings[idx], ...updates };
      saveDb(db);
      return db.jobListings[idx];
    }
    return undefined;
  }

  // Matches
  static getJobMatches(userId?: string): Record<string, JobMatchResult> {
    const db = ensureDbFile();
    return db.jobMatches || DEMO_JOB_MATCHES;
  }

  static getJobMatchByJobId(jobId: string): JobMatchResult | undefined {
    const db = ensureDbFile();
    return (db.jobMatches || {})[jobId];
  }

  static saveJobMatch(match: JobMatchResult): JobMatchResult {
    const db = ensureDbFile();
    db.jobMatches = db.jobMatches || {};
    db.jobMatches[match.job_id] = match;
    saveDb(db);
    return match;
  }

  // Recruiter Contacts
  static getRecruiterContacts(jobId?: string): RecruiterContact[] {
    const db = ensureDbFile();
    const contacts: RecruiterContact[] = db.recruiterContacts || DEMO_RECRUITER_CONTACTS;
    if (jobId) {
      return contacts.filter((c: RecruiterContact) => c.job_id === jobId);
    }
    return contacts;
  }

  static getRecruiterContactById(id: string): RecruiterContact | undefined {
    const db = ensureDbFile();
    return (db.recruiterContacts || []).find(c => c.id === id);
  }

  static saveRecruiterContact(contact: RecruiterContact): RecruiterContact {
    const db = ensureDbFile();
    db.recruiterContacts = db.recruiterContacts || [];
    const index = db.recruiterContacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      db.recruiterContacts[index] = contact;
    } else {
      db.recruiterContacts.push(contact);
    }
    saveDb(db);
    return contact;
  }

  // Tailored Resumes
  static getTailoredResumes(jobId?: string): TailoredResumeRecord[] {
    const db = ensureDbFile();
    const tailoredMap = db.tailoredResumes || {};
    const list = Object.values(tailoredMap);
    if (jobId) {
      return list.filter(t => t.job_id === jobId);
    }
    return list;
  }

  static getTailoredResumeById(id: string): TailoredResumeRecord | undefined {
    const db = ensureDbFile();
    const tailoredMap = db.tailoredResumes || {};
    for (const key of Object.keys(tailoredMap)) {
      if (tailoredMap[key].id === id || key === id) {
        return tailoredMap[key];
      }
    }
    return undefined;
  }

  static saveTailoredResume(tailored: TailoredResumeRecord): TailoredResumeRecord {
    const db = ensureDbFile();
    db.tailoredResumes = db.tailoredResumes || {};
    db.tailoredResumes[tailored.job_id] = tailored;
    saveDb(db);
    return tailored;
  }

  // Job Applications
  static getJobApplications(userId?: string): JobApplicationRecord[] {
    const db = ensureDbFile();
    const apps: JobApplicationRecord[] = db.jobApplications || DEMO_APPLICATIONS;
    if (userId) {
      return apps.filter((a: JobApplicationRecord) => a.user_id === userId);
    }
    return apps;
  }

  static getJobApplicationById(id: string): JobApplicationRecord | undefined {
    const db = ensureDbFile();
    return (db.jobApplications || []).find(a => a.id === id);
  }

  static saveJobApplication(app: JobApplicationRecord): JobApplicationRecord {
    const db = ensureDbFile();
    db.jobApplications = db.jobApplications || [];
    const idx = db.jobApplications.findIndex(a => a.id === app.id || a.job_id === app.job_id);
    if (idx >= 0) {
      db.jobApplications[idx] = { ...db.jobApplications[idx], ...app, updated_at: new Date().toISOString() };
      saveDb(db);
      return db.jobApplications[idx];
    } else {
      db.jobApplications.unshift(app);
      saveDb(db);
      return app;
    }
  }

  static updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): JobApplicationRecord | undefined {
    const db = ensureDbFile();
    db.jobApplications = db.jobApplications || [];
    const app = db.jobApplications.find(a => a.id === id || a.job_id === id);
    if (app) {
      app.status = status;
      if (notes) app.notes = notes;
      if (status === 'Applied' && !app.date_applied) {
        app.date_applied = new Date().toISOString();
      }
      app.updated_at = new Date().toISOString();
      saveDb(db);
      return app;
    }
    return undefined;
  }

  // Personalized Email Drafts
  static getPersonalizedDrafts(jobId?: string): PersonalizedEmailDraft[] {
    const db = ensureDbFile();
    const drafts = db.personalizedDrafts || [];
    if (jobId) {
      return drafts.filter(d => d.job_id === jobId);
    }
    return drafts;
  }

  static getPersonalizedDraftById(id: string): PersonalizedEmailDraft | undefined {
    const db = ensureDbFile();
    return (db.personalizedDrafts || []).find(d => d.id === id);
  }

  static savePersonalizedDraft(draft: PersonalizedEmailDraft): PersonalizedEmailDraft {
    const db = ensureDbFile();
    db.personalizedDrafts = db.personalizedDrafts || [];
    const idx = db.personalizedDrafts.findIndex(d => d.id === draft.id);
    if (idx >= 0) {
      db.personalizedDrafts[idx] = draft;
    } else {
      db.personalizedDrafts.unshift(draft);
    }
    saveDb(db);
    return draft;
  }

  // Daily Automation Config
  static getDailyAutomationConfig(): DailyAutomationConfig {
    const db = ensureDbFile();
    return db.dailyAutomationConfig || DEFAULT_DAILY_AUTOMATION_CONFIG;
  }

  static updateDailyAutomationConfig(config: Partial<DailyAutomationConfig>): DailyAutomationConfig {
    const db = ensureDbFile();
    db.dailyAutomationConfig = {
      ...(db.dailyAutomationConfig || DEFAULT_DAILY_AUTOMATION_CONFIG),
      ...config
    };
    saveDb(db);
    return db.dailyAutomationConfig;
  }

  // Reset to Demo Data
  static resetToDemo(): void {
    const freshDb: DatabaseSchema = {
      icp: INITIAL_ICP,
      settings: INITIAL_SETTINGS,
      companies: [...DEMO_COMPANIES],
      contacts: [...DEMO_CONTACTS],
      enrichments: { ...DEMO_ENRICHMENTS },
      approvalHistory: [],
      emailSequences: {},
      emailDrafts: [],
      workflowExecutions: [],
      workflowLogs: [],
      userProfile: { ...DEFAULT_USER_PROFILE },
      jobPreferences: { ...DEFAULT_JOB_PREFERENCES },
      resumes: [...DEFAULT_RESUMES],
      jobListings: [...DEMO_JOB_LISTINGS],
      jobMatches: { ...DEMO_JOB_MATCHES },
      recruiterContacts: [...DEMO_RECRUITER_CONTACTS],
      tailoredResumes: {},
      jobApplications: [...DEMO_APPLICATIONS],
      personalizedDrafts: [],
      dailyAutomationConfig: { ...DEFAULT_DAILY_AUTOMATION_CONFIG }
    };
    saveDb(freshDb);
  }
}
