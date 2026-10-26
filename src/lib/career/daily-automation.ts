import { Store } from '@/lib/storage';
import { JobDiscoveryService } from '@/lib/career/job-discovery';
import { JobMatchingEngine } from '@/lib/career/job-matcher';
import { RecruiterDiscoveryService } from '@/lib/career/recruiter-discovery';
import { ResumeTailoringEngine } from '@/lib/career/resume-tailorer';
import { OutreachGeneratorService } from '@/lib/career/outreach-generator';
import { ApplicationTrackerService } from '@/lib/career/application-tracker';
import { JobListing, DailyAutomationConfig } from '@/types';

export interface AutomationExecutionReport {
  timestamp: string;
  success: boolean;
  jobsDiscovered: number;
  newJobsAdded: number;
  matchesScored: number;
  resumesTailored: number;
  draftsPrepared: number;
  summary: string;
  warnings: string[];
}

export class DailyAutomationRunner {
  /**
   * Executes the full configurable daily automation pipeline
   */
  static async runDailyWorkflow(userId = 'user-amay-01'): Promise<AutomationExecutionReport> {
    const config = Store.getDailyAutomationConfig();
    const warnings: string[] = [];

    if (!config.is_enabled) {
      return {
        timestamp: new Date().toISOString(),
        success: false,
        jobsDiscovered: 0,
        newJobsAdded: 0,
        matchesScored: 0,
        resumesTailored: 0,
        draftsPrepared: 0,
        summary: 'Daily automation is currently paused. Enable it in settings to resume automated runs.',
        warnings: ['Automation runner paused by user configuration.']
      };
    }

    const preferences = Store.getJobPreferences();
    const resumes = Store.getResumes(userId);
    const existingJobs = Store.getJobListings();
    const userProfile = Store.getUserProfile();
    const settings = Store.getSettings();

    if (resumes.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        success: false,
        jobsDiscovered: 0,
        newJobsAdded: 0,
        matchesScored: 0,
        resumesTailored: 0,
        draftsPrepared: 0,
        summary: 'Cannot run automation: No resumes found in Resume Library. Please upload at least one resume profile.',
        warnings: ['Resume Library empty.']
      };
    }

    // Step 1: Discover new jobs
    let discoveredListings: JobListing[] = [];

    // Query Remotive API with first target role or category
    const targetQuery = preferences.target_roles[0] || 'Software Engineer';
    const remotiveRes = await JobDiscoveryService.fetchRemotiveJobs('software-dev', targetQuery);

    if (remotiveRes.jobs.length > 0) {
      discoveredListings = remotiveRes.jobs;
    } else if (remotiveRes.error) {
      warnings.push(`Remotive Provider Warning: ${remotiveRes.error}`);
    }

    // If zero live listings from Remotive, query Arbeitnow
    if (discoveredListings.length === 0) {
      const arbeitnowRes = await JobDiscoveryService.fetchArbeitnowJobs(targetQuery);
      if (arbeitnowRes.jobs.length > 0) {
        discoveredListings = arbeitnowRes.jobs;
      } else if (arbeitnowRes.error) {
        warnings.push(`Arbeitnow Provider Warning: ${arbeitnowRes.error}`);
      }
    }

    // If still zero live listings (e.g. offline/mock environment), use curated demo openings with honest provenance
    if (discoveredListings.length === 0) {
      const demoRes = JobDiscoveryService.getDemoJobListings(targetQuery);
      discoveredListings = demoRes.jobs;
      warnings.push('Live external job APIs yielded 0 listings or were unavailable. Used curated starter tech dataset.');
    }

    // Step 2: Deduplicate against previously seen jobs
    const maxToProcess = config.max_jobs_per_run || 8;
    const existingSignatures = new Set(
      existingJobs.map(j => `${JobDiscoveryService.normalizeString(j.title)}::${JobDiscoveryService.normalizeString(j.company)}`)
    );

