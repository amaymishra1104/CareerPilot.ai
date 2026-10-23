-- ==============================================================================
-- OSVI.ai GTM Automation Platform Schema Migration (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. ICP Configurations
CREATE TABLE IF NOT EXISTS icp_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'US QSR & Fast-Casual ICP',
    geography JSONB NOT NULL DEFAULT '["United States"]'::jsonb,
    industries JSONB NOT NULL DEFAULT '["Quick-service restaurants", "Fast-casual restaurant groups"]'::jsonb,
    company_size_min_locations INTEGER NOT NULL DEFAULT 20,
    company_size_max_locations INTEGER NOT NULL DEFAULT 200,
    restaurant_categories JSONB NOT NULL DEFAULT '["burgers", "pizza", "chicken", "sandwiches", "fast-casual"]'::jsonb,
    target_roles JSONB NOT NULL DEFAULT '["COO", "VP of Operations", "Head of Guest Experience", "VP of Customer Experience", "Head of Contact Center"]'::jsonb,
    buying_signals JSONB NOT NULL DEFAULT '["restaurant expansion", "franchise growth", "hiring for operations/customer support", "documented investments in automation"]'::jsonb,
    notes TEXT DEFAULT 'Hypotheses for US QSR journey orchestration outreach',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    website TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Quick-service restaurants',
    headquarters TEXT NOT NULL,
    estimated_locations INTEGER NOT NULL,
    company_size TEXT,
    restaurant_category TEXT NOT NULL,
    buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    retrieval_timestamp TIMESTAMPTZ DEFAULT NOW(),
    provenance TEXT NOT NULL DEFAULT 'demo' CHECK (provenance IN ('live', 'manually_sourced', 'demo')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_provenance ON companies(provenance);
CREATE INDEX IF NOT EXISTS idx_companies_locations ON companies(estimated_locations);

-- 3. Contacts / Decision Makers
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    professional_profile_url TEXT,
    work_email TEXT,
    email_verification_status TEXT NOT NULL DEFAULT 'unavailable' CHECK (email_verification_status IN ('verified', 'unverified', 'unavailable')),
    source_url TEXT NOT NULL,
    retrieval_timestamp TIMESTAMPTZ DEFAULT NOW(),
    provenance TEXT NOT NULL DEFAULT 'demo' CHECK (provenance IN ('live', 'manually_sourced', 'demo')),
    approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewer_notes TEXT,
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_contact_per_company UNIQUE (company_id, full_name)
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_approval_status ON contacts(approval_status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(work_email);

-- 4. Enrichment Records
CREATE TABLE IF NOT EXISTS enrichments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_overview TEXT NOT NULL,
    location_count_verifiable INTEGER,
    location_count_evidence TEXT,
    operational_challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified_buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    personalization_hook TEXT NOT NULL,
    personalization_evidence_claim TEXT NOT NULL,
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    confidence_explanation TEXT NOT NULL,
    last_verified_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_enrichment_per_lead UNIQUE (lead_id)
);

CREATE INDEX IF NOT EXISTS idx_enrichments_lead_id ON enrichments(lead_id);

-- 5. Evidence Sources
CREATE TABLE IF NOT EXISTS evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    snippet TEXT NOT NULL,
    source_url TEXT NOT NULL,
    is_hypothesis BOOLEAN NOT NULL DEFAULT false,
    retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_lead_id ON evidence_sources(lead_id);

-- 6. Approval History Audit Log
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reviewer_notes TEXT,
    rejection_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT NOT NULL DEFAULT 'gtm_reviewer'
);

CREATE INDEX IF NOT EXISTS idx_approval_history_lead ON approval_history(lead_id);

-- 7. Email Sequences
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    company_name TEXT NOT NULL,
    emails JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'MODIFIED', 'DRAFTED_IN_GMAIL')),
    gmail_draft_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_sequence_per_lead UNIQUE (lead_id)
);

CREATE INDEX IF NOT EXISTS idx_sequences_lead_id ON email_sequences(lead_id);

-- 8. Email Drafts (Draft Queue)
CREATE TABLE IF NOT EXISTS email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    sequence_step INTEGER NOT NULL CHECK (sequence_step BETWEEN 1 AND 4),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    scheduled_day_text TEXT NOT NULL,
    gmail_draft_id TEXT,
    created_in_gmail BOOLEAN DEFAULT FALSE,
    creation_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_drafts_lead ON email_drafts(lead_id);

-- 9. Workflow Executions & Logs
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    current_stage TEXT NOT NULL DEFAULT 'company_search',
    status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'RUNNING', 'AWAITING_APPROVAL', 'COMPLETED', 'FAILED', 'PAUSED')),
    summary TEXT,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success')),
    message TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_logs_execution ON workflow_logs(execution_id);

-- 10. Integration Settings
CREATE TABLE IF NOT EXISTS integration_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    llm_provider TEXT NOT NULL DEFAULT 'mock_demo',
    llm_api_key TEXT,
    llm_model TEXT DEFAULT 'gpt-4o-mini',
    search_provider TEXT NOT NULL DEFAULT 'mock_demo',
    search_api_key TEXT,
    gmail_client_id TEXT,
    gmail_client_secret TEXT,
    gmail_redirect_uri TEXT,
    gmail_refresh_token TEXT,
    gmail_connected_email TEXT,
    gmail_connected BOOLEAN DEFAULT FALSE,
    n8n_webhook_secret TEXT NOT NULL DEFAULT 'osvi_secret_token_123',
    demo_mode_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) setup (optional / recommended for Supabase)
ALTER TABLE icp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role and authenticated app access
CREATE POLICY "App full access icp" ON icp_configurations FOR ALL USING (true);
CREATE POLICY "App full access companies" ON companies FOR ALL USING (true);
CREATE POLICY "App full access contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "App full access enrichments" ON enrichments FOR ALL USING (true);
CREATE POLICY "App full access evidence" ON evidence_sources FOR ALL USING (true);
CREATE POLICY "App full access history" ON approval_history FOR ALL USING (true);
CREATE POLICY "App full access sequences" ON email_sequences FOR ALL USING (true);
CREATE POLICY "App full access drafts" ON email_drafts FOR ALL USING (true);
CREATE POLICY "App full access executions" ON workflow_executions FOR ALL USING (true);
CREATE POLICY "App full access logs" ON workflow_logs FOR ALL USING (true);
CREATE POLICY "App full access settings" ON integration_settings FOR ALL USING (true);
