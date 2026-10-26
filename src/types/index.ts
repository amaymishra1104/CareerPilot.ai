export type Provenance = 'live' | 'manually_sourced' | 'real_curated' | 'real_public_web' | 'csv_imported' | 'demo';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type EmailVerificationStatus = 'verified' | 'unverified' | 'unavailable';

export interface ICPConfig {
  id: string;
  name: string;
  geography: string[];
  industries: string[];
  companySizeMinLocations: number;
  companySizeMaxLocations: number;
  restaurantCategories: string[];
  targetRoles: string[];
  buyingSignals: string[];
  notes?: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  headquarters: string;
  estimated_locations: number;
  company_size?: string;
  employee_count?: number; // Apollo employee headcount (distinct from location count!)
  description?: string;
  provider_company_id?: string;
  source_provider?: 'apollo' | 'curated' | 'csv' | 'demo' | string;
  location_count_status?: 'verified' | 'unknown' | 'estimated';
  restaurant_category: string;
  buying_signals: string[];
  source_urls: string[];
  retrieval_timestamp: string;
  provenance: Provenance;
  created_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  company_name: string;
  full_name: string;
  job_title: string;
  professional_profile_url?: string;
  work_email?: string;
  email_verification_status: EmailVerificationStatus;
  provider_person_id?: string;
  source_provider?: 'apollo' | 'curated' | 'csv' | 'demo' | string;
  is_company_verified?: boolean;
  company_verification_detail?: string;
  source_url: string;
  retrieval_timestamp: string;
  provenance: Provenance;
  approval_status: ApprovalStatus;
  approval_evidence_hash?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface EvidenceSource {
  id: string;
  lead_id: string;
  claim: string;
  snippet: string;
  source_url: string;
  is_hypothesis: boolean;
  retrieved_at: string;
}

export interface EnrichmentRecord {
  id: string;
  lead_id: string;
  company_id: string;
  company_overview: string;
  location_count_verifiable?: number;
  location_count_evidence?: string;
  operational_challenges: {
    description: string;
    is_hypothesis: boolean;
    evidence?: string;
  }[];
  verified_buying_signals: {
    signal: string;
    source_url: string;
    snippet: string;
  }[];
  personalization_hook: string;
  personalization_evidence_claim: string;
  confidence_score: number; // 0-100
  confidence_explanation: string;
  last_verified_timestamp: string;
  evidence_sources: EvidenceSource[];
  created_at: string;
}

export interface ApprovalHistoryItem {
  id: string;
  lead_id: string;
  previous_status: ApprovalStatus;
  new_status: ApprovalStatus;
  reviewer_notes?: string;
  rejection_reason?: string;
  changed_at: string;
  changed_by: string;
}

export interface EmailMessage {
  sequence_step: number; // 1, 2, 3, 4
  day_offset: number; // 1, 4, 8, 13
  step_title: string; // 'Initial Introduction', 'Use Case & Business Value', 'Thoughtful Question', 'Close the Loop'
  subject: string;
  body: string;
  personalization_lines: string[];
  evidence_references: string[];
  evidence_ids?: string[]; // IDs pointing to EvidenceSource.id
  is_edited?: boolean;
}

export interface EmailSequence {
  id: string;
  lead_id: string;
  contact_name: string;
  contact_email?: string;
  company_name: string;
  emails: EmailMessage[];
  status: 'GENERATED' | 'MODIFIED' | 'DRAFTED_IN_GMAIL';
  gmail_draft_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailDraftRecord {
  id: string;
  sequence_id: string;
  lead_id: string;
  sequence_step: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body_html: string;
  scheduled_day_text: string;
  gmail_draft_id?: string;
  created_in_gmail: boolean;
  creation_error?: string;
  is_stale?: boolean;
  is_approval_revoked?: boolean;
  created_at: string;
  updated_at?: string;
}

export type PipelineStage = 
  | 'company_search' 
  | 'lead_search' 
  | 'enrichment' 
  | 'human_approval' 
  | 'email_generation';

export type WorkflowStatus = 
  | 'IDLE' 
  | 'RUNNING' 
  | 'AWAITING_APPROVAL' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'PAUSED';

export interface WorkflowExecution {
  id: string;
  started_at: string;
  completed_at?: string;
  current_stage: PipelineStage;
  status: WorkflowStatus;
  summary: string;
  stats: {
    companies_found: number;
    leads_identified: number;
    leads_enriched: number;
    pending_approvals: number;
    approved_leads: number;
    rejected_leads: number;
    drafts_created: number;
    workflow_errors: number;
  };
}

export interface WorkflowLog {
  id: string;
  execution_id: string;
  stage: PipelineStage;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface IntegrationSettings {
  id: string;
  llm_provider: 'openai' | 'anthropic' | 'gemini' | 'mock_demo';
  llm_api_key?: string;
  gemini_api_key?: string;
  llm_model?: string;
  search_provider: 'apollo' | 'public_web' | 'csv' | 'perplexity' | 'hunter' | 'mock_demo';
  search_api_key?: string;
  apollo_api_key?: string;
  gmail_client_id?: string;
  gmail_client_secret?: string;
  gmail_redirect_uri?: string;
  gmail_refresh_token?: string;
  gmail_connected_email?: string;
  gmail_connected: boolean;
  n8n_webhook_secret: string;
  demo_mode_active: boolean;
  updated_at: string;
}

// ============================================================================
// CareerPilot AI Core Domain Interfaces
// ============================================================================

export type ResumeProfileType = 'technical' | 'ai_ml' | 'business_gtm' | 'custom';

export interface ResumeStructuredData {
  summary?: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
    honors?: string[];
  }>;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    start_date: string;
    end_date?: string;
    current?: boolean;
    description_bullets: string[];
    technologies?: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    bullet_points: string[];
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issue_date?: string;
    credential_url?: string;
  }>;
  achievements: string[];
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  profile_type: ResumeProfileType;
  title: string;
  version: number;
  is_default?: boolean;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'txt' | 'json';
  raw_content: string;
  extracted_text: string;
  structured_data: ResumeStructuredData;
  is_immutable_original: boolean;
  parent_resume_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  default_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface JobPreferences {
  id: string;
  user_id: string;
  target_roles: string[];
  employment_types: string[]; // 'internship' | 'full_time' | 'contract'
  locations: string[];
  remote_preference: 'remote_only' | 'hybrid' | 'on_site' | 'any';
  skills: string[];
  industries: string[];
  experience_level: 'internship' | 'entry_level' | 'associate' | 'mid_level';
  willing_to_relocate: boolean;
  expected_salary_or_stipend?: string;
  preferred_company_types: string[];
  updated_at: string;
}

export interface JobListing {
  id: string;
  user_id?: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level?: string;
  required_skills: string[];
  preferred_skills?: string[];
  salary_range?: string;
  job_url: string;
  publication_date?: string;
  application_deadline?: string;
  data_source: string;
  retrieval_timestamp: string;
  provenance: Provenance;
  is_expired: boolean;
  created_at: string;
}

export interface JobMatchResult {
  id: string;
  job_id: string;
  user_id: string;
  recommended_resume_id: string;
  recommended_profile_type: ResumeProfileType;
  match_score: number; // 0-100
  matching_skills: string[];
  missing_skills: string[];
  score_reasons: string[];
  project_overlap_score: number;
  experience_compatibility: string;
  location_compatibility: string;
  selection_rationale: string;
  created_at: string;
}

export interface RecruiterContact {
  id: string;
  job_id: string;
  company: string;
  name: string;
  title: string;
  email?: string;
  email_verification_status: EmailVerificationStatus;
  public_profile_url?: string;
  source_provider: string;
  is_company_verified: boolean;
  verification_notes?: string;
  retrieval_timestamp: string;
  provenance: Provenance;
  created_at: string;
}

export interface TailoredResumeRecord {
  id: string;
  user_id: string;
  job_id: string;
  source_resume_id: string;
  tailored_title: string;
  tailored_summary: string;
  structured_data: ResumeStructuredData;
  plain_text_preview: string;
  changes_made: Array<{
    section: string;
    action: string;
    details: string;
  }>;
  relevant_job_requirements_addressed: string[];
  validation_warnings: string[];
  factual_accuracy_guaranteed: boolean;
  approved_by_user: boolean;
  approved_at?: string;
  created_at: string;
}

export type ApplicationStatus = 
  | 'Discovered'
  | 'Matched'
  | 'Resume Tailored'
  | 'Awaiting Review'
  | 'Draft Created'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface JobApplicationRecord {
  id: string;
  user_id: string;
  job_id: string;
  company: string;
  role: string;
  job_url: string;
  contact_id?: string;
  contact_name?: string;
  contact_email?: string;
  status: ApplicationStatus;
  tailored_resume_id?: string;
  email_draft_id?: string;
  gmail_draft_id?: string;
  match_score?: number;
  date_discovered: string;
  date_applied?: string;
  follow_up_reminder_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedEmailDraft {
  id: string;
  user_id: string;
  job_id: string;
  contact_id?: string;
  email_type: 
    | 'job_application'
    | 'recruiter_outreach'
    | 'hiring_manager'
    | 'internship_inquiry'
    | 'referral_request'
    | 'application_followup'
    | 'interview_thankyou';
  recipient_name: string;
  recipient_email: string;
  delivery_target_email: string;
  subject: string;
  body: string;
  body_html: string;
  evidence_used: string[];
  tailored_resume_id?: string;
  status: 'GENERATED' | 'USER_EDITED' | 'APPROVED' | 'DRAFTED_IN_GMAIL' | 'SKIPPED';
  gmail_draft_id?: string;
  created_in_gmail: boolean;
  creation_error?: string;
  signature: string;
  created_at: string;
  updated_at: string;
}

export interface DailyAutomationConfig {
  id: string;
  user_id: string;
  is_enabled: boolean;
  frequency: 'daily' | 'manual';
  max_jobs_per_run: number;
  auto_tailor_resumes: boolean;
  auto_generate_drafts: boolean;
  last_run_timestamp?: string;
  last_run_status?: string;
  last_run_summary?: string;
}

