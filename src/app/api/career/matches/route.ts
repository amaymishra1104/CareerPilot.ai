import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { JobMatchingEngine } from '@/lib/career/job-matcher';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const match = Store.getJobMatchByJobId(jobId);
    return NextResponse.json(match || null);
  }

  const allMatches = Store.getJobMatches();
  return NextResponse.json(allMatches);
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
      return NextResponse.json({ error: `Job with ID ${jobId} not found.` }, { status: 404 });
    }

    const resumes = Store.getResumes();
    const prefs = Store.getJobPreferences();

    if (resumes.length === 0) {
      return NextResponse.json({ error: 'No resumes available in Resume Library.' }, { status: 400 });
    }

    let matchResult;
    if (resumeId) {
      // Evaluate against specific resume
      const targetResume = resumes.find(r => r.id === resumeId);
      if (!targetResume) {
        return NextResponse.json({ error: `Resume ${resumeId} not found.` }, { status: 404 });
      }
      const evalRes = JobMatchingEngine.evaluateResumeMatch(job, targetResume, prefs);
      matchResult = {
        id: `match-${job.id}-${targetResume.id}`,
        job_id: job.id,
        user_id: targetResume.user_id,
        recommended_resume_id: targetResume.id,
        recommended_profile_type: targetResume.profile_type,
        match_score: evalRes.score,
        matching_skills: evalRes.matchingSkills,
        missing_skills: evalRes.missingSkills,
        score_reasons: evalRes.reasons,
        project_overlap_score: evalRes.projectScore,
        experience_compatibility: evalRes.expCompat,
        location_compatibility: evalRes.locCompat,
        selection_rationale: `Evaluated against "${targetResume.title}". Matched ${evalRes.matchingSkills.length} skills.`,
        created_at: new Date().toISOString()
      };
    } else {
      // Automatic resume selection
      matchResult = JobMatchingEngine.selectBestResumeForJob(job, resumes, prefs);
    }

    Store.saveJobMatch(matchResult);
    return NextResponse.json(matchResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
