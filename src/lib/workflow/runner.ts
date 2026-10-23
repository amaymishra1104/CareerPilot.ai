import { Store } from '@/lib/storage';
import { DemoSearchProvider } from '@/lib/providers/demo-provider';
import { LiveSearchProvider } from '@/lib/providers/live-provider';
import { EnrichmentEngine } from '@/lib/enrichment/enricher';
import { EmailSequenceGenerator } from '@/lib/sequences/generator';
import { GmailIntegrationService } from '@/lib/integrations/gmail';
import { ApprovalGate } from '@/lib/approvals/gate';
import { 
  WorkflowExecution, 
  WorkflowLog, 
  PipelineStage, 
  WorkflowStatus 
} from '@/types';

export class WorkflowRunner {
  static async runPipeline(executionId?: string): Promise<WorkflowExecution> {
    const id = executionId || `exec-${Date.now()}`;
    const icp = Store.getIcp();
    const settings = Store.getSettings();

    let execution: WorkflowExecution = {
      id,
      started_at: new Date().toISOString(),
      current_stage: 'company_search',
      status: 'RUNNING',
      summary: 'Pipeline initialized. Executing Stage 1: Company Search...',
      stats: {
        companies_found: 0,
        leads_identified: 0,
        leads_enriched: 0,
        pending_approvals: 0,
        approved_leads: 0,
        rejected_leads: 0,
        drafts_created: 0,
        workflow_errors: 0
      }
    };

    Store.saveWorkflowExecution(execution);

    const log = (stage: PipelineStage, level: 'info' | 'warn' | 'error' | 'success', message: string, metadata?: Record<string, unknown>) => {
      const logEntry: WorkflowLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        execution_id: id,
        stage,
        level,
        message,
        metadata,
        timestamp: new Date().toISOString()
      };
      Store.addWorkflowLog(logEntry);
      if (level === 'error') {
        execution.stats.workflow_errors++;
      }
    };

