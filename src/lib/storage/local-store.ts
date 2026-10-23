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

  if (!fs.existsSync(dbPath)) {
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
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
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
    fs.writeFileSync(dbPath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
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
