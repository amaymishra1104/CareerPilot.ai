import { 
  JobListing, 
  RecruiterContact, 
  ResumeRecord, 
  PersonalizedEmailDraft,
  UserProfile 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

export type OutreachEmailType = 
  | 'job_application'
  | 'recruiter_outreach'
  | 'hiring_manager'
  | 'internship_inquiry'
  | 'referral_request'
  | 'application_followup'
  | 'interview_thankyou';

export type OutreachTone = 
  | 'professional'
  | 'enthusiastic_student'
  | 'concise_impactful';

export interface EmailGenerationInput {
  job: JobListing;
  contact?: RecruiterContact;
  resume: ResumeRecord;
  userProfile?: UserProfile;
  emailType?: OutreachEmailType;
  tone?: OutreachTone;
  tailoredResumeId?: string;
  authorizedInbox?: string;
}

export class OutreachGeneratorService {
  /**
   * Generates tailored, high-converting professional outreach email
   */
  static generateEmailDraft(input: EmailGenerationInput): PersonalizedEmailDraft {
    const {
      job,
      contact,
      resume,
      userProfile,
      emailType = 'recruiter_outreach',
      tone = 'professional',
      tailoredResumeId,
      authorizedInbox
    } = input;

    const applicantName = userProfile?.name || 'Amay Mishra';
    const applicantDegree = 'B.S. in Computer Science (Senior / Class of 2026)';
    const recipientName = contact?.name && !contact.name.includes('Team') ? contact.name : `${job.company} Recruiting Team`;
    const recipientGreeting = contact?.name && !contact.name.includes('Team') ? contact.name.split(' ')[0] : 'there';
    const cleanJobTitle = job.title;
    const targetEmail = contact?.email && contact.email !== 'unavailable' ? contact.email : `recruiting@${job.company.toLowerCase().replace(/[^\w]/g, '')}.com`;
    const testInbox = authorizedInbox || process.env.USER_INBOX || process.env.TEST_INBOX || 'amaymishra1104@gmail.com';

    // Highlight top relevant project from resume
    const topProject = resume.structured_data.projects[0];
    const topSkills = resume.structured_data.skills.slice(0, 3).join(', ');
    const evidenceUsed: string[] = [
      `Job requirements for ${cleanJobTitle} at ${job.company} (${job.required_skills.slice(0, 4).join(', ')})`,
      `Demonstrated project: "${topProject?.title || 'Distributed Systems Engine'}" utilizing ${topProject?.technologies?.join(', ') || topSkills}`,
      `Verified applicant qualification: ${applicantDegree}`
    ];

    let subject = '';
    let body = '';

    const signature = userProfile?.default_signature || 
      `Best regards,\n${applicantName}\n${applicantDegree}\n${userProfile?.email || 'amaymishra1104@gmail.com'} | ${userProfile?.phone || '(555) 234-5678'}\nGitHub: ${userProfile?.github_url || 'https://github.com/amaymishra'} | LinkedIn: ${userProfile?.linkedin_url || 'https://linkedin.com/in/amaymishra'}`;

    if (emailType === 'recruiter_outreach') {
      subject = `${cleanJobTitle} — ${applicantName} (${applicantDegree})`;
      if (tone === 'enthusiastic_student') {
        body = `Hi ${recipientGreeting},\n\nI hope your week is going great! I came across ${job.company}'s opening for the ${cleanJobTitle} role and was immediately inspired by your team's work.\n\nAs a Computer Science senior graduating in 2026, my hands-on focus has been in ${topSkills}. Recently, I built ${topProject?.title}, where I ${topProject?.bullet_points?.[0] || 'engineered high-throughput asynchronous task pipelines'}.\n\nGiven ${job.company}'s focus on ${job.required_skills[0] || 'scalable systems'}, I would love to learn if my background aligns with what you're seeking for the team. My tailored resume is attached for your review.\n\nThank you for your time and guidance!\n\n${signature}`;
      } else if (tone === 'concise_impactful') {
        body = `Hi ${recipientGreeting},\n\nI am writing to express strong interest in the ${cleanJobTitle} opening at ${job.company}.\n\nKey qualifications:\n• Demonstrated proficiency in ${topSkills}.\n• Built ${topProject?.title} (${topProject?.technologies?.join(', ')}).\n• Senior in Computer Science with previous engineering internship experience.\n\nI have attached my tailored resume and would appreciate 10 minutes to connect or hear about your interview process.\n\n${signature}`;
      } else {
        body = `Dear ${recipientGreeting},\n\nI am reaching out to introduce myself regarding the ${cleanJobTitle} opportunity at ${job.company}. As a senior Computer Science student with practical experience in ${topSkills}, I have closely followed ${job.company}'s engineering achievements and would welcome the opportunity to contribute.\n\nIn my previous work and projects, I engineered ${topProject?.title}, focusing on ${topProject?.bullet_points?.[0] || 'reliable software design and measurable performance optimization'}. My coursework and technical projects directly mirror the core qualifications outlined for the ${cleanJobTitle} position.\n\nI have attached my tailored resume for your consideration and welcome any opportunity to discuss how my skillset fits ${job.company}'s roadmap.\n\nThank you very much for your time.\n\n${signature}`;
      }
    } else if (emailType === 'hiring_manager') {
      subject = `Engineering inquiry regarding ${cleanJobTitle} team at ${job.company}`;
      body = `Hi ${recipientGreeting},\n\nI noticed your engineering leadership at ${job.company} and wanted to reach out regarding the ${cleanJobTitle} role on your team.\n\nI recently developed ${topProject?.title} utilizing ${topProject?.technologies?.join(', ')}, where I ${topProject?.bullet_points?.[0] || 'implemented fault-tolerant distributed pipelines'}. Reviewing the ${cleanJobTitle} requirements, I saw strong overlap with my practical experience in ${topSkills}.\n\nI would value the opportunity to learn more about the team's technical roadmap and see how my background could support your upcoming initiatives.\n\n${signature}`;
    } else if (emailType === 'internship_inquiry') {
      subject = `Summer 2026 Internship Inquiry: ${cleanJobTitle} — ${applicantName}`;
      body = `Hi ${recipientGreeting},\n\nI hope you are well. I am a Computer Science senior actively exploring summer internship opportunities in software engineering, and I am especially excited about ${job.company}'s work.\n\nWith practical experience in ${topSkills} and projects including ${topProject?.title}, I am eager to apply my systems background to high-impact production problems.\n\nCould you let me know if ${job.company} is currently considering intern applicants for this cohort? I have attached my resume for reference.\n\n${signature}`;
    } else if (emailType === 'referral_request') {
      subject = `Connecting regarding ${job.company} — ${cleanJobTitle}`;
      body = `Hi ${recipientGreeting},\n\nI hope this note finds you well. I came across your profile and noticed your engineering work at ${job.company}.\n\nI am planning to apply for the ${cleanJobTitle} position and would appreciate learning about your experience with the engineering culture and team dynamics at ${job.company}.\n\nIf you have 10 minutes for a brief coffee chat, I would be very grateful for your insights.\n\n${signature}`;
    } else if (emailType === 'application_followup') {
      subject = `Following up: Application for ${cleanJobTitle} — ${applicantName}`;
      body = `Hi ${recipientGreeting},\n\nI hope you are having a productive week. I recently submitted my application for the ${cleanJobTitle} position at ${job.company} and wanted to briefly reiterate my enthusiasm for the role.\n\nSince applying, I have continued developing my work in ${topSkills}. Please let me know if any additional details or work samples would be helpful as you review candidates.\n\nThank you again for your consideration!\n\n${signature}`;
    } else {
      // interview_thankyou
      subject = `Thank you — ${cleanJobTitle} interview with ${job.company}`;
      body = `Dear ${recipientGreeting},\n\nThank you very much for taking the time to speak with me today about the ${cleanJobTitle} opportunity. I enjoyed learning more about ${job.company}'s approach to engineering challenges and the team's upcoming milestones.\n\nOur conversation reinforced my excitement about the position, particularly regarding how my background in ${topSkills} can contribute to your goals. Please do not hesitate to reach out if you need any follow-up information.\n\n${signature}`;
    }

    const bodyHtml = body.replace(/\n/g, '<br/>');

    return {
      id: `draft-email-${uuidv4().slice(0, 8)}`,
      user_id: resume.user_id,
      job_id: job.id,
      contact_id: contact?.id,
      email_type: emailType,
      recipient_name: recipientName,
      recipient_email: targetEmail,
      delivery_target_email: testInbox,
      subject,
      body,
      body_html: bodyHtml,
      evidence_used: evidenceUsed,
      tailored_resume_id: tailoredResumeId,
      status: 'GENERATED',
      created_in_gmail: false,
      signature,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
