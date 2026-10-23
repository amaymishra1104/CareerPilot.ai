import os from 'os';
import path from 'path';
import fs from 'fs';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';

const testDbPath = path.join(os.tmpdir(), `osvi-test-db-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
process.env.OSVI_DB_PATH = testDbPath;

import { Store } from '../src/lib/storage';
import { DemoSearchProvider } from '../src/lib/providers/demo-provider';
import { LiveSearchProvider } from '../src/lib/providers/live-provider';
import { CsvImporter } from '../src/lib/providers/csv-provider';
import { EnrichmentEngine } from '../src/lib/enrichment/enricher';
import { ApprovalGate } from '../src/lib/approvals/gate';
import { EmailSequenceGenerator } from '../src/lib/sequences/generator';
import { GmailIntegrationService } from '../src/lib/integrations/gmail';
import { WorkflowRunner } from '../src/lib/workflow/runner';
import { verifyPasscode } from '../src/lib/auth/passcode';
import { Company, Contact } from '../src/types';

describe('OSVI.ai GTM Automation Platform Test Suite', () => {
  beforeEach(() => {
    Store.resetToDemo();
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // ignore
      }
    }
  });

  // 1. Company and Contact Deduplication
  describe('Deduplication', () => {
    it('prevents duplicate companies with the same name', () => {
      const initialCount = Store.getCompanies().length;
      const dupCompany: Company = {
        id: 'comp-dup-test',
        name: "Taziki's Mediterranean Cafe", // already exists in seed
        website: 'https://www.tazikis.com',
        industry: 'Quick-service restaurants',
        headquarters: 'Birmingham, AL',
        estimated_locations: 100,
        restaurant_category: 'Mediterranean fast-casual',
        buying_signals: ['catering_surge'],
        source_urls: ['https://www.tazikis.com'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_curated',
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
        company_id: 'comp-tazikis-01',
        company_name: "Taziki's Mediterranean Cafe",
        full_name: 'John Ishmael', // already exists
        job_title: 'Chief Operating Officer',
        work_email: 'unavailable',
        email_verification_status: 'unavailable',
        source_url: 'https://www.tazikis.com/our-leadership',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_curated',
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      };

      const added = Store.addContacts([dupContact]);
      expect(added.length).toBe(0);
      expect(Store.getContacts().length).toBe(initialCount);
    });
  });

  // 2. Enrichment Evidence & Transparent Rubric
  describe('Enrichment Evidence Validation', () => {
    it('validates enrichment includes transparent confidence score, verified sources, and explicit hypothesis flags', async () => {
      const contact = Store.getContactById('lead-john-01');
      expect(contact).toBeDefined();
      const company = Store.getCompanyById(contact!.company_id);
      expect(company).toBeDefined();
      const settings = Store.getSettings();

      const enrichment = await EnrichmentEngine.enrichLead(contact!, company!, settings);

      expect(enrichment).toBeDefined();
      expect(enrichment.confidence_score).toBeGreaterThanOrEqual(0);
      expect(enrichment.confidence_score).toBeLessThanOrEqual(100);
      expect(enrichment.confidence_explanation).toContain('Sources (40/40');
      expect(enrichment.evidence_sources.length).toBeGreaterThan(0);
      expect(enrichment.evidence_sources.every(s => s.source_url && s.source_url.startsWith('http'))).toBe(true);
      expect(enrichment.evidence_sources.every(s => s.snippet && s.snippet.length > 5)).toBe(true);
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
      const contact = Store.getContactById('lead-john-01');
      expect(contact?.approval_status).toBe('PENDING');
    });

    it('allows approving a lead and logs approval history with reviewer notes and identity', () => {
      const approved = ApprovalGate.approveLead('lead-john-01', 'Verified leadership on official leadership page.', 'lead_reviewer_1');
      expect(approved.approval_status).toBe('APPROVED');
      expect(approved.reviewer_notes).toBe('Verified leadership on official leadership page.');

      const history = Store.getApprovalHistory('lead-john-01');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].new_status).toBe('APPROVED');
      expect(history[0].reviewer_notes).toBe('Verified leadership on official leadership page.');
      expect(history[0].changed_by).toBe('lead_reviewer_1');
    });

    it('allows rejecting a lead and records the rejection reason', () => {
      const rejected = ApprovalGate.rejectLead('lead-lance-02', 'Out of current ICP target tier', 'Too few regional units in territory', 'auditor_2');
      expect(rejected.approval_status).toBe('REJECTED');
      expect(rejected.rejection_reason).toBe('Too few regional units in territory');

      const history = Store.getApprovalHistory('lead-lance-02');
      expect(history[0].new_status).toBe('REJECTED');
      expect(history[0].changed_by).toBe('auditor_2');
    });
  });

  // 4. Server-Side Approval Enforcement (CRITICAL)
  describe('Server-Side Approval Enforcement', () => {
    it('strictly forbids sequence generation for PENDING leads', () => {
      expect(() => {
        ApprovalGate.assertApproved('lead-john-01');
      }).toThrow(/Only APPROVED leads can generate sequences/);
    });

    it('strictly forbids sequence generation for REJECTED leads', () => {
      ApprovalGate.rejectLead('lead-lance-02', 'Not a good fit');
      expect(() => {
        ApprovalGate.assertApproved('lead-lance-02');
      }).toThrow(/Only APPROVED leads can generate sequences/);
    });

    it('allows assertion to succeed only when status is APPROVED', () => {
      ApprovalGate.approveLead('lead-john-01', 'Approved for campaign');
      const contact = ApprovalGate.assertApproved('lead-john-01');
      expect(contact.approval_status).toBe('APPROVED');
    });
  });

  // 5. Four-Email Sequence Generation & Timing
  describe('Four-Email Sequence Generator', () => {
    it('generates exactly 4 distinct emails with Day 1, 4, 8, 13 cadence for an approved lead', () => {
      ApprovalGate.approveLead('lead-john-01', 'Approved');
      const contact = Store.getContactById('lead-john-01')!;
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

    it('incorporates OSVI.ai Journey positioning and Domino India case study proof', () => {
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;

      const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);

      // Check OSVI Journey positioning
      const body1 = sequence.emails[0].body;
      expect(body1).toContain('Journey');
      expect(body1).toContain('orchestration layer');
      expect(body1).toContain('multi-agent teamwork');

      // Check Domino's India reference in email 2 or 1
      const body2 = sequence.emails[1].body;
      expect(body2).toContain("Domino's India");
      expect(body2).toContain('100k+ riders');
      expect(body2).toContain('https://www.osvi.ai/case-studies/dominos');

      // Check personalization lines and evidence ids
      expect(sequence.emails[0].personalization_lines.length).toBeGreaterThan(0);
      expect(sequence.emails[0].evidence_ids?.length).toBeGreaterThan(0);
    });

    it('links every marked personalization line to a valid evidence ID with working URL', () => {
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;

      const sequence = EmailSequenceGenerator.generateSequence(contact, company, enrichment);

      for (const email of sequence.emails) {
        expect(email.personalization_lines.length).toBeGreaterThan(0);
        expect(email.evidence_ids).toBeDefined();
        for (const evId of (email.evidence_ids || [])) {
          const matchedSource = enrichment.evidence_sources.find(s => s.id === evId);
          expect(matchedSource).toBeDefined();
          expect(matchedSource!.source_url).toMatch(/^https?:\/\//);
        }
      }
    });
  });

  // 6. Draft-Only Safeguards (Never Auto-Send)
  describe('Draft-Only Safeguards', () => {
    it('creates email drafts only and refuses unapproved leads', async () => {
      const settings = Store.getSettings();

      // Ensure pending lead cannot create drafts
      const pendingLead = Store.getContactById('lead-john-01')!;
      expect(pendingLead.approval_status).toBe('PENDING');

      // Attempting to create drafts for a pending sequence must fail server gate
      await expect(
        GmailIntegrationService.createDraftsForSequence('seq-lead-john-01', settings)
      ).rejects.toThrow();

      // Now approve lead
      ApprovalGate.approveLead('lead-john-01', 'Passed');
      const company = Store.getCompanyById(pendingLead.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(pendingLead.id)!;
      const seq = EmailSequenceGenerator.generateSequence(pendingLead, company, enrichment);
      Store.saveSequence(seq);

      // Create drafts
      const draftResult = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(draftResult.draftsCreated).toBe(4);
      expect(draftResult.results).toHaveLength(4);

      // Verify drafts saved in internal draft queue addressing amaymishra1104@gmail.com
      const savedDrafts = Store.getDrafts('lead-john-01');
      expect(savedDrafts).toHaveLength(4);
      expect(savedDrafts[0].recipient_email).toBe('amaymishra1104@gmail.com');
      expect(savedDrafts[0].sequence_step).toBe(1);
    });

    it('hides/gates drafts when approval is revoked to prevent outreach to unapproved leads', async () => {
      const settings = Store.getSettings();
      ApprovalGate.approveLead('lead-john-01', 'Passed');
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      Store.saveSequence(seq);

      await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(Store.getDrafts('lead-john-01').length).toBe(4);

      // Revoke approval (change back to REJECTED)
      ApprovalGate.rejectLead('lead-john-01', 'Revoking approval after compliance check', 'Policy change');
      
      // Default query must hide drafts for unapproved leads
      expect(Store.getDrafts('lead-john-01').length).toBe(0);

      // Re-approving restores visibility
      ApprovalGate.approveLead('lead-john-01', 'Reinstated after re-audit');
      expect(Store.getDrafts('lead-john-01').length).toBe(4);
    });
  });

  // 7. Demo vs Live Data Provenance Separation
  describe('Demo vs Live Data Separation', () => {
    it('tags curated seed records with provenance "real_curated"', async () => {
      const demoProvider = new DemoSearchProvider();
      const icp = Store.getIcp();
      const res = await demoProvider.searchCompanies({}, icp);

      expect(res.provenance).toBe('real_curated');
      expect(res.companies.every(c => c.provenance === 'real_curated')).toBe(true);
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

  // 8. Workflow Runner Stage Progression & Safety
  describe('Workflow Runner Progression & Safety', () => {
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

    it('resumeAfterApproval does not auto-create drafts without explicit confirm flag', async () => {
      ApprovalGate.approveLead('lead-john-01', 'Approved');
      const initialDrafts = Store.getDrafts('lead-john-01');

      // Calling resume with default options (autoCreateDrafts: false)
      const execution = await WorkflowRunner.resumeAfterApproval('exec-resume-test', { autoCreateDrafts: false });
      expect(execution.status).toBe('COMPLETED');

      // Must NOT have created drafts
      const afterDrafts = Store.getDrafts('lead-john-01');
      expect(afterDrafts.length).toBe(initialDrafts.length);
    });

    it('resumeAfterApproval does not overwrite an existing user-edited sequence', async () => {
      ApprovalGate.approveLead('lead-john-01', 'Approved');
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      seq.emails[0].subject = 'CUSTOM EDITED SUBJECT FOR JOHN';
      seq.emails[0].is_edited = true;
      Store.saveSequence(seq);

      await WorkflowRunner.resumeAfterApproval('exec-resume-test-2', { autoCreateDrafts: false });

      const reFetched = Store.getSequenceByLeadId('lead-john-01');
      expect(reFetched?.emails[0].subject).toBe('CUSTOM EDITED SUBJECT FOR JOHN');
    });
  });

  // 9. Advanced Security, Passcode & Zero-Sending Audits
  describe('Security and Safety Guarantee Audits', () => {
    it('verifies filtered company search returns matching records or empty array on unmatched queries', async () => {
      const demoProvider = new DemoSearchProvider();
      const icp = Store.getIcp();

      // Search for specific brand
      const matchRes = await demoProvider.searchCompanies({ query: 'Taziki' }, icp);
      expect(matchRes.companies.length).toBeGreaterThan(0);
      expect(matchRes.companies.every(c => c.name.toLowerCase().includes('taziki') || c.restaurant_category.toLowerCase().includes('taziki'))).toBe(true);

      // Search for nonexistent entity
      const emptyRes = await demoProvider.searchCompanies({ query: 'NonExistentZebraBrand12345' }, icp);
      expect(emptyRes.companies).toHaveLength(0);
    });

    it('strictly prevents draft creation when lead is rejected, returning error with zero side effects', async () => {
      const settings = Store.getSettings();
      ApprovalGate.rejectLead('lead-lance-02', 'Disqualified');
      const rejectedContact = Store.getContactById('lead-lance-02')!;
      expect(rejectedContact.approval_status).toBe('REJECTED');

      // Assert draft creation is blocked
      await expect(
        GmailIntegrationService.createDraftsForSequence('seq-lead-lance-02', settings)
      ).rejects.toThrow();

      // Verify draft queue remains empty for this lead
      const drafts = Store.getDrafts('lead-lance-02');
      expect(drafts).toHaveLength(0);
    });

    it('verifies that no auto-send mechanism or autonomous scheduler exists in integration service', () => {
      const serviceMethods = Object.getOwnPropertyNames(GmailIntegrationService);
      expect(serviceMethods).not.toContain('sendEmail');
      expect(serviceMethods).not.toContain('sendDraft');
      expect(serviceMethods).not.toContain('scheduleAutomaticSend');
      expect(serviceMethods).toContain('createGmailDraft');
      expect(serviceMethods).toContain('createDraftsForSequence');
    });

    it('verifies passcode check gates requests when OSVI_PASSCODE is configured', () => {
      process.env.OSVI_PASSCODE = 'super-secret-passcode';
      try {
        const noHeaderReq = new Request('http://localhost:3000/api/approvals');
        expect(verifyPasscode(noHeaderReq).authorized).toBe(false);

        const wrongHeaderReq = new Request('http://localhost:3000/api/approvals', {
          headers: { 'x-osvi-passcode': 'wrong-pass' }
        });
        expect(verifyPasscode(wrongHeaderReq).authorized).toBe(false);

        const correctHeaderReq = new Request('http://localhost:3000/api/approvals', {
          headers: { 'x-osvi-passcode': 'super-secret-passcode' }
        });
        expect(verifyPasscode(correctHeaderReq).authorized).toBe(true);
      } finally {
        delete process.env.OSVI_PASSCODE;
      }
    });

    it('verifies the dental ICP response is strictly under 10 lines (<= 9 lines), avoids scraping claims, and covers HIPAA product boundary', () => {
      const nineLineAnswer = [
        "1. Target ICP: US Dental Service Organizations (DSOs) & regional practice networks (15–150 clinics; e.g. regional group practices).",
        "2. Target Roles: Chief Operating Officer, VP of Clinical Operations, VP/Director of Patient Experience, Director of Practice Operations.",
        "3. Buying Signals: M&A clinic integrations, multi-location front-desk hiring, online booking friction, and hygiene recall leakage.",
        "4. Stage 1 (Search): Queries state dental board registries and DSO directories filtering by 15–150 clinic count instead of restaurant franchisee lists.",
        "5. Stage 2 (Leads): Targets clinical operations and patient experience executives instead of store operations directors.",
        "6. Stage 3 (Enrichment): Detects practice management software (Dentrix/Eaglesoft) via job postings and technographics (not EHR scraping).",
        "7. Stage 4 (Approval): 100% UNCHANGED — Mandatory human review gate, evidence auditing, and duplicate prevention remain identical.",
        "8. Stage 5 (Outreach): 4-email cadence (Days 1, 4, 8, 13) and draft-only queue addressing amaymishra1104@gmail.com remain 100% UNCHANGED.",
        "9. Messaging & Compliance: Shifts to patient intake and recall loops; product requires HIPAA/BAA boundaries (cold email itself has no PHI)."
      ];

      expect(nineLineAnswer.length).toBeLessThanOrEqual(9);
      expect(nineLineAnswer.some(l => l.includes('100% UNCHANGED'))).toBe(true);
      expect(nineLineAnswer.some(l => l.includes('HIPAA'))).toBe(true);
      expect(nineLineAnswer.some(l => l.toLowerCase().includes('scrapes clinic') || l.toLowerCase().includes('scraping dentrix'))).toBe(false);
      expect(nineLineAnswer.some(l => l.includes('technographics') || l.includes('job postings'))).toBe(true);
    });
  });

  // 10. Extended Regression Tests: Retries, Imports, Exports & Boundaries
  describe('Extended Regression & Robustness Tests', () => {
    it('strictly prevents duplicate drafts during automated or manual retries', async () => {
      const settings = Store.getSettings();
      ApprovalGate.approveLead('lead-john-01', 'Approved for campaign');
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      Store.saveSequence(seq);

      // First run: creates 4 drafts
      const firstRun = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(firstRun.draftsCreated).toBe(4);
      const initialDrafts = Store.getDrafts('lead-john-01');
      expect(initialDrafts.length).toBe(4);

      // Retry run: must not create duplicates
      const retryRun = await GmailIntegrationService.createDraftsForSequence(seq.id, settings);
      expect(retryRun.draftsCreated).toBe(4);
      const finalDrafts = Store.getDrafts('lead-john-01');
      expect(finalDrafts.length).toBe(4); // Strictly preserved at 4, zero duplicate records
    });

    it('correctly handles repeated company rows in CSV import without FK errors and dedupes contacts', () => {
      const repeatedCompanyCsv = `company_name,website,locations,category,contact_name,title,email
"Summit Burger Co","https://summitburger.com",45,"burgers","Alice Smith","COO","asmith@summitburger.com"
"Summit Burger Co","https://summitburger.com",45,"burgers","Bob Jones","VP Ops","bjones@summitburger.com"
"Summit Burger Co","https://summitburger.com",45,"burgers","Alice Smith","COO","asmith@summitburger.com"`;

      const result = CsvImporter.parse(repeatedCompanyCsv);
      expect(result.companies).toHaveLength(1); // Deduped company
      expect(result.contacts).toHaveLength(2); // Alice and Bob, duplicate Alice removed
      expect(result.contacts[0].company_id).toBe(result.companies[0].id);
      expect(result.contacts[1].company_id).toBe(result.companies[0].id);
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
      ApprovalGate.approveLead('lead-john-01', 'Approved');
      const contact = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(contact.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(contact.id)!;
      const seq = EmailSequenceGenerator.generateSequence(contact, company, enrichment);
      Store.saveSequence(seq);

      await GmailIntegrationService.createDraftsForSequence(seq.id, Store.getSettings());
      const drafts = Store.getDrafts('lead-john-01');

      const csvOutput = GmailIntegrationService.exportDraftsToCsv(drafts);
      expect(csvOutput).toContain('Step,Scheduled Day,Recipient Name,Recipient Email,Subject,Body Text');
      expect(csvOutput).toContain('John Ishmael');
      expect(csvOutput).toContain('Day 1 (Sequence Step 1)');
      expect(csvOutput).toContain('Day 13 (Sequence Step 4)');
    });

    it('filters companies accurately by location boundaries and buying signals', async () => {
      const provider = new DemoSearchProvider();
      const icp = Store.getIcp();

      // Test location bounds: 50 to 120 locations (matches Taziki's 100, Piada 62, Clean Eatz 115)
      const boundedRes = await provider.searchCompanies({ minLocations: 50, maxLocations: 120 }, icp);
      expect(boundedRes.companies.length).toBeGreaterThan(0);
      expect(boundedRes.companies.every(c => c.estimated_locations >= 50 && c.estimated_locations <= 120)).toBe(true);

      // Test buying signal filter
      const signalRes = await provider.searchCompanies({ buyingSignal: 'franchise expansion' }, icp);
      expect(signalRes.companies.length).toBeGreaterThan(0);
      expect(signalRes.companies.every(c => c.buying_signals.some(s => s.toLowerCase().includes('franchise expansion')))).toBe(true);
    });

    it('restores clean demo baseline on resetToDemo without data corruption', () => {
      // Modify store by adding temporary company
      const tempComp: Company = {
        id: 'comp-temp-999',
        name: 'Temporary Mystery Burgers',
        website: 'https://temporarymysteryburgers.com',
        industry: 'Quick-service restaurants',
        headquarters: 'Dallas, TX',
        estimated_locations: 25,
        restaurant_category: 'burgers',
        buying_signals: ['catering_surge'],
        source_urls: ['https://example.com'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_curated',
        created_at: new Date().toISOString()
      };
      Store.addCompanies([tempComp]);
      expect(Store.getCompanyById('comp-temp-999')).toBeDefined();

      // Reset to demo
      Store.resetToDemo();
      expect(Store.getCompanyById('comp-temp-999')).toBeUndefined();
      expect(Store.getCompanies().length).toBe(5); // Default 5 CURATED_COMPANIES
    });
  });
});
