import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { OutreachGeneratorService } from '@/lib/career/outreach-generator';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || undefined;

  const drafts = Store.getPersonalizedDrafts(jobId);
  return NextResponse.json(drafts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      jobId, 
      contactId, 
      resumeId, 
      emailType = 'recruiter_outreach', 
      tone = 'professional',
      tailoredResumeId 
    } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const job = Store.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: `Job ${jobId} not found.` }, { status: 404 });
    }

    const resumes = Store.getResumes();
    let resume = resumes.find(r => r.id === resumeId);
    if (!resume) {
      const match = Store.getJobMatchByJobId(jobId);
      resume = resumes.find(r => r.id === match?.recommended_resume_id) || resumes[0];
    }

    if (!resume) {
      return NextResponse.json({ error: 'No resume available.' }, { status: 400 });
    }

    const contacts = Store.getRecruiterContacts(jobId);
    const contact = contactId ? contacts.find(c => c.id === contactId) : contacts[0];
    const userProfile = Store.getUserProfile();

    const draft = OutreachGeneratorService.generateEmailDraft({
      job,
      contact,
      resume,
      userProfile,
      emailType,
      tone,
      tailoredResumeId
    });

    Store.savePersonalizedDraft(draft);
    return NextResponse.json(draft);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, subject, body: bodyText, signature } = body;

    if (!id) {
      return NextResponse.json({ error: 'Draft ID is required.' }, { status: 400 });
    }

    const draft = Store.getPersonalizedDraftById(id);
    if (!draft) {
      return NextResponse.json({ error: `Draft ${id} not found.` }, { status: 404 });
    }

    if (subject !== undefined) draft.subject = subject;
    if (bodyText !== undefined) {
      draft.body = bodyText;
      draft.body_html = bodyText.replace(/\n/g, '<br/>');
    }
    if (signature !== undefined) draft.signature = signature;
    draft.status = 'USER_EDITED';
    draft.updated_at = new Date().toISOString();

    Store.savePersonalizedDraft(draft);
    return NextResponse.json(draft);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
