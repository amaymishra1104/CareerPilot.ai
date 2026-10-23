import fs from 'fs';
import path from 'path';
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
import { 
  INITIAL_ICP, 
  INITIAL_SETTINGS, 
  DEMO_COMPANIES, 
  DEMO_CONTACTS, 
  DEMO_ENRICHMENTS 
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
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'osvi-gtm-db.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      icp: INITIAL_ICP,
      settings: INITIAL_SETTINGS,
      companies: [...DEMO_COMPANIES],
      contacts: [...DEMO_CONTACTS],
      enrichments: { ...DEMO_ENRICHMENTS },
      approvalHistory: [],
      emailSequences: {},
      emailDrafts: [],
      workflowExecutions: [],
      workflowLogs: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading local db, resetting:', err);
    const fallback: DatabaseSchema = {
      icp: INITIAL_ICP,
      settings: INITIAL_SETTINGS,
      companies: [...DEMO_COMPANIES],
      contacts: [...DEMO_CONTACTS],
      enrichments: { ...DEMO_ENRICHMENTS },
      approvalHistory: [],
      emailSequences: {},
      emailDrafts: [],
      workflowExecutions: [],
      workflowLogs: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
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
      (c.work_email && contact.work_email && c.work_email.toLowerCase() === contact.work_email.toLowerCase()) ||
      (c.company_id === contact.company_id && c.full_name.toLowerCase() === contact.full_name.toLowerCase())
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
        (existing.work_email && c.work_email && existing.work_email.toLowerCase() === c.work_email.toLowerCase()) ||
        (existing.company_id === c.company_id && existing.full_name.toLowerCase() === c.full_name.toLowerCase())
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
    rejection_reason?: string
  ): Contact {
    const db = ensureDbFile();
    const index = db.contacts.findIndex(c => c.id === lead_id);
    if (index === -1) {
      throw new Error(`Contact with id ${lead_id} not found`);
    }

    const prev = db.contacts[index];
    const updated: Contact = {
      ...prev,
      approval_status: status,
      reviewer_notes: reviewer_notes !== undefined ? reviewer_notes : prev.reviewer_notes,
      rejection_reason: rejection_reason !== undefined ? rejection_reason : prev.rejection_reason,
      reviewed_at: new Date().toISOString()
    };

    db.contacts[index] = updated;

    // Log history
    const historyItem: ApprovalHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id,
      previous_status: prev.approval_status,
      new_status: status,
      reviewer_notes,
      rejection_reason,
      changed_at: new Date().toISOString(),
      changed_by: 'gtm_reviewer'
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
  static getDrafts(lead_id?: string): EmailDraftRecord[] {
    const db = ensureDbFile();
    let drafts = db.emailDrafts || [];
    if (lead_id) {
      drafts = drafts.filter(d => d.lead_id === lead_id);
    }
    return [...drafts].sort((a, b) => a.sequence_step - b.sequence_step);
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
    return (db.workflowExecutions || [])[0];
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
      workflowLogs: []
    };
    saveDb(freshDb);
  }
}