    try {
      // -------------------------------------------------------------
      // STAGE 1: Company Search
      // -------------------------------------------------------------
      execution.current_stage = 'company_search';
      log('company_search', 'info', `Beginning Company Search using ${settings.search_provider === 'mock_demo' ? 'Demo Sandbox Provider' : 'Live Provider'}. ICP: ${icp.restaurantCategories.join(', ')} (20-200 locations).`);

      const provider = settings.search_provider === 'mock_demo'
        ? new DemoSearchProvider()
        : new LiveSearchProvider(settings.search_api_key, settings.search_provider);

      let foundCompanies: any[] = [];
      try {
        const searchRes = await provider.searchCompanies({}, icp);
        foundCompanies = searchRes.companies;
        const newlyAdded = Store.addCompanies(foundCompanies);
        execution.stats.companies_found = Store.getCompanies().length;
        log('company_search', 'success', `Discovered ${foundCompanies.length} companies (${newlyAdded.length} new records ingested, ${foundCompanies.length - newlyAdded.length} deduplicated). Provenance: ${searchRes.provenance}`);
      } catch (err: any) {
        log('company_search', 'error', `Company search failed: ${err.message}`);
        // In demo fallback mode, do not crash the pipeline
        if (settings.search_provider !== 'mock_demo') {
          execution.status = 'FAILED';
          execution.summary = `Failed at Company Search: ${err.message}`;
          Store.saveWorkflowExecution(execution);
          return execution;
        }
      }

      // -------------------------------------------------------------
      // STAGE 2: Lead Search
      // -------------------------------------------------------------
      execution.current_stage = 'lead_search';
      log('lead_search', 'info', `Identifying decision-makers for companies. Target roles: ${icp.targetRoles.join(', ')}.`);

      const allCompanies = Store.getCompanies();
      let totalLeadsIdentified = 0;

      for (const comp of allCompanies.slice(0, 5)) {
        try {
          const leadRes = await provider.searchContacts(comp.id, comp.name, icp.targetRoles);
          const added = Store.addContacts(leadRes.contacts);
          totalLeadsIdentified += added.length;
          log('lead_search', 'info', `Identified ${leadRes.contacts.length} decision makers for ${comp.name} (${added.length} newly added after person/email deduplication).`);
        } catch (err: any) {
          log('lead_search', 'warn', `Lead search error for ${comp.name}: ${err.message}`);
        }
      }

      const allContacts = Store.getContacts();
      execution.stats.leads_identified = allContacts.length;
      log('lead_search', 'success', `Lead search phase complete. Total active leads in system: ${allContacts.length}.`);

      // -------------------------------------------------------------
      // STAGE 3: Enrichment Engine
      // -------------------------------------------------------------
      execution.current_stage = 'enrichment';
      log('enrichment', 'info', `Running evidence-backed enrichment engine across leads. Verifying location counts, operational challenges, buying signals, and sources.`);

      let enrichedCount = 0;
      for (const lead of allContacts) {
        const company = Store.getCompanyById(lead.company_id);
        if (!company) continue;

        try {
          const enrichment = await EnrichmentEngine.enrichLead(lead, company, settings);
          Store.saveEnrichment(enrichment);
          enrichedCount++;
          log('enrichment', 'info', `Enriched lead: ${lead.full_name} (${company.name}). Confidence Score: ${enrichment.confidence_score}/100. Personalization Hook verified.`);
        } catch (err: any) {
          log('enrichment', 'error', `Failed to enrich lead ${lead.full_name}: ${err.message}`);
        }
      }

      execution.stats.leads_enriched = enrichedCount;
      log('enrichment', 'success', `Completed enrichment for ${enrichedCount} leads with verified evidence citations.`);

      // -------------------------------------------------------------
      // STAGE 4: Human Approval Gate (MANDATORY PAUSE)
      // -------------------------------------------------------------
      execution.current_stage = 'human_approval';
      const pendingLeads = Store.getContacts({ approval_status: 'PENDING' });
      const approvedLeads = Store.getContacts({ approval_status: 'APPROVED' });
      const rejectedLeads = Store.getContacts({ approval_status: 'REJECTED' });

      execution.stats.pending_approvals = pendingLeads.length;
      execution.stats.approved_leads = approvedLeads.length;
      execution.stats.rejected_leads = rejectedLeads.length;

      if (pendingLeads.length > 0) {
        execution.status = 'AWAITING_APPROVAL';
        execution.summary = `Workflow paused at Stage 4 (Human Approval Gate). ${pendingLeads.length} leads pending human review. Only approved leads will proceed to email generation.`;
        log('human_approval', 'info', `Pipeline halted at Human Approval Gate. ${pendingLeads.length} leads require review before sequence generation. Pending leads will NOT generate email drafts.`);
        Store.saveWorkflowExecution(execution);
        return execution;
      }

      // If all leads have already been reviewed (e.g. during a resume or rerun), continue to Stage 5
      return await this.resumeAfterApproval(execution.id);

    } catch (err: any) {
      log(execution.current_stage, 'error', `Workflow fatal error: ${err.message}`);
      execution.status = 'FAILED';
      execution.summary = `Workflow encountered an unexpected error: ${err.message}`;
      Store.saveWorkflowExecution(execution);
      return execution;
    }
  }

  /**
   * Resumes workflow after human approval has been performed.
   * STRICT SAFETY GUARANTEE: Does not auto-create drafts without explicit confirmation flag,
   * and NEVER overwrites user-edited sequences.
   */
  static async resumeAfterApproval(
    executionId: string,
    options?: { autoCreateDrafts?: boolean }
  ): Promise<WorkflowExecution> {
    const execution = Store.getLatestWorkflowExecution() || {
      id: executionId,
      started_at: new Date().toISOString(),
      current_stage: 'email_generation',
      status: 'RUNNING',
      summary: 'Resuming workflow post-approval...',
      stats: {
        companies_found: Store.getCompanies().length,
        leads_identified: Store.getContacts().length,
        leads_enriched: Object.keys(Store.getContacts()).length,
        pending_approvals: Store.getContacts({ approval_status: 'PENDING' }).length,
        approved_leads: Store.getContacts({ approval_status: 'APPROVED' }).length,
        rejected_leads: Store.getContacts({ approval_status: 'REJECTED' }).length,
        drafts_created: 0,
        workflow_errors: 0
      }
    };

    const log = (stage: PipelineStage, level: 'info' | 'warn' | 'error' | 'success', message: string) => {
      Store.addWorkflowLog({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        execution_id: execution.id,
        stage,
        level,
        message,
        timestamp: new Date().toISOString()
      });
    };

    // -------------------------------------------------------------
    // STAGE 5: Email Outreach & Draft Generation
    // -------------------------------------------------------------
    execution.current_stage = 'email_generation';
    execution.status = 'RUNNING';
    const settings = Store.getSettings();

    const approvedLeads = Store.getContacts({ approval_status: 'APPROVED' });
    log('email_generation', 'info', `Resuming Stage 5: Email Sequence Generation. Found ${approvedLeads.length} APPROVED leads.`);

    if (approvedLeads.length === 0) {
      log('email_generation', 'warn', 'Zero approved leads found. Rejected or pending leads are strictly blocked from sequence generation.');
      execution.status = 'COMPLETED';
      execution.completed_at = new Date().toISOString();
      execution.summary = 'Completed: No approved leads to generate email sequences for.';
      Store.saveWorkflowExecution(execution);
      return execution;
    }

    let draftsCount = 0;
    for (const lead of approvedLeads) {
      try {
        // Enforce approval gate
        ApprovalGate.assertApproved(lead.id);

        const company = Store.getCompanyById(lead.company_id);
        const enrichment = Store.getEnrichmentByLeadId(lead.id);
        if (!company || !enrichment) {
          log('email_generation', 'warn', `Missing company or enrichment record for lead ${lead.full_name}. Skipping.`);
          continue;
        }

        // Check if sequence already exists and was customized by user
        const existingSeq = Store.getSequenceByLeadId(lead.id);
        let sequence;
        if (existingSeq && (existingSeq.status === 'MODIFIED' || existingSeq.emails.some(e => e.is_edited))) {
          sequence = existingSeq;
          log('email_generation', 'info', `Preserved existing customized sequence for ${lead.full_name} (${company.name}). Not overwriting edits.`);
        } else {
          sequence = EmailSequenceGenerator.generateSequence(lead, company, enrichment);
          Store.saveSequence(sequence);
          log('email_generation', 'info', `Generated 4-email sequence for approved lead: ${lead.full_name} (${company.name}).`);
        }

        // Draft creation requires explicit confirmation
        if (options?.autoCreateDrafts) {
          const draftRes = await GmailIntegrationService.createDraftsForSequence(sequence.id, settings);
          draftsCount += draftRes.draftsCreated;
          log('email_generation', 'success', `Saved ${draftRes.draftsCreated} email drafts for ${lead.full_name} in ${settings.gmail_connected ? 'Gmail Drafts' : 'Internal Draft Queue'}.`);
        } else {
          log('email_generation', 'info', `Draft creation queued for ${lead.full_name}. Requires explicit per-lead confirmation to protect against accidental sending.`);
        }
      } catch (err: any) {
        log('email_generation', 'error', `Failed generating sequence/drafts for ${lead.full_name}: ${err.message}`);
        execution.stats.workflow_errors++;
      }
    }

    execution.stats.drafts_created = draftsCount;
    execution.status = 'COMPLETED';
    execution.completed_at = new Date().toISOString();
    execution.summary = options?.autoCreateDrafts
      ? `Workflow successfully completed! Created ${draftsCount} drafts for approved leads.`
      : `Workflow completed! Prepared sequences for ${approvedLeads.length} approved leads. Draft creation held for explicit operator review.`;
    Store.saveWorkflowExecution(execution);

    return execution;
  }
}
