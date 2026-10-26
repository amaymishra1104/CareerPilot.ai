import { LocalStore } from './local-store';
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

/**
 * Universal Store Facade.
 * Standardized across the application, backed by local transactional JSON persistence
 * with isolated test environment support via OSVI_DB_PATH.
 */
export class Store {
  static getIcp(): ICPConfig {
    return LocalStore.getIcp();
  }

  static updateIcp(icp: Partial<ICPConfig>): ICPConfig {
    return LocalStore.updateIcp(icp);
  }

  static getSettings(): IntegrationSettings {
    return LocalStore.getSettings();
  }

  static updateSettings(settings: Partial<IntegrationSettings>): IntegrationSettings {
    return LocalStore.updateSettings(settings);
  }

  static getCompanies(): Company[] {
    return LocalStore.getCompanies();
  }

  static getCompanyById(id: string): Company | undefined {
    return LocalStore.getCompanyById(id);
  }

  static addCompany(company: Company): Company {
    return LocalStore.addCompany(company);
  }

  static addCompanies(companies: Company[]): Company[] {
    return LocalStore.addCompanies(companies);
  }

  static getContacts(filter?: { company_id?: string; approval_status?: ApprovalStatus }): Contact[] {
    return LocalStore.getContacts(filter);
  }

  static getContactById(id: string): Contact | undefined {
    return LocalStore.getContactById(id);
  }

  static addContact(contact: Contact): Contact {
    return LocalStore.addContact(contact);
  }

  static addContacts(contacts: Contact[]): Contact[] {
    return LocalStore.addContacts(contacts);
  }

  static updateContactApproval(
    lead_id: string, 
    status: ApprovalStatus, 
    reviewer_notes?: string, 
    rejection_reason?: string,
    changed_by?: string
  ): Contact {
    return LocalStore.updateContactApproval(lead_id, status, reviewer_notes, rejection_reason, changed_by);
  }

  static getApprovalHistory(lead_id?: string): ApprovalHistoryItem[] {
    return LocalStore.getApprovalHistory(lead_id);
  }

  static getEnrichmentByLeadId(lead_id: string): EnrichmentRecord | undefined {
    return LocalStore.getEnrichmentByLeadId(lead_id);
  }

  static saveEnrichment(enrichment: EnrichmentRecord): EnrichmentRecord {
    return LocalStore.saveEnrichment(enrichment);
  }

  static getSequenceByLeadId(lead_id: string): EmailSequence | undefined {
    return LocalStore.getSequenceByLeadId(lead_id);
  }

  static getSequences(): EmailSequence[] {
    return LocalStore.getSequences();
  }

  static saveSequence(sequence: EmailSequence): EmailSequence {
    return LocalStore.saveSequence(sequence);
  }

  static getDrafts(lead_id?: string, includeRevoked: boolean = false): EmailDraftRecord[] {
    return LocalStore.getDrafts(lead_id, includeRevoked);
  }

  static saveDraft(draft: EmailDraftRecord): EmailDraftRecord {
    return LocalStore.saveDraft(draft);
  }

  static getLatestWorkflowExecution(): WorkflowExecution | undefined {
    return LocalStore.getLatestWorkflowExecution();
  }

  static getWorkflowExecutions(): WorkflowExecution[] {
    return LocalStore.getWorkflowExecutions();
  }

  static saveWorkflowExecution(execution: WorkflowExecution): WorkflowExecution {
    return LocalStore.saveWorkflowExecution(execution);
  }

  static addWorkflowLog(log: WorkflowLog): WorkflowLog {
    return LocalStore.addWorkflowLog(log);
  }

  static getWorkflowLogs(execution_id?: string): WorkflowLog[] {
    return LocalStore.getWorkflowLogs(execution_id);
  }

  // ==========================================================================
  // CareerPilot AI Core Facade Methods
  // ==========================================================================

  static getUserProfile(): UserProfile {
    return LocalStore.getUserProfile();
  }

