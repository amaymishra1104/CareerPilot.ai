import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ResumeTailoringEngine } from '@/lib/career/resume-tailorer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || undefined;

  const tailoredList = Store.getTailoredResumes(jobId);
  return NextResponse.json(tailoredList);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, resumeId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const job = Store.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: `Job ${jobId} not found.` }, { status: 404 });
    }

    const resumes = Store.getResumes();
    let sourceResume = resumes.find(r => r.id === resumeId);

    if (!sourceResume) {
      // Find match recommendation if available
      const match = Store.getJobMatchByJobId(jobId);
      if (match) {
        sourceResume = resumes.find(r => r.id === match.recommended_resume_id);
      }
      sourceResume = sourceResume || resumes[0];
    }

    if (!sourceResume) {
      return NextResponse.json({ error: 'No source resume found in Resume Library.' }, { status: 400 });
    }

    const tailored = ResumeTailoringEngine.generateTailoredResume(job, sourceResume);
    Store.saveTailoredResume(tailored);

    return NextResponse.json(tailored);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, approve } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tailored resume ID is required.' }, { status: 400 });
    }

    const tailored = Store.getTailoredResumeById(id);
    if (!tailored) {
      return NextResponse.json({ error: `Tailored resume ${id} not found.` }, { status: 404 });
    }

    if (approve) {
      ResumeTailoringEngine.approveTailoredResume(tailored);
      Store.saveTailoredResume(tailored);
    }

    return NextResponse.json(tailored);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
