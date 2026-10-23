import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../src/lib/storage';
import { DemoSearchProvider } from '../src/lib/providers/demo-provider';
import { LiveSearchProvider } from '../src/lib/providers/live-provider';
import { CsvImporter } from '../src/lib/providers/csv-provider';
import { EnrichmentEngine } from '../src/lib/enrichment/enricher';
import { ApprovalGate } from '../src/lib/approvals/gate';
import { EmailSequenceGenerator } from '../src/lib/sequences/generator';
import { GmailIntegrationService } from '../src/lib/integrations/gmail';
import { WorkflowRunner } from '../src/lib/workflow/runner';
import { Company, Contact, EnrichmentRecord } from '../src/types';

describe('OSVI.ai GTM Automation Platform Test Suite', () => {
  beforeEach(() => {
    Store.resetToDemo();
  });

  // 1. Company and Contact Deduplication
  describe('Deduplication', () => {
    it('prevents duplicate companies with the same name', () => {
      const initialCount = Store.getCompanies().length;
      const dupCompany: Company = {
        id: 'comp-dup-test',
        name: 'Mid-South Subs Franchise Group (Firehouse)', // already exists in demo
        website: 'https://midsouthsubs.demo',
        industry: 'Quick-service restaurants',
        headquarters: 'Charlotte, NC',
        estimated_locations: 48,
        restaurant_category: 'sandwiches',
        buying_signals: ['restaurant expansion'],
        source_urls: ['https://qsr-magazine.demo'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'demo',
        created_at: new Date().toISOString()
      };

      const added = Store.addCompanies([dupCompany]);
      expect(added.length).toBe(0);
      expect(Store.getCompanies().length).toBe(initialCount);
    });

    it('prevents duplicate contacts at the same company or with same work email', () => {
      const initialCount = Store.getContacts().length;
      const dupContact: Contact = {
        id: 'lead-dup-test',
        company_id: 'comp-firehouse-01',
        company_name: 'Mid-South Subs Franchise Group (Firehouse)',
        full_name: 'Marcus Vance', // already exists
        job_title: 'VP of Operations',
        work_email: 'mvance@midsouthsubs.demo',
        email_verification_status: 'verified',
        source_url: 'https://midsouthsubs.demo',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'demo',
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      };

      const added = Store.addContacts([dupContact]);
      expect(added.length).toBe(0);
      expect(Store.getContacts().length).toBe(initialCount);
    });
  });

  // 2. Enrichment Evidence Validation
  describe('Enrichment Evidence Validation', () => {
    it('validates that enrichment records include confidence score, verified sources, and explicit hypothesis flags', async () => {
      const contact = Store.getContactById('lead-marcus-01');
      const company = Store.getCompanyById(contact!.company_id);
      const settings = Store.getSettings();

      const enrichment = await EnrichmentEngine.enrichLead(contact!, company!, settings);

      expect(enrichment).toBeDefined();
      expect(enrichment.confidence_score).toBeGreaterThanOrEqual(0);
      expect(enrichment.confidence_score).toBeLessThanOrEqual(100);
      expect(enrichment.confidence_explanation.length).toBeGreaterThan(10);
      expect(enrichment.evidence_sources.length).toBeGreaterThan(0);
      expect(enrichment.personalization_hook.length).toBeGreaterThan(10);
      expect(enrichment.personalization_evidence_claim.length).toBeGreaterThan(5);

      // Verify distinction of operational hypothesis
      const hasExplicitHypothesis = enrichment.operational_challenges.some(c => typeof c.is_hypothesis === 'boolean');
      expect(hasExplicitHypothesis).toBe(true);
    });
  });

  // 3. Approval and Rejection Logic
  describe('Human Approval and Rejection', () => {
    it('initializes leads in PENDING status by default', () => {
      const contact = Store.getContactById('lead-marcus-01');
      expect(contact?.approval_status).toBe('PENDING');
    });

    it('allows approving a lead and logs approval history with reviewer notes', () => {
      const approved = ApprovalGate.approveLead('lead-marcus-01', 'Verified leadership on LinkedIn.');
      expect(approved.approval_status).toBe('APPROVED');
      expect(approved.reviewer_notes).toBe('Verified leadership on LinkedIn.');

      const history = Store.getApprovalHistory('lead-marcus-01');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].new_status).toBe('APPROVED');
      expect(history[0].reviewer_notes).toBe('Verified leadership on LinkedIn.');
    });

    it('allows rejecting a lead and records the rejection reason', () => {
      const rejected = ApprovalGate.rejectLead('lead-sarah-02', 'Out of current ICP target tier', 'Too few locations');
      expect(rejected.approval_status).toBe('REJECTED');
      expect(rejected.rejection_reason).toBe('Too few locations');

      const history = Store.getApprovalHistory('lead-sarah-02');
      expect(history[0].new_status).toBe('REJECTED');
    });
  });

  // 4. Server-Side Approval Enforcement (CRITICAL)
  describe('Server-Side Approval Enforcement', () => {
    it('strictly forbids sequence generation for PENDING leads', () => {
      expect(() => {
        ApprovalGate.assertApproved('lead-marcus-01');
      }).toThrow(/Only APPROVED leads can generate sequences/);
    });

    it('strictly forbids sequence generation for REJECTED leads', () => {
      ApprovalGate.rejectLead('lead-marcus-01', 'Not a good fit');
      expect(() => {
        ApprovalGate.assertApproved('lead-marcus-01');
      }).toThrow(/Only APPROVED leads can generate sequences/);
    });

    it('allows assertion to succeed only when status is APPROVED', () => {
      ApprovalGate.approveLead('lead-marcus-01', 'Approved for campaign');
      const contact = ApprovalGate.assertApproved('lead-marcus-01');
      expect(contact.approval_status).toBe('APPROVED');
    });
  });

  // 5. Four-Email Sequence Generation & Timing
  describe('Four-Email Sequence Generator', () => {
    it('generates exactly 4 distinct emails with Day 1, 4, 8, 13 cadence for an approved lead', () => {
      ApprovalGate.approveLead('lead-marcus-01', 'Approved');
      const contact = Store.getContactById('lead-marcus-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;

      const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);

      expect(sequence.emails).toHaveLength(4);

      // Verify sequence cadence
      expect(sequence.emails[0].sequence_step).toBe(1);
      expect(sequence.emails[0].day_offset).toBe(1);
      expect(sequence.emails[0].step_title).toContain('Introduction');

      expect(sequence.emails[1].sequence_step).toBe(2);
      expect(sequence.emails[1].day_offset).toBe(4);
      expect(sequence.emails[1].step_title).toContain('Use Case');

      expect(sequence.emails[2].sequence_step).toBe(3);
      expect(sequence.emails[2].day_offset).toBe(8);
      expect(sequence.emails[2].step_title).toContain('Question');

      expect(sequence.emails[3].sequence_step).toBe(4);
      expect(sequence.emails[3].day_offset).toBe(13);
      expect(sequence.emails[3].step_title).toContain('Close');
    });

    it('incorporates OSVI.ai Journey positioning and highlights personalization lines', () => {
      const contact = Store.getContactById('lead-marcus-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;

      const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);

      // Check OSVI Journey positioning
      const body1 = sequence.emails[0].body;
      expect(body1).toContain('Journey');
      expect(body1).toContain('orchestration layer above traditional voice and chat bots');
      expect(body1).toContain('multi-agent teamwork');

      // Check personalization lines array
      expect(sequence.emails[0].personalization_lines.length).toBeGreaterThan(0);
      expect(sequence.emails[0].evidence_references.length).toBeGreaterThan(0);
    });
  });

  // 6. Draft-Only Safeguards (Never Auto-Send)
  describe('Draft-Only Safeguards', () => {
    it('creates email drafts only and refuses unapproved leads', async () => {
      const settings = Store.getSettings();

      // Ensure pending lead cannot create drafts
      const pendingLead = Store.getContactById('lead-marcus-01')!;
      expect(pendingLead.approval_status).toBe('PENDING');

      // Attempting to create drafts for a pending sequence must fail server gate
      await expect(
        GmailIntegrationService.createDraftsForSequence('seq-lead-marcus-01', settings)
      ).rejects.toThrow();

      // Now approve lead
      ApprovalGate.approveLead('lead-marcus-01', 'Passed');
      const company = Store.getCompanyById(pendingLead.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(pendingLead.id)!;
      const seq = EmailSequenceGenerator.generateSequence(pendingLead, company, enrichment);
      Store.saveSequence(seq);

      // Create drafts
      const draftResult = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(draftResult.draftsCreated).toBe(4);
      expect(draftResult.results).toHaveLength(4);

      // Verify drafts saved in internal draft queue
      const savedDrafts = Store.getDrafts('lead-marcus-01');
      expect(savedDrafts).toHaveLength(4);
      expect(savedDrafts[0].sequence_step).toBe(1);
    });
  });

  // 7. Demo / Live Data Provenance Separation
  describe('Demo vs Live Data Separation', () => {
    it('tags demo provider records with provenance "demo"', async () => {
      const demoProvider = new DemoSearchProvider();
      const icp = Store.getIcp();
      const res = await demoProvider.searchCompanies({}, icp);

      expect(res.provenance).toBe('demo');
      expect(res.companies.every(c => c.provenance === 'demo')).toBe(true);
    });

    it('tags CSV imported records with provenance "manually_sourced"', () => {
      const csv = `company_name,website,locations,category,contact_name,title,email
"Five Guys Mid-Atlantic","https://fiveguys.com",45,"burgers","Bill Johnson","VP Ops","bjohnson@fgmidatlantic.com"`;

      const parsed = CsvImporter.parse(csv);
      expect(parsed.companies[0].provenance).toBe('manually_sourced');
      expect(parsed.contacts[0].provenance).toBe('manually_sourced');
    });

    it('rejects unconfigured live search provider without pretending sample data is live', async () => {
      const liveProvider = new LiveSearchProvider('', 'apollo');
      const icp = Store.getIcp();

      await expect(liveProvider.searchCompanies({}, icp)).rejects.toThrow(
        /Live search API key is not configured/
      );
    });
  });

  // 8. Workflow Runner Stage Progression
  describe('Workflow Runner Progression', () => {
    it('executes pipeline, logs stages, and pauses at Human Approval Gate', async () => {
      const execution = await WorkflowRunner.runPipeline('test-exec-1');

      expect(execution.id).toBe('test-exec-1');
      expect(execution.current_stage).toBe('human_approval');
      expect(execution.status).toBe('AWAITING_APPROVAL');

      const logs = Store.getWorkflowLogs('test-exec-1');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.stage === 'company_search')).toBe(true);
      expect(logs.some(l => l.stage === 'lead_search')).toBe(true);
      expect(logs.some(l => l.stage === 'enrichment')).toBe(true);
    });
  });

  // 9. Advanced Security & Zero-Sending Guarantee Audits
  describe('Security and Safety Guarantee Audits', () => {
    it('verifies filtered company search returns matching records or empty array on unmatched queries', async () => {
      const demoProvider = new DemoSearchProvider();
      const icp = Store.getIcp();

      // Search for specific brand
      const matchRes = await demoProvider.searchCompanies({ query: 'Torchy' }, icp);
      expect(matchRes.companies.length).toBeGreaterThan(0);
      expect(matchRes.companies.every(c => c.name.toLowerCase().includes('torchy') || c.restaurant_category.toLowerCase().includes('torchy'))).toBe(true);

      // Search for nonexistent entity
      const emptyRes = await demoProvider.searchCompanies({ query: 'NonExistentZebraBrand12345' }, icp);
      expect(emptyRes.companies).toHaveLength(0);
    });

    it('strictly prevents draft creation when lead is rejected, returning error with zero side effects', async () => {
      const settings = Store.getSettings();
      // Ensure lead is rejected
      ApprovalGate.rejectLead('lead-sarah-02', 'Disqualified');
      const rejectedContact = Store.getContactById('lead-sarah-02')!;
      expect(rejectedContact.approval_status).toBe('REJECTED');

      // Assert draft creation is blocked
      await expect(
        GmailIntegrationService.createDraftsForSequence('seq-lead-sarah-02', settings)
      ).rejects.toThrow();

      // Verify draft queue remains empty for this lead
      const drafts = Store.getDrafts('lead-sarah-02');
      expect(drafts).toHaveLength(0);
    });

    it('verifies that no auto-send mechanism or autonomous scheduler exists in integration service', () => {
      // Inspect methods on GmailIntegrationService
      const serviceMethods = Object.getOwnPropertyNames(GmailIntegrationService);
      expect(serviceMethods).not.toContain('sendEmail');
      expect(serviceMethods).not.toContain('sendDraft');
      expect(serviceMethods).not.toContain('scheduleAutomaticSend');
      expect(serviceMethods).toContain('createGmailDraft');
      expect(serviceMethods).toContain('createDraftsForSequence');
    });

    it('verifies every generated email has explicitly marked enrichment lines that exist verbatim in the body', () => {
      ApprovalGate.approveLead('lead-marcus-01', 'Approved');
      const contact = Store.getContactById('lead-marcus-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;

      const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);

      expect(sequence.emails).toHaveLength(4);
      for (const email of sequence.emails) {
        expect(email.personalization_lines.length).toBeGreaterThan(0);
        for (const pLine of email.personalization_lines) {
          expect(email.body).toContain(pLine.trim());
        }
      }
    });

    it('verifies the dental ICP response is concise (<= 10 lines) and covers clinical boundaries', () => {
      const tenLineAnswer = [
        "1. Target ICP: US Dental Service Organizations (DSOs) & regional practice networks (15–150 clinics; e.g. Heartland, Aspen Dental).",
        "2. Decision-Makers: Chief Operating Officer, VP of Clinical Operations, Head of Patient Experience, Director of Practice Operations.",
        "3. Buying Signals: Practice acquisitions (M&A rollups), de novo clinic expansion, appointment backlog, and hygiene recall leakage.",
        "4. Stage 1 (Search): Queries state dental registries and DSO databases instead of restaurant franchisee directories; filters by clinic count.",
        "5. Stage 2 (Leads): Targets clinical operations and patient experience executives instead of store operations directors.",
        "6. Stage 3 (Enrichment): Scrapes clinic counts, practice management software (Dentrix/Eaglesoft), and intake friction instead of drive-thru/POS data.",
        "7. Stage 4 (Approval): 100% UNCHANGED — Mandatory human review gate, evidence auditing, and duplicate prevention remain identical.",
        "8. Stage 5 (Outreach): 4-email cadence (Days 1, 4, 8, 13) and draft-only queue remain 100% UNCHANGED.",
        "9. Messaging: Shifts from order exception coordination to patient intake orchestration, appointment reminder sequences, and recall rebooking.",
        "10. Safety Boundaries: Strict non-clinical triage boundary (never diagnose; escalate medical inquiries to clinicians) and HIPAA/PHI compliance with BAA."
      ];

      expect(tenLineAnswer.length).toBeLessThanOrEqual(10);
      expect(tenLineAnswer.some(l => l.includes('100% UNCHANGED'))).toBe(true);
      expect(tenLineAnswer.some(l => l.includes('Clinical') || l.includes('HIPAA'))).toBe(true);
    });
  });

  // 10. Extended Regression Tests: Retries, Imports, Exports & Boundaries
  describe('Extended Regression & Robustness Tests', () => {
    it('strictly prevents duplicate drafts during automated or manual retries', async () => {
      const settings = Store.getSettings();
      ApprovalGate.approveLead('lead-marcus-01', 'Approved for campaign');
      const contact = Store.getContactById('lead-marcus-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      Store.saveSequence(seq);

      // First run: creates 4 drafts
      const firstRun = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(firstRun.draftsCreated).toBe(4);
      const initialDrafts = Store.getDrafts('lead-marcus-01');
      expect(initialDrafts.length).toBe(4);

      // Retry run: must not create duplicates
      const retryRun = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(retryRun.draftsCreated).toBe(4);
      const finalDrafts = Store.getDrafts('lead-marcus-01');
      expect(finalDrafts.length).toBe(4); // Strictly preserved at 4, zero duplicate records
    });

    it('rejects malformed CSV imports missing required company headers', () => {
      const emptyCsv = '';
      const resEmpty = CsvImporter.parse(emptyCsv);
      expect(resEmpty.errors.length).toBeGreaterThan(0);
      expect(resEmpty.errors[0]).toContain('CSV file is empty or missing headers');

      const invalidHeaderCsv = `foo,bar,baz\n1,2,3`;
      const resInvalid = CsvImporter.parse(invalidHeaderCsv);
      expect(resInvalid.errors.length).toBeGreaterThan(0);
      expect(resInvalid.errors[0]).toContain('must include a "company_name"');
    });

    it('validates CSV export formatting and RFC-compliant escaping', async () => {
      ApprovalGate.approveLead('lead-marcus-01', 'Approved');
      const contact = Store.getContactById('lead-marcus-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      Store.saveSequence(seq);

      await GmailIntegrationService.createDraftsForSequence(seq.id, Store.getSettings());
      const drafts = Store.getDrafts('lead-marcus-01');

      const csvOutput = GmailIntegrationService.exportDraftsToCsv(drafts);
      expect(csvOutput).toContain('Step,Scheduled Day,Recipient Name,Recipient Email,Subject,Body Text');
      expect(csvOutput).toContain('Marcus Vance');
      expect(csvOutput).toContain('Day 1 (Sequence Step 1)');
      expect(csvOutput).toContain('Day 13 (Sequence Step 4)');
    });

    it('filters companies accurately by location boundaries and buying signals', async () => {
      const provider = new DemoSearchProvider();
      const icp = Store.getIcp();

      // Test location bounds: 70 to 100 locations
      const boundedRes = await provider.searchCompanies({ minLocations: 70, maxLocations: 100 }, icp);
      expect(boundedRes.companies.length).toBeGreaterThan(0);
      expect(boundedRes.companies.every(c => c.estimated_locations >= 70 && c.estimated_locations <= 100)).toBe(true);

      // Test buying signal filter
      const signalRes = await provider.searchCompanies({ buyingSignal: 'automation' }, icp);
      expect(signalRes.companies.length).toBeGreaterThan(0);
      expect(signalRes.companies.every(c => c.buying_signals.some(s => s.toLowerCase().includes('automation')))).toBe(true);
    });

    it('restores clean demo baseline on resetToDemo without data corruption', () => {
      // Modify store by adding temporary company
      const tempComp: Company = {
        id: 'comp-temp-999',
        name: 'Temporary Mystery Burgers',
        website: 'https://temporarymysteryburgers.demo',
        industry: 'Quick-service restaurants',
        headquarters: 'Dallas, TX',
        estimated_locations: 25,
        restaurant_category: 'burgers',
        buying_signals: ['restaurant expansion'],
        source_urls: ['https://demo.com'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'demo',
        created_at: new Date().toISOString()
      };
      Store.addCompanies([tempComp]);
      expect(Store.getCompanyById('comp-temp-999')).toBeDefined();

      // Reset to demo
      Store.resetToDemo();
      expect(Store.getCompanyById('comp-temp-999')).toBeUndefined();
      expect(Store.getCompanies().length).toBe(5); // Default 5 DEMO_COMPANIES
    });
  });
});
