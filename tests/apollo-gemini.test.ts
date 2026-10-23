import os from 'os';
import path from 'path';
import fs from 'fs';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const testDbPath = path.join(os.tmpdir(), `osvi-apollo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
process.env.OSVI_DB_PATH = testDbPath;

import { Store } from '../src/lib/storage';
import { 
  ApolloSearchProvider, 
  ApolloMissingApiKeyError, 
  ApolloAuthenticationError, 
  ApolloRateLimitError, 
  ApolloCreditExhaustedError,
  ApolloPlanRestrictedError
} from '../src/lib/providers/apollo-provider';
import { LiveSearchProvider } from '../src/lib/providers/live-provider';
import { PublicSourceDiscoveryProvider } from '../src/lib/providers/public-source-provider';
import { GeminiService } from '../src/lib/enrichment/gemini';
import { EnrichmentEngine } from '../src/lib/enrichment/enricher';
import { ApprovalGate } from '../src/lib/approvals/gate';
import { EmailSequenceGenerator } from '../src/lib/sequences/generator';
import { GmailIntegrationService, UnsafeEmailRecipientError } from '../src/lib/integrations/gmail';
import { WorkflowRunner } from '../src/lib/workflow/runner';
import { ICPConfig, Company, Contact, EnrichmentRecord } from '../src/types';

describe('Apollo.io & Google Gemini GTM Integration Test Suite', () => {
  const dummyIcp: ICPConfig = {
    id: 'icp-qsr',
    name: 'US QSR Sweetspot',
    geography: ['United States'],
    industries: ['Restaurants'],
    companySizeMinLocations: 20,
    companySizeMaxLocations: 200,
    restaurantCategories: ['Quick-Service & Fast-Casual'],
    targetRoles: ['Chief Operating Officer', 'VP of Operations', 'Director of Operations'],
    buyingSignals: ['Operational expansion'],
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    Store.resetToDemo();
    vi.restoreAllMocks();
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

  // 1. Apollo Configuration & Error Handling
  describe('Apollo.io Credentials & Authentication Guardrails', () => {
    it('throws ApolloMissingApiKeyError when API key is missing', async () => {
      const provider = new ApolloSearchProvider('');
      await expect(provider.searchCompanies({}, dummyIcp)).rejects.toThrow(ApolloMissingApiKeyError);
    });

    it('throws ApolloAuthenticationError when Apollo returns HTTP 401', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invalid API key' }), {
          status: 401,
          statusText: 'Unauthorized'
        })
      );

      const provider = new ApolloSearchProvider('invalid-key-xyz');
      await expect(provider.searchCompanies({}, dummyIcp)).rejects.toThrow(ApolloAuthenticationError);
    });

    it('throws ApolloRateLimitError when Apollo returns HTTP 429', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
          status: 429,
          statusText: 'Too Many Requests'
        })
      );

      const provider = new ApolloSearchProvider('test-key');
      await expect(provider.searchCompanies({}, dummyIcp)).rejects.toThrow(ApolloRateLimitError);
    });

    it('throws ApolloCreditExhaustedError when Apollo returns HTTP 402/403', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Credit balance exhausted' }), {
          status: 402,
          statusText: 'Payment Required'
        })
      );

      const provider = new ApolloSearchProvider('test-key');
      await expect(provider.searchCompanies({}, dummyIcp)).rejects.toThrow(ApolloCreditExhaustedError);
    });
  });

  // 2. Real Company Discovery via Apollo
  describe('Real Company Search (Apollo.io)', () => {
    it('parses real organizations and explicitly differentiates employee count from location count', async () => {
      const mockApolloResponse = {
        organizations: [
          {
            id: 'org_sweetgreen_123',
            name: 'Sweetgreen, Inc.',
            website_url: 'https://www.sweetgreen.com',
            primary_domain: 'sweetgreen.com',
            industry: 'Restaurants',
            city: 'Los Angeles',
            state: 'CA',
            country: 'United States',
            estimated_num_employees: 4500,
            short_description: 'Fast-casual restaurant chain serving seasonal salads and warm bowls.',
            linkedin_url: 'https://www.linkedin.com/company/sweetgreen'
          }
        ],
        pagination: { total_entries: 1 }
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockApolloResponse), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { companies, provenance } = await provider.searchCompanies({ query: 'Sweetgreen' }, dummyIcp);

      expect(companies.length).toBe(1);
      const company = companies[0];
      expect(company.name).toBe('Sweetgreen, Inc.');
      expect(company.website).toBe('https://sweetgreen.com');
      expect(company.employee_count).toBe(4500);
      // Location count must NEVER be equated to employee count
      expect(company.location_count_status).toBe('unknown');
      expect(company.estimated_locations).toBe(0);
      expect(company.provider_company_id).toBe('org_sweetgreen_123');
      expect(company.source_provider).toBe('apollo');
      expect(provenance).toBe('live');
    });

    it('handles zero results returned from Apollo without inventing fake data', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ organizations: [], pagination: { total_entries: 0 } }), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { companies } = await provider.searchCompanies({ query: 'NonExistentRestaurant12345' }, dummyIcp);

      expect(companies.length).toBe(0);
    });

    it('handles malformed Apollo company data gracefully without throwing unhandled exceptions', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ organizations: [{ id: 'org_partial' }] }), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { companies } = await provider.searchCompanies({}, dummyIcp);

      expect(companies.length).toBe(1);
      expect(companies[0].name).toBe('Unknown Restaurant Group');
      expect(companies[0].headquarters).toBe('United States');
    });
  });

  // 3. Real Decision-Maker Discovery via Apollo
  describe('Real Decision-Maker Search (Apollo.io)', () => {
    it('discovers decision-makers and validates company association', async () => {
      const mockPeopleResponse = {
        people: [
          {
            id: 'per_ross_99',
            name: 'Ross Jones',
            first_name: 'Ross',
            last_name: 'Jones',
            title: 'Chief Operating Officer',
            linkedin_url: 'https://www.linkedin.com/in/rossjones',
            organization_id: 'org_sweetgreen_123',
            organization: {
              id: 'org_sweetgreen_123',
              name: 'Sweetgreen, Inc.',
              primary_domain: 'sweetgreen.com'
            },
            email_status: 'verified',
            email: 'ross.jones@sweetgreen.com'
          }
        ],
        pagination: { total_entries: 1 }
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockPeopleResponse), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { contacts } = await provider.searchContacts('comp-apollo-org_sweetgreen_123', 'Sweetgreen, Inc.', ['Chief Operating Officer']);

      expect(contacts.length).toBe(1);
      const contact = contacts[0];
      expect(contact.full_name).toBe('Ross Jones');
      expect(contact.job_title).toBe('Chief Operating Officer');
      expect(contact.is_company_verified).toBe(true);
      expect(contact.provider_person_id).toBe('per_ross_99');
      expect(contact.email_verification_status).toBe('verified');
      expect(contact.work_email).toBe('ross.jones@sweetgreen.com');
      expect(contact.approval_status).toBe('PENDING'); // strictly pending by default
    });

    it('handles missing/masked email safely without inventing fake email', async () => {
      const mockPeopleResponse = {
        people: [
          {
            id: 'per_masked_1',
            name: 'Sarah Miller',
            title: 'VP of Operations',
            organization: { name: 'Sweetgreen' },
            email_status: 'unavailable',
            email: null
          }
        ]
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockPeopleResponse), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { contacts } = await provider.searchContacts('org_1', 'Sweetgreen', ['VP of Operations']);

      expect(contacts.length).toBe(1);
      expect(contacts[0].work_email).toBe('unavailable');
      expect(contacts[0].email_verification_status).toBe('unavailable');
    });

    it('handles zero people returned without fabricating contacts', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ people: [] }), { status: 200 })
      );

      const provider = new ApolloSearchProvider('test-key');
      const { contacts } = await provider.searchContacts('org_empty', 'Empty Restaurant', ['COO']);
      expect(contacts.length).toBe(0);
    });
  });

  // 4. Deduplication
  describe('Apollo Deduplication Protection', () => {
    it('prevents adding the same company multiple times', () => {
      const comp1: Company = {
        id: 'comp-apollo-1',
        name: 'Chipotle Mexican Grill',
        website: 'https://www.chipotle.com',
        industry: 'Restaurants',
        headquarters: 'Newport Beach, CA',
        estimated_locations: 3000,
        restaurant_category: 'Fast-Casual',
        buying_signals: ['Digital ordering'],
        source_urls: ['https://www.chipotle.com'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live',
        created_at: new Date().toISOString()
      };

      const comp2: Company = {
        ...comp1,
        id: 'comp-apollo-2' // different ID, same name
      };

      const added1 = Store.addCompanies([comp1]);
      const added2 = Store.addCompanies([comp2]);

      expect(added1.length).toBe(1);
      expect(added2.length).toBe(0);
    });
  });

  // 5. Google Gemini LLM Integration
  describe('Google Gemini LLM Integration', () => {
    it('synthesizes structured lead research and classifies hypotheses explicitly', async () => {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    company_overview: 'Sweetgreen is a fast-casual salad chain with multi-unit presence.',
                    location_count_evidence: 'Verified store count from official corporate disclosures.',
                    operational_challenges: [
                      {
                        description: 'Multi-store digital ordering surge during lunch windows.',
                        is_hypothesis: false,
                        evidence: 'Sourced from digital order mix disclosures.'
                      },
                      {
                        description: 'Disconnection between automated chat bots and store managers.',
                        is_hypothesis: true,
                        evidence: 'Standard conversational bot limitation.'
                      }
                    ],
                    verified_buying_signals: [
                      {
                        signal: 'Digital kitchen automation',
                        source_url: 'https://www.sweetgreen.com',
                        snippet: 'Investing in automated prep and robotic salad kitchens.'
                      }
                    ],
                    personalization_hook: 'Noticed Sweetgreen\'s deployment of digital kitchen automation and your role leading operations.',
                    personalization_evidence_claim: 'Sweetgreen operations leadership in digital customer channels.',
                    confidence_score: 90,
                    confidence_explanation: 'High confidence grounded in public annual report disclosures.'
                  })
                }
              ]
            }
          }
        ]
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockGeminiResponse), { status: 200 })
      );

      const gemini = new GeminiService('test-gemini-key', 'gemini-3.5-flash');
      const contact: Contact = {
        id: 'lead-test-gem',
        company_id: 'comp-test-gem',
        company_name: 'Sweetgreen',
        full_name: 'Chris Carr',
        job_title: 'Chief Operating Officer',
        work_email: 'unavailable',
        email_verification_status: 'unavailable',
        source_url: 'https://www.sweetgreen.com/leadership',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live',
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      };

      const company: Company = {
        id: 'comp-test-gem',
        name: 'Sweetgreen',
        website: 'https://www.sweetgreen.com',
        industry: 'Restaurants',
        headquarters: 'Los Angeles, CA',
        estimated_locations: 220,
        restaurant_category: 'Fast-Casual',
        buying_signals: ['Digital kitchen automation'],
        source_urls: ['https://www.sweetgreen.com'],
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live',
        created_at: new Date().toISOString()
      };

      const enrichment = await gemini.enrichLeadWithLLM(contact, company);

      expect(enrichment.confidence_score).toBe(90);
      expect(enrichment.personalization_hook).toContain('Sweetgreen');
      expect(enrichment.operational_challenges.length).toBe(2);
      expect(enrichment.operational_challenges.some(c => c.is_hypothesis === true)).toBe(true);
      expect(enrichment.operational_challenges.some(c => c.is_hypothesis === false)).toBe(true);
    });
  });

  // 6. Pipeline Approval Gate & Outreach Safeguards
  describe('Mandatory Server-Side Approval Gate & Outreach Safeguards', () => {
    it('strictly blocks unapproved leads from sequence and draft generation', () => {
      const contact = Store.getContactById('lead-john-01');
      expect(contact?.approval_status).toBe('PENDING');

      expect(() => {
        ApprovalGate.assertApproved('lead-john-01');
      }).toThrow(/Server Gate Violation.*PENDING/);
    });

    it('strictly blocks rejected leads from sequence and draft generation', () => {
      ApprovalGate.rejectLead('lead-john-01', 'Lead role not actively responsible for multi-store operations.', 'Out of ICP', 'reviewer_amy');
      const rejected = Store.getContactById('lead-john-01');
      expect(rejected?.approval_status).toBe('REJECTED');

      expect(() => {
        ApprovalGate.assertApproved('lead-john-01');
      }).toThrow(/Server Gate Violation.*REJECTED/);
    });

    it('allows approved leads to generate evidence-grounded sequences', () => {
      ApprovalGate.approveLead('lead-john-01', 'Verified leadership on official website.', 'reviewer_amy');
      const approved = Store.getContactById('lead-john-01');
      expect(approved?.approval_status).toBe('APPROVED');

      const company = Store.getCompanyById(approved!.company_id);
      const enrichment = Store.getEnrichmentByLeadId(approved!.id);
      expect(enrichment).toBeDefined();

      const sequence = EmailSequenceGenerator.generateSequence(approved!, company!, enrichment!);
      expect(sequence.emails.length).toBe(4);
      expect(sequence.emails[0].personalization_lines.length).toBeGreaterThan(0);
      expect(sequence.emails[0].evidence_references.length).toBeGreaterThan(0);
    });
  });

  // 7. Apollo Plan Limitation (HTTP 403) Handling
  describe('Apollo Plan Tier Discrimination (HTTP 403 Free vs Paid)', () => {
    it('throws ApolloPlanRestrictedError when Apollo returns HTTP 403 for Free plan search access', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: 'The api/v1/mixed_companies/search API is not included in your Free plan and is not accessible. All paid plans include full API access. Upgrade your plan from https://www.apollo.io/pricing' 
        }), {
          status: 403,
          statusText: 'Forbidden'
        })
      );

      const provider = new ApolloSearchProvider('free-key-xyz');
      await expect(provider.searchCompanies({}, dummyIcp)).rejects.toThrow(ApolloPlanRestrictedError);
    });
  });

  // 8. Real Public-Source Company & Decision-Maker Discovery
  describe('Real Public-Source Discovery Provider (Permitted Web Sources)', () => {
    it('discovers genuine US restaurant chains with valid source URLs and verified unit counts', async () => {
      const provider = new PublicSourceDiscoveryProvider();
      const res = await provider.searchCompanies({ query: "Taziki's" }, dummyIcp);
      expect(res.companies.length).toBeGreaterThan(0);
      const tazikis = res.companies[0];
      expect(tazikis.name).toContain("Taziki's");
      expect(tazikis.estimated_locations).toBe(100);
      expect(tazikis.source_urls.length).toBeGreaterThan(0);
      expect(tazikis.source_urls[0]).toMatch(/^https?:\/\//);
      expect(tazikis.provenance).toBe('real_public_web');
    });

    it('discovers real decision-makers with confirmed company association', async () => {
      const provider = new PublicSourceDiscoveryProvider();
      const res = await provider.searchContacts('pub-comp-tazikis-01', "Taziki's Mediterranean Cafe", ['Chief Operating Officer']);
      expect(res.contacts.length).toBeGreaterThan(0);
      const coo = res.contacts.find(c => c.job_title === 'Chief Operating Officer');
      expect(coo).toBeDefined();
      expect(coo?.full_name).toBe('John Ishmael');
      expect(coo?.is_company_verified).toBe(true);
      expect(coo?.source_url).toContain('nrn.com');
      expect(coo?.work_email).toBe('unavailable'); // Never fabricates emails
    });

    it('returns empty array when search query matches zero records (no hallucinations)', async () => {
      const provider = new PublicSourceDiscoveryProvider();
      const res = await provider.searchCompanies({ query: 'NonExistentRestaurantBrand999' }, dummyIcp);
      expect(res.companies.length).toBe(0);
      expect(res.provenance).toBe('real_public_web');
    });
  });

  // 9. Strict Email Safety & Recipient Guardrails
  describe('Strict Email Safety & Recipient Guardrails', () => {
    it('strictly forbids creating Gmail drafts addressed to real prospects', () => {
      expect(() => {
        GmailIntegrationService.assertSafeRecipient('john.ishmael@tazikis.com', 'amaymishra1104@gmail.com');
      }).toThrow(UnsafeEmailRecipientError);
    });

    it('allows Gmail draft creation ONLY when addressed to verified operator inbox', () => {
      expect(() => {
        GmailIntegrationService.assertSafeRecipient('amaymishra1104@gmail.com', 'amaymishra1104@gmail.com');
      }).not.toThrow();
    });

    it('verifies that no messages.send or drafts.send API calls exist in the entire codebase', () => {
      const srcDir = path.resolve(__dirname, '../src');
      const allFiles = fs.readdirSync(srcDir, { recursive: true }) as string[];
      for (const f of allFiles) {
        if (typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.tsx'))) {
          const fullPath = path.join(srcDir, f);
          const content = fs.readFileSync(fullPath, 'utf-8');
          expect(content).not.toContain('messages/send');
          expect(content).not.toContain('drafts/send');
        }
      }
    });
  });

  // 10. Genuine Google Gemini LLM Sequence Generation
  describe('Google Gemini LLM Sequence Generation', () => {
    it('executes generateSequenceWithLLM and produces evidence-grounded copy with citations', async () => {
      const approved = Store.getContactById('lead-john-01')!;
      const company = Store.getCompanyById(approved.company_id)!;
      const enrichment = Store.getEnrichmentByLeadId(approved.id)!;

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  emails: [
                    {
                      sequence_step: 1,
                      day_offset: 1,
                      step_title: 'Introduction & Tailored Operational Angle',
                      subject: "Multi-store execution across Taziki's 100 locations",
                      body: "Hi John,\n\nI noticed Taziki's operational growth across 100 units...",
                      personalization_lines: ["I noticed Taziki's operational growth across 100 units"],
                      evidence_references: ["100 locations across 16 states"]
                    },
                    {
                      sequence_step: 2,
                      day_offset: 4,
                      step_title: "Case Study Proof: Domino's India Multi-Agent Scale",
                      subject: "Case study: Multi-agent coordination for store managers",
                      body: "Hi John,\n\nFollowing up on our work with Domino's India...",
                      personalization_lines: ["Following up on our work with Domino's India"],
                      evidence_references: ["Domino's India 3x chat conversion"]
                    },
                    {
                      sequence_step: 3,
                      day_offset: 8,
                      step_title: 'Thoughtful Diagnostic Question',
                      subject: 'Question on multi-day inquiry handoffs',
                      body: 'Hi John,\n\nHow do store managers track guest follow-ups?',
                      personalization_lines: ['How do store managers track guest follow-ups?'],
                      evidence_references: ['Multi-unit operations']
                    },
                    {
                      sequence_step: 4,
                      day_offset: 13,
                      step_title: 'Polite Close-the-Loop',
                      subject: 'Closing the loop on Journey orchestration',
                      body: 'Hi John,\n\nWanted to close the loop if this is not a current priority.',
                      personalization_lines: ['Wanted to close the loop'],
                      evidence_references: ['Executive signoff']
                    }
                  ]
                })
              }]
            }
          }]
        }), { status: 200 })
      );

      const seq = await EmailSequenceGenerator.generateSequenceWithLLM(approved, company, enrichment, {
        id: 'test',
        llm_provider: 'gemini',
        gemini_api_key: 'test-gemini-key',
        search_provider: 'apollo',
        demo_mode_active: false,
        n8n_webhook_secret: '',
        gmail_connected: false,
        updated_at: ''
      });

      expect(seq.emails).toHaveLength(4);
      expect(seq.emails[0].subject).toContain("Taziki's");
      expect(seq.emails[0].personalization_lines.length).toBeGreaterThan(0);
    });
  });
});
