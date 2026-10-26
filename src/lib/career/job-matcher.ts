import { 
  JobListing, 
  ResumeRecord, 
  JobPreferences, 
  JobMatchResult, 
  ResumeProfileType 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class JobMatchingEngine {
  /**
   * Evaluates match score and rationale between a JobListing and a specific ResumeRecord
   */
  static evaluateResumeMatch(
    job: JobListing, 
    resume: ResumeRecord, 
    preferences?: JobPreferences
  ): {
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
    reasons: string[];
    projectScore: number;
    expCompat: string;
    locCompat: string;
  } {
    const reasons: string[] = [];
    const jobSkills = job.required_skills.map(s => s.toLowerCase());
    const resumeSkills = resume.structured_data.skills.map(s => s.toLowerCase());

    // 1. Skill Overlap (40% weight)
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const req of job.required_skills) {
      const lowerReq = req.toLowerCase();
      const hasSkill = resumeSkills.some(rs => rs.includes(lowerReq) || lowerReq.includes(rs));
      if (hasSkill) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }

    const skillScore = job.required_skills.length > 0 
      ? Math.round((matchingSkills.length / job.required_skills.length) * 100) 
      : 80;

    reasons.push(
      `Skill Alignment: Matched ${matchingSkills.length} of ${job.required_skills.length} listed skills (${skillScore}% overlap).`
    );

    // 2. Project Relevance (30% weight)
    let projectMatches = 0;
    const allProjText = resume.structured_data.projects
      .map(p => `${p.title} ${p.description} ${p.bullet_points.join(' ')} ${p.technologies.join(' ')}`)
      .join(' ')
      .toLowerCase();

    for (const req of job.required_skills) {
      if (allProjText.includes(req.toLowerCase())) {
        projectMatches++;
      }
    }

    const projectScore = job.required_skills.length > 0
      ? Math.min(100, Math.round((projectMatches / Math.max(1, job.required_skills.length * 0.6)) * 100))
      : 85;

    reasons.push(
      `Project Grounding: Demonstrates relevant practical application across ${resume.structured_data.projects.length} documented projects (${projectScore}/100 relevance).`
    );

    // 3. Experience & Role Level Compatibility (15% weight)
    let expScore = 80;
    let expCompat = 'Aligned (Student / Fresher / Intern tier)';
    const expText = resume.structured_data.experience.map(e => `${e.role} ${e.company} ${e.description_bullets.join(' ')}`).join(' ').toLowerCase();

    if (job.experience_level?.toLowerCase().includes('intern') || job.title.toLowerCase().includes('intern')) {
      if (resume.structured_data.experience.some(e => e.role.toLowerCase().includes('intern') || e.role.toLowerCase().includes('assistant'))) {
        expScore = 95;
        expCompat = 'Strong (Proven prior internship and campus research experience)';
      } else {
        expScore = 85;
        expCompat = 'Eligible (Enrolled senior/student ready for internship)';
      }
    } else {
      expScore = 88;
      expCompat = 'Eligible (Entry level / New graduate position)';
    }

    reasons.push(`Experience Level: ${expCompat}.`);

    // 4. Location & Remote Compatibility (15% weight)
    let locScore = 85;
    let locCompat = 'Compatible';
    const jobLoc = (job.location || '').toLowerCase();

    if (preferences) {
      const isRemote = jobLoc.includes('remote') || preferences.remote_preference === 'remote_only';
      const locMatch = preferences.locations.some(l => jobLoc.includes(l.toLowerCase()));

      if (isRemote || locMatch || preferences.willing_to_relocate) {
        locScore = 95;
        locCompat = isRemote ? 'Remote Friendly' : `Matches target location (${job.location})`;
      } else {
        locScore = 65;
        locCompat = 'Relocation or verification needed';
      }
    }

    reasons.push(`Location Match: ${locCompat}.`);

    // Final Composite Score (0-100)
    const compositeScore = Math.min(
      99,
      Math.max(
        15,
        Math.round(skillScore * 0.40 + projectScore * 0.30 + expScore * 0.15 + locScore * 0.15)
      )
    );

    return {
      score: compositeScore,
      matchingSkills,
      missingSkills,
      reasons,
      projectScore,
      expCompat,
      locCompat
    };
  }

  /**
   * Automatic Resume Selection (Phase 7):
   * Analyzes all saved resumes and automatically selects the most relevant resume profile with transparent rationale
   */
  static selectBestResumeForJob(
    job: JobListing, 
    resumes: ResumeRecord[], 
    preferences?: JobPreferences
  ): JobMatchResult {
    if (!resumes || resumes.length === 0) {
      throw new Error('No resumes found in Resume Library to match against.');
    }

    let bestResume = resumes[0];
    let bestEval = this.evaluateResumeMatch(job, bestResume, preferences);
    let bestScore = bestEval.score;

    for (let i = 1; i < resumes.length; i++) {
      const r = resumes[i];
      const curEval = this.evaluateResumeMatch(job, r, preferences);

      // Profile type boost based on job title hints
      let typeBoost = 0;
      const lowerTitle = job.title.toLowerCase();
      const lowerDesc = job.description.toLowerCase();

      if (r.profile_type === 'ai_ml' && (lowerTitle.includes('machine learning') || lowerTitle.includes('ai') || lowerTitle.includes('ml ') || lowerDesc.includes('pytorch') || lowerDesc.includes('transformers'))) {
        typeBoost += 12;
      } else if (r.profile_type === 'business_gtm' && (lowerTitle.includes('product') || lowerTitle.includes('apm') || lowerTitle.includes('growth') || lowerTitle.includes('gtm') || lowerTitle.includes('marketing'))) {
        typeBoost += 12;
      } else if (r.profile_type === 'technical' && (lowerTitle.includes('software') || lowerTitle.includes('swe') || lowerTitle.includes('full stack') || lowerTitle.includes('systems') || lowerTitle.includes('backend') || lowerTitle.includes('frontend'))) {
        typeBoost += 8;
      }

      const totalAdjusted = curEval.score + typeBoost;
      if (totalAdjusted > bestScore) {
        bestScore = totalAdjusted;
        bestResume = r;
        bestEval = curEval;
      }
    }

    // Cap score at 99
    const finalScore = Math.min(98, Math.max(20, bestScore));

    const rationale = `Automatically recommended the "${bestResume.title}" profile. The job title and description ("${job.title}" at ${job.company}) strongly align with your ${bestResume.profile_type.toUpperCase()} portfolio, matching ${bestEval.matchingSkills.length} key competencies (${bestEval.matchingSkills.join(', ') || 'Core CS fundamentals'}).`;

    return {
      id: `match-${uuidv4().slice(0, 8)}`,
      job_id: job.id,
      user_id: bestResume.user_id,
      recommended_resume_id: bestResume.id,
      recommended_profile_type: bestResume.profile_type,
      match_score: finalScore,
      matching_skills: bestEval.matchingSkills,
      missing_skills: bestEval.missingSkills,
      score_reasons: [
        ...bestEval.reasons,
        'Transparency Note: Match score reflects factual profile relevance based on listed qualifications, not hiring success prediction.'
      ],
      project_overlap_score: bestEval.projectScore,
      experience_compatibility: bestEval.expCompat,
      location_compatibility: bestEval.locCompat,
      selection_rationale: rationale,
      created_at: new Date().toISOString()
    };
  }
}
