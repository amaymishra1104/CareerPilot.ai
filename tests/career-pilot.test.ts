import os from 'os';
import path from 'path';
import fs from 'fs';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const testDbPath = path.join(os.tmpdir(), `careerpilot-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
process.env.OSVI_DB_PATH = testDbPath;

import { Store } from '../src/lib/storage';
import { ResumeParserService } from '../src/lib/career/resume-parser';
import { JobDiscoveryService } from '../src/lib/career/job-discovery';
import { JobMatchingEngine } from '../src/lib/career/job-matcher';
import { RecruiterDiscoveryService } from '../src/lib/career/recruiter-discovery';
import { ResumeTailoringEngine } from '../src/lib/career/resume-tailorer';
import { OutreachGeneratorService } from '../src/lib/career/outreach-generator';
import { CareerGmailDraftService } from '../src/lib/career/gmail-draft-service';
import { ApplicationTrackerService } from '../src/lib/career/application-tracker';
import { DailyAutomationRunner } from '../src/lib/career/daily-automation';
import { GmailIntegrationService, UnsafeEmailRecipientError } from '../src/lib/integrations/gmail';
import { JobListing, ResumeRecord, JobPreferences, PersonalizedEmailDraft, IntegrationSettings } from '../src/types';

describe('CareerPilot AI Core Platform & Guardrail Test Suite', () => {
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

  // 1. Resume Library & Parsing
  describe('Resume Library, Profile Classification & Structure Extraction', () => {
    it('accurately parses raw resume text into structured skills, education, and projects', () => {
      const sampleText = `
        Alex Mercer
        alex.mercer@example.edu | (555) 321-4321 | github.com/alexmercer

        EDUCATION
        State University | Bachelor of Science in Computer Science | GPA: 3.92/4.0
        Graduation: May 2026

        TECHNICAL SKILLS
        Languages: TypeScript, Python, Go, SQL
        Frameworks: React, Next.js, Node.js, Tailwind CSS
        Tools: Docker, PostgreSQL, Redis, Git, Vitest

        EXPERIENCE
        Software Engineering Intern | TechCorp | June 2025 - August 2025
        - Architected and built high-performance REST APIs in Node.js and PostgreSQL.
        - Reduced query execution latency by 35% through database indexing.

        PROJECTS
        Distributed Cache Engine (TypeScript, Redis, Docker)
        - Built an in-memory caching layer with LRU eviction and WebSocket replication.
      `;

      const parsed = ResumeParserService.parseResumeText(sampleText);
      expect(parsed.structuredData.skills).toContain('TypeScript');
      expect(parsed.structuredData.skills).toContain('Python');
      expect(parsed.structuredData.skills).toContain('Next.js');
      expect(parsed.structuredData.education.length).toBeGreaterThan(0);
      expect(parsed.structuredData.education[0].gpa).toBe('3.92/4.0');
      expect(parsed.profileType).toBe('technical');
    });

    it('classifies AI/ML resumes into ai_ml profile type', () => {
      const mlText = `
        AI Researcher | Deep Learning Specialist
        Experience with PyTorch, Hugging Face Transformers, RAG pipelines, fine-tuning LLMs with LoRA.
        Built semantic search engine with ChromaDB and FastAPI.
      `;

      const type = ResumeParserService.classifyProfileType(mlText, ['Python', 'PyTorch', 'LangChain', 'RAG']);
      expect(type).toBe('ai_ml');
    });

    it('classifies Business/GTM resumes into business_gtm profile type', () => {
      const bizText = `
        Product Management & GTM Specialist
        Authoring PRDs, conducting user research interviews, analyzing retention in Mixpanel and SQL.
        Led collegiate tech entrepreneurship chapter with $15K sponsorships.
      `;

      const type = ResumeParserService.classifyProfileType(bizText, ['Product Strategy', 'SQL', 'Mixpanel', 'PRD']);
      expect(type).toBe('business_gtm');
    });

    it('creates immutable resume records with version tracking and user isolation', () => {
      const record = ResumeParserService.createResumeRecord(
        'user-test-99',
        'my_resume.pdf',
        'pdf',
        'TypeScript and Next.js full stack developer resume.'
      );

      expect(record.is_immutable_original).toBe(true);
      expect(record.version).toBe(1);
      expect(record.user_id).toBe('user-test-99');
      expect(record.id).toMatch(/^resume-/);

      Store.saveResume(record);
      const fetched = Store.getResumeById(record.id);
      expect(fetched?.file_name).toBe('my_resume.pdf');
    });
  });

  // 2. Job Discovery & Deduplication
  describe('Provider-Based Job Discovery & Deduplication', () => {
    it('normalizes strings and deduplicates jobs with identical title and company', () => {
      const duplicateJobs: JobListing[] = [
        {
          id: 'job-1',
          title: 'Software Engineer Intern',
          company: 'Acme Corp',
          description: 'Frontend role',
          location: 'Remote',
          employment_type: 'Internship',
          required_skills: ['TypeScript', 'React'],
          job_url: 'https://acme.com/jobs/1',
          data_source: 'Test Feed A',
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'live',
          is_expired: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'job-2',
          title: 'software engineer intern ', // whitespace & case difference
          company: 'ACME CORP',
          description: 'Duplicate listing',
          location: 'Remote',
          employment_type: 'Internship',
          required_skills: ['TypeScript'],
          job_url: 'https://acme.com/jobs/1',
          data_source: 'Test Feed B',
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'live',
          is_expired: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'job-3',
          title: 'Machine Learning Intern',
          company: 'Acme Corp',
          description: 'Distinct role',
          location: 'Remote',
          employment_type: 'Internship',
          required_skills: ['Python', 'PyTorch'],
          job_url: 'https://acme.com/jobs/2',
          data_source: 'Test Feed A',
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'live',
          is_expired: false,
          created_at: new Date().toISOString()
        }
      ];

      const deduped = JobDiscoveryService.deduplicateJobs(duplicateJobs);
      expect(deduped.length).toBe(2);
      expect(deduped[0].id).toBe('job-1');
      expect(deduped[1].id).toBe('job-3');
    });

    it('parses valid CSV text into job listings and handles missing columns gracefully', () => {
      const csv = `Title,Company,Location,Description,Skills,URL
Backend Intern,Stripe,San Francisco,Distributed systems,"Go;TypeScript;PostgreSQL",https://stripe.com/jobs/1
AI Engineer,OpenAI,San Francisco,Large language models,"Python;PyTorch",https://openai.com/careers/2`;

      const { jobs, errors } = JobDiscoveryService.parseJobsFromCsv(csv);
      expect(errors.length).toBe(0);
      expect(jobs.length).toBe(2);
      expect(jobs[0].company).toBe('Stripe');
      expect(jobs[0].required_skills).toContain('Go');
      expect(jobs[0].provenance).toBe('csv_imported');
    });

    it('handles live provider HTTP failure without silently faking mock data', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('Service Unavailable', { status: 503, statusText: 'Backend Down' })
      );

      const res = await JobDiscoveryService.fetchRemotiveJobs('software-dev', 'react');
      expect(res.jobs.length).toBe(0);
      expect(res.error).toContain('Remotive API responded with HTTP 503');
      expect(res.provenance).toBe('live');
    });

    it('clearly tags curated demo jobs with provenance: demo', () => {
      const demoRes = JobDiscoveryService.getDemoJobListings();
      expect(demoRes.provenance).toBe('demo');
      expect(demoRes.jobs.length).toBeGreaterThan(0);
      expect(demoRes.jobs.every(j => j.provenance === 'real_public_web' || j.provenance === 'demo')).toBe(true);
    });
  });

  // 3. Job Matching Engine & Automatic Resume Selection
  describe('Job Matching Engine & Automatic Resume Profile Selection', () => {
    it('transparently evaluates skill overlap, project relevance, and produces detailed rationale', () => {
      const resumes = Store.getResumes();
      const techResume = resumes.find(r => r.profile_type === 'technical')!;
      const job: JobListing = {
        id: 'job-test-swe',
        title: 'Full Stack Engineer Intern',
        company: 'Vercel',
        description: 'Building modern web developer tools using Next.js, React, TypeScript, and Tailwind CSS.',
        location: 'Remote',
        employment_type: 'Internship',
        required_skills: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'PostgreSQL'],
        job_url: 'https://vercel.com/careers/intern',
        data_source: 'Vercel Careers',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_public_web',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const match = JobMatchingEngine.evaluateResumeMatch(job, techResume);
      expect(match.score).toBeGreaterThanOrEqual(85);
      expect(match.matchingSkills).toContain('TypeScript');
      expect(match.matchingSkills).toContain('Next.js');
      expect(match.reasons.length).toBeGreaterThan(2);
    });

    it('automatically selects AI/ML resume for machine learning roles and explains selection', () => {
      const resumes = Store.getResumes();
      const job: JobListing = {
        id: 'job-test-ml',
        title: 'Machine Learning Engineering Intern',
        company: 'Anthropic',
        description: 'Train deep learning models with PyTorch and evaluate generative language systems.',
        location: 'San Francisco, CA',
        employment_type: 'Internship',
        required_skills: ['Python', 'PyTorch', 'Transformers', 'RAG'],
        job_url: 'https://anthropic.com/careers',
        data_source: 'Anthropic Board',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_public_web',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const selection = JobMatchingEngine.selectBestResumeForJob(job, resumes);
      expect(selection.recommended_profile_type).toBe('ai_ml');
      expect(selection.selection_rationale).toContain('AI / Machine Learning Engineering Resume');
      expect(selection.score_reasons.some(r => r.includes('Transparency Note'))).toBe(true);
    });

    it('automatically selects Business/GTM resume for Product Management roles', () => {
      const resumes = Store.getResumes();
      const job: JobListing = {
        id: 'job-test-apm',
        title: 'Associate Product Manager Intern',
        company: 'Notion',
        description: 'Drive user research, author PRDs, and analyze funnel metrics with SQL.',
        location: 'San Francisco, CA',
        employment_type: 'Internship',
        required_skills: ['Product Strategy', 'PRD Authoring', 'User Research', 'SQL'],
        job_url: 'https://notion.so/careers',
        data_source: 'Notion Board',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_public_web',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const selection = JobMatchingEngine.selectBestResumeForJob(job, resumes);
      expect(selection.recommended_profile_type).toBe('business_gtm');
    });
  });

  // 4. Strict Factual Resume Tailoring (No Hallucinations)
  describe('Factual Resume Tailoring & Integrity Guardrails', () => {
    it('reorders relevant projects and highlights verified skills without inventing unverified skills', () => {
      const resumes = Store.getResumes();
      const techResume = resumes.find(r => r.profile_type === 'technical')!;

      const job: JobListing = {
        id: 'job-test-tailor',
        title: 'Backend Systems Engineer Intern',
        company: 'Stripe',
        description: 'High-throughput async event processing in TypeScript, Redis, and PostgreSQL.',
        location: 'San Francisco, CA',
        employment_type: 'Internship',
        required_skills: ['TypeScript', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes', 'Apache Kafka'],
        job_url: 'https://stripe.com/jobs/backend',
        data_source: 'Stripe Board',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_public_web',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const tailored = ResumeTailoringEngine.generateTailoredResume(job, techResume);

      // Verify factual integrity
      expect(tailored.factual_accuracy_guaranteed).toBe(true);
      expect(tailored.approved_by_user).toBe(false); // Requires user review!

      // Verified skills are highlighted
      expect(tailored.relevant_job_requirements_addressed).toContain('TypeScript');
      expect(tailored.relevant_job_requirements_addressed).toContain('Redis');

      // Unpossessed skills are NOT hallucinated into skills list
      expect(tailored.validation_warnings.length).toBeGreaterThan(0);
      expect(tailored.validation_warnings.some(w => w.includes('Apache Kafka'))).toBe(true);

      // Top project is elevated to match Redis / distributed systems
      expect(tailored.structured_data.projects[0].technologies).toContain('Redis');

      // Immutable original remains untouched
      expect(techResume.structured_data.skills.length).toBeGreaterThan(0);
    });

    it('requires explicit user approval before allowing tailored resume to be attached', () => {
      const resumes = Store.getResumes();
      const techResume = resumes[0];
      const job = Store.getJobListings()[0];

      const tailored = ResumeTailoringEngine.generateTailoredResume(job, techResume);
      expect(tailored.approved_by_user).toBe(false);

      const approved = ResumeTailoringEngine.approveTailoredResume(tailored);
      expect(approved.approved_by_user).toBe(true);
      expect(approved.approved_at).toBeDefined();
    });
  });

  // 5. Recruiter Discovery Guardrails
  describe('Recruiter Discovery & Contact Integrity', () => {
    it('uses official career channel fallback and never fabricates fake recruiter emails', async () => {
      const job: JobListing = {
        id: 'job-random-startup',
        title: 'Junior Developer',
        company: 'UnknownStartup99',
        description: 'New company opening',
        location: 'Remote',
        employment_type: 'Full-time',
        required_skills: ['TypeScript'],
        job_url: 'https://unknownstartup99.com/careers',
        data_source: 'Import',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'manually_sourced',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const res = await RecruiterDiscoveryService.discoverContactsForJob(job, '');
      expect(res.contacts.length).toBeGreaterThan(0);
      const contact = res.contacts[0];

      // CRITICAL GUARDRAIL: Never invent fake emails!
      expect(contact.email).toBeUndefined();
      expect(contact.email_verification_status).toBe('unavailable');
      expect(contact.source_provider).toBe('public_careers_page');
    });
  });

  // 6. Personalized Email Generation & Tone Control
  describe('Personalized Outreach Generation', () => {
    it('generates personalized recruiter outreach referencing verified projects and job requirements', () => {
      const resumes = Store.getResumes();
      const techResume = resumes.find(r => r.profile_type === 'technical')!;
      const job = Store.getJobListings()[0];
      const contact = Store.getRecruiterContacts()[0];
      const profile = Store.getUserProfile();

      const draft = OutreachGeneratorService.generateEmailDraft({
        job,
        contact,
        resume: techResume,
        userProfile: profile,
        emailType: 'recruiter_outreach',
        tone: 'professional'
      });

      expect(draft.subject).toContain(job.title);
      expect(draft.body).toContain(job.company);
      expect(draft.evidence_used.length).toBeGreaterThan(0);
      expect(draft.signature).toContain(profile.name);
      expect(draft.status).toBe('GENERATED');
    });

    it('supports multiple tones including enthusiastic student and concise impactful', () => {
      const resumes = Store.getResumes();
      const techResume = resumes[0];
      const job = Store.getJobListings()[0];

      const studentDraft = OutreachGeneratorService.generateEmailDraft({
        job,
        resume: techResume,
        tone: 'enthusiastic_student'
      });
      expect(studentDraft.body).toContain('Computer Science senior');

      const conciseDraft = OutreachGeneratorService.generateEmailDraft({
        job,
        resume: techResume,
        tone: 'concise_impactful'
      });
      expect(conciseDraft.body).toContain('Key qualifications:');
    });
  });

  // 7. Gmail Draft-Only Safeguards & Test Inbox Restriction
  describe('Gmail Draft-Only Safeguards & Operator Test Inbox Restriction', () => {
    it('strictly restricts Gmail draft recipient to authorized test inbox to protect live recruiters', () => {
      const testInbox = 'amaymishra1104@gmail.com';
      expect(() => {
        GmailIntegrationService.assertSafeRecipient('recruiter@stripe.com', testInbox);
      }).toThrow(UnsafeEmailRecipientError);

      expect(() => {
        GmailIntegrationService.assertSafeRecipient(testInbox, testInbox);
      }).not.toThrow();
    });

    it('falls back to internal draft queue safely when live Gmail OAuth is not connected', async () => {
      const draft: PersonalizedEmailDraft = {
        id: 'draft-unit-01',
        user_id: 'user-amay-01',
        job_id: 'job-stripe-swe-01',
        email_type: 'recruiter_outreach',
        recipient_name: 'Sarah Chen',
        recipient_email: 'sarah.chen@stripe.com',
        delivery_target_email: 'amaymishra1104@gmail.com',
        subject: 'SWE Intern Application',
        body: 'Hello Sarah, please find my application attached.',
        body_html: 'Hello Sarah, please find my application attached.',
        evidence_used: ['Stripe SWE Intern'],
        status: 'GENERATED',
        created_in_gmail: false,
        signature: 'Best, Amay',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const settings: IntegrationSettings = {
        ...Store.getSettings(),
        gmail_connected: false,
        gmail_refresh_token: ''
      };

      const result = await CareerGmailDraftService.createGmailDraftForOutreach(draft, settings);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal Draft Queue');

      const saved = Store.getPersonalizedDraftById('draft-unit-01');
      expect(saved?.status).toBe('APPROVED');
    });

    it('verifies that no messages.send or drafts.send API calls exist anywhere in src/', () => {
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

  // 8. Application Tracker & State Transitions
  describe('Application Tracker & Status Transitions', () => {
    it('creates tracked applications, prevents duplicates, and updates status accurately', () => {
      const job: JobListing = {
        id: 'job-unique-app-test-01',
        title: 'Full Stack Infrastructure Engineer',
        company: 'Unique Systems Lab',
        description: 'Building modern systems',
        location: 'Remote',
        employment_type: 'Full-time',
        required_skills: ['TypeScript', 'Node.js'],
        job_url: 'https://uniquesystems.io/careers/1',
        data_source: 'Test',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'real_public_web',
        is_expired: false,
        created_at: new Date().toISOString()
      };

      const { application, isNew } = ApplicationTrackerService.trackApplication({
        userId: 'user-amay-01',
        job,
        status: 'Discovered',
        matchScore: 94
      });

      expect(isNew).toBe(true);
      expect(application.status).toBe('Discovered');

      // Attempting to track the same job again does not create duplicate
      const retry = ApplicationTrackerService.trackApplication({
        userId: 'user-amay-01',
        job,
        status: 'Matched'
      });
      expect(retry.isNew).toBe(false);
      expect(retry.application.id).toBe(application.id);

      // Status transition to Applied sets follow-up reminder
      const applied = ApplicationTrackerService.updateStatus(application.id, 'Applied', 'Applied on Stripe portal');
      expect(applied.status).toBe('Applied');
      expect(applied.date_applied).toBeDefined();
      expect(applied.follow_up_reminder_date).toBeDefined();
    });
  });

  // 9. Daily Automation Workflow Runner
  describe('Daily Job Search Automation Workflow Runner', () => {
    it('executes full automated pipeline: discover, dedupe, score, tailor, draft, and report', async () => {
      const report = await DailyAutomationRunner.runDailyWorkflow('user-amay-01');
      expect(report.success).toBe(true);
      expect(report.jobsDiscovered).toBeGreaterThan(0);
      expect(report.matchesScored).toBeGreaterThan(0);
      expect(report.summary).toContain('Daily automation completed');
    });

    it('honors pause toggle when automation is disabled', async () => {
      Store.updateDailyAutomationConfig({ is_enabled: false });
      const report = await DailyAutomationRunner.runDailyWorkflow('user-amay-01');
      expect(report.success).toBe(false);
      expect(report.summary).toContain('paused');
    });
  });
});
