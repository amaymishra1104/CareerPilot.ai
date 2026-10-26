import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { JobDiscoveryService } from '@/lib/career/job-discovery';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || undefined;
  const company = searchParams.get('company') || undefined;
  const location = searchParams.get('location') || undefined;

  const jobs = Store.getJobListings({ keyword, company, location });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Live provider search (Remotive / Arbeitnow / Demo)
    if (action === 'live_search') {
      const { provider = 'all', query = '', category = 'software-dev' } = body;
      let result;

      if (provider === 'remotive') {
        result = await JobDiscoveryService.fetchRemotiveJobs(category, query);
      } else if (provider === 'arbeitnow') {
        result = await JobDiscoveryService.fetchArbeitnowJobs(query);
      } else if (provider === 'demo') {
        result = JobDiscoveryService.getDemoJobListings(query);
      } else {
        // 'all': Try Remotive first, Arbeitnow if empty
        result = await JobDiscoveryService.fetchRemotiveJobs(category, query);
        if (result.jobs.length === 0) {
          result = await JobDiscoveryService.fetchArbeitnowJobs(query);
        }
      }

      if (result.jobs.length > 0) {
        Store.addJobListings(result.jobs);
      }

      return NextResponse.json(result);
    }

    // Action 2: CSV import
    if (action === 'import_csv') {
      const { csvText } = body;
      if (!csvText) {
        return NextResponse.json({ error: 'csvText is required.' }, { status: 400 });
      }

      const { jobs, errors } = JobDiscoveryService.parseJobsFromCsv(csvText);
      if (jobs.length > 0) {
        Store.addJobListings(jobs);
      }

      return NextResponse.json({
        success: true,
        jobsAdded: jobs.length,
        jobs,
        errors
      });
    }

    // Action 3: Manual single job creation / direct import
    if (action === 'create_single' || action === 'manual_import') {
      const { title, company, description, location, job_url, employment_type, experience_level, required_skills } = body;
      if (!title || !company || !description) {
        return NextResponse.json({ error: 'Title, company, and description are required.' }, { status: 400 });
      }

      const job = JobDiscoveryService.parseSingleJobListing({
        title,
        company,
        description,
        location,
        job_url,
        employment_type,
        experience_level,
        required_skills
      });

      Store.addJobListing(job);
      return NextResponse.json({ success: true, job }, { status: 201 });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
