import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { RecruiterDiscoveryService } from '@/lib/career/recruiter-discovery';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || undefined;

  const contacts = Store.getRecruiterContacts(jobId);
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const job = Store.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: `Job with ID ${jobId} not found.` }, { status: 404 });
    }

    const settings = Store.getSettings();
    const result = await RecruiterDiscoveryService.discoverContactsForJob(job, settings.apollo_api_key);

    for (const c of result.contacts) {
      Store.saveRecruiterContact(c);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
