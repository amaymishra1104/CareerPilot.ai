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
  ApprovalStatus 
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

  static resetToDemo(): void {
    LocalStore.resetToDemo();
  }
}
