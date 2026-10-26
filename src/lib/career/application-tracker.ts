import { 
  JobApplicationRecord, 
  ApplicationStatus, 
  JobListing 
} from '@/types';
import { Store } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationTrackerService {
  /**
   * Creates or updates a tracked job application. Prevents duplicates.
   */
  static trackApplication(params: {
    userId: string;
    job: JobListing;
    status?: ApplicationStatus;
    contactId?: string;
    contactName?: string;
    contactEmail?: string;
    tailoredResumeId?: string;
    matchScore?: number;
    notes?: string;
  }): { application: JobApplicationRecord; isNew: boolean } {
    const existing = Store.getJobApplications(params.userId).find(
      a => a.job_id === params.job.id || 
           (a.company.toLowerCase().trim() === params.job.company.toLowerCase().trim() &&
            a.role.toLowerCase().trim() === params.job.title.toLowerCase().trim())
    );

    if (existing) {
      if (params.status) existing.status = params.status;
      if (params.tailoredResumeId) existing.tailored_resume_id = params.tailoredResumeId;
      if (params.contactId) existing.contact_id = params.contactId;
      if (params.contactName) existing.contact_name = params.contactName;
      if (params.contactEmail) existing.contact_email = params.contactEmail;
      if (params.matchScore !== undefined) existing.match_score = params.matchScore;
      if (params.notes) existing.notes = params.notes;

      existing.updated_at = new Date().toISOString();
      Store.saveJobApplication(existing);
      return { application: existing, isNew: false };
    }

    const newApp: JobApplicationRecord = {
      id: `app-${uuidv4().slice(0, 8)}`,
      user_id: params.userId,
      job_id: params.job.id,
      company: params.job.company,
      role: params.job.title,
      job_url: params.job.job_url,
      contact_id: params.contactId,
      contact_name: params.contactName,
      contact_email: params.contactEmail,
      status: params.status || 'Discovered',
      tailored_resume_id: params.tailoredResumeId,
      match_score: params.matchScore,
      date_discovered: new Date().toISOString(),
      notes: params.notes || `Discovered from ${params.job.data_source}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    Store.saveJobApplication(newApp);
    return { application: newApp, isNew: true };
  }

  /**
   * Updates status with lifecycle validation and follow-up reminders
   */
  static updateStatus(
    applicationId: string, 
    newStatus: ApplicationStatus, 
    notes?: string,
    followUpDays?: number
  ): JobApplicationRecord {
    const app = Store.getJobApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    app.status = newStatus;
    if (notes) {
      app.notes = notes;
    }

    if (newStatus === 'Applied') {
      app.date_applied = new Date().toISOString();
      // Set default 7-day follow up reminder if not specified
      const days = followUpDays || 7;
      const reminder = new Date();
      reminder.setDate(reminder.getDate() + days);
      app.follow_up_reminder_date = reminder.toISOString();
    }

    app.updated_at = new Date().toISOString();
    Store.saveJobApplication(app);
    return app;
  }
}
