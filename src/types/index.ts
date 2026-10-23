export type Provenance = 'live' | 'manually_sourced' | 'real_curated' | 'demo';

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
  search_provider: 'apollo' | 'perplexity' | 'hunter' | 'mock_demo';
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