  static updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    return LocalStore.updateUserProfile(profile);
  }

  static getJobPreferences(): JobPreferences {
    return LocalStore.getJobPreferences();
  }

  static updateJobPreferences(prefs: Partial<JobPreferences>): JobPreferences {
    return LocalStore.updateJobPreferences(prefs);
  }

  static getResumes(userId?: string): ResumeRecord[] {
    return LocalStore.getResumes(userId);
  }

  static getResumeById(id: string): ResumeRecord | undefined {
    return LocalStore.getResumeById(id);
  }

  static saveResume(resume: ResumeRecord): ResumeRecord {
    return LocalStore.saveResume(resume);
  }

  static deleteResume(id: string): boolean {
    return LocalStore.deleteResume(id);
  }

  static getJobListings(filter?: { company?: string; location?: string; keyword?: string }): JobListing[] {
    return LocalStore.getJobListings(filter);
  }

  static getJobById(id: string): JobListing | undefined {
    return LocalStore.getJobById(id);
  }

  static addJobListing(job: JobListing): JobListing {
    return LocalStore.addJobListing(job);
  }

  static addJobListings(jobs: JobListing[]): JobListing[] {
    return LocalStore.addJobListings(jobs);
  }

  static updateJobListing(id: string, updates: Partial<JobListing>): JobListing | undefined {
    return LocalStore.updateJobListing(id, updates);
  }

  static getJobMatches(userId?: string): Record<string, JobMatchResult> {
    return LocalStore.getJobMatches(userId);
  }

  static getJobMatchByJobId(jobId: string): JobMatchResult | undefined {
    return LocalStore.getJobMatchByJobId(jobId);
  }

  static saveJobMatch(match: JobMatchResult): JobMatchResult {
    return LocalStore.saveJobMatch(match);
  }

  static getRecruiterContacts(jobId?: string): RecruiterContact[] {
    return LocalStore.getRecruiterContacts(jobId);
  }

  static getRecruiterContactById(id: string): RecruiterContact | undefined {
    return LocalStore.getRecruiterContactById(id);
  }

  static saveRecruiterContact(contact: RecruiterContact): RecruiterContact {
    return LocalStore.saveRecruiterContact(contact);
  }

  static getTailoredResumes(jobId?: string): TailoredResumeRecord[] {
    return LocalStore.getTailoredResumes(jobId);
  }

  static getTailoredResumeById(id: string): TailoredResumeRecord | undefined {
    return LocalStore.getTailoredResumeById(id);
  }

  static saveTailoredResume(tailored: TailoredResumeRecord): TailoredResumeRecord {
    return LocalStore.saveTailoredResume(tailored);
  }

  static getJobApplications(userId?: string): JobApplicationRecord[] {
    return LocalStore.getJobApplications(userId);
  }

  static getJobApplicationById(id: string): JobApplicationRecord | undefined {
    return LocalStore.getJobApplicationById(id);
  }

  static saveJobApplication(app: JobApplicationRecord): JobApplicationRecord {
    return LocalStore.saveJobApplication(app);
  }

  static updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): JobApplicationRecord | undefined {
    return LocalStore.updateApplicationStatus(id, status, notes);
  }

  static getPersonalizedDrafts(jobId?: string): PersonalizedEmailDraft[] {
    return LocalStore.getPersonalizedDrafts(jobId);
  }

  static getPersonalizedDraftById(id: string): PersonalizedEmailDraft | undefined {
    return LocalStore.getPersonalizedDraftById(id);
  }

  static savePersonalizedDraft(draft: PersonalizedEmailDraft): PersonalizedEmailDraft {
    return LocalStore.savePersonalizedDraft(draft);
  }

  static getDailyAutomationConfig(): DailyAutomationConfig {
    return LocalStore.getDailyAutomationConfig();
  }

  static updateDailyAutomationConfig(config: Partial<DailyAutomationConfig>): DailyAutomationConfig {
    return LocalStore.updateDailyAutomationConfig(config);
  }

  static resetToDemo(): void {
    LocalStore.resetToDemo();
  }
}