    const newJobs = discoveredListings.filter(j => {
      const sig = `${JobDiscoveryService.normalizeString(j.title)}::${JobDiscoveryService.normalizeString(j.company)}`;
      return !existingSignatures.has(sig);
    }).slice(0, maxToProcess);

    // Save newly discovered jobs to store
    Store.addJobListings(newJobs);

    const jobsToProcess = newJobs.length > 0 ? newJobs : discoveredListings.slice(0, 3);
    let matchesScored = 0;
    let resumesTailored = 0;
    let draftsPrepared = 0;

    // Steps 3 - 7: Score matches, auto-recommend resume, discover contacts, tailor, and prepare draft
    for (const job of jobsToProcess) {
      // Step 3 & 4: Score match & select best resume
      const matchResult = JobMatchingEngine.selectBestResumeForJob(job, resumes, preferences);
      Store.saveJobMatch(matchResult);
      matchesScored++;

      // Step 5: Identify hiring contacts
      const contactRes = await RecruiterDiscoveryService.discoverContactsForJob(job, settings.apollo_api_key);
      const contact = contactRes.contacts[0];
      if (contact) {
        Store.saveRecruiterContact(contact);
      }

      // Track application in 'Discovered' or 'Matched' status
      const { application } = ApplicationTrackerService.trackApplication({
        userId,
        job,
        status: 'Matched',
        contactId: contact?.id,
        contactName: contact?.name,
        contactEmail: contact?.email,
        matchScore: matchResult.match_score,
        notes: `Automated match: ${matchResult.match_score}% fit for ${matchResult.recommended_profile_type} profile.`
      });

      // Step 6: Prepare tailored resume if enabled and match is high quality (>= 80%)
      let tailoredResumeId: string | undefined = undefined;
      if (config.auto_tailor_resumes && matchResult.match_score >= 80) {
        const sourceResume = resumes.find(r => r.id === matchResult.recommended_resume_id) || resumes[0];
        const tailored = ResumeTailoringEngine.generateTailoredResume(job, sourceResume);
        Store.saveTailoredResume(tailored);
        tailoredResumeId = tailored.id;
        resumesTailored++;

        ApplicationTrackerService.updateStatus(
          application.id, 
          'Resume Tailored', 
          `Tailored resume prepared using verified skills (${tailored.relevant_job_requirements_addressed.join(', ')}). Awaiting user review.`
        );
      }

      // Step 7: Prepare personalized outreach draft if enabled
      if (config.auto_generate_drafts && matchResult.match_score >= 80) {
        const sourceResume = resumes.find(r => r.id === matchResult.recommended_resume_id) || resumes[0];
        const draft = OutreachGeneratorService.generateEmailDraft({
          job,
          contact,
          resume: sourceResume,
          userProfile,
          emailType: 'recruiter_outreach',
          tone: 'professional',
          tailoredResumeId
        });

        Store.savePersonalizedDraft(draft);
        draftsPrepared++;

        ApplicationTrackerService.updateStatus(
          application.id, 
          'Awaiting Review', 
          'Personalized draft generated and queued for human review. Ready to inspect in Draft Queue.'
        );
      }
    }

    const summary = `Daily automation completed: ${discoveredListings.length} jobs discovered, ${newJobs.length} new listings added, ${matchesScored} matches scored, ${resumesTailored} resumes tailored, and ${draftsPrepared} outreach drafts prepared for review. Zero emails were sent automatically.`;

    // Update config last run info
    Store.updateDailyAutomationConfig({
      last_run_timestamp: new Date().toISOString(),
      last_run_status: 'SUCCESS',
      last_run_summary: summary
    });

    return {
      timestamp: new Date().toISOString(),
      success: true,
      jobsDiscovered: discoveredListings.length,
      newJobsAdded: newJobs.length,
      matchesScored,
      resumesTailored,
      draftsPrepared,
      summary,
      warnings
    };
  }
}
