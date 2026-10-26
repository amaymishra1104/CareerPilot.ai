import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ApplicationTrackerService } from '@/lib/career/application-tracker';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || undefined;

  const applications = Store.getJobApplications(userId);
  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId = 'user-amay-01', 
      jobId, 
      status, 
      contactId, 
      contactName, 
      contactEmail,
      tailoredResumeId, 
      matchScore, 
      notes 
    } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const job = Store.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: `Job ${jobId} not found.` }, { status: 404 });
    }

    const result = ApplicationTrackerService.trackApplication({
      userId,
      job,
      status,
      contactId,
      contactName,
      contactEmail,
      tailoredResumeId,
      matchScore,
      notes
    });

    return NextResponse.json(result, { status: result.isNew ? 201 : 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, followUpDays } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Application ID and status are required.' }, { status: 400 });
    }

    const updated = ApplicationTrackerService.updateStatus(id, status, notes, followUpDays);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
