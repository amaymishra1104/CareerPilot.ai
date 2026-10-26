import { JobListing, Provenance } from '@/types';
import { DEMO_JOB_LISTINGS } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export interface JobSearchFilters {
  query?: string;
  location?: string;
  category?: string;
  employmentType?: string;
  provider?: 'all' | 'remotive' | 'arbeitnow' | 'jobicy' | 'demo';
}

export interface JobDiscoveryResponse {
  jobs: JobListing[];
  provenance: Provenance;
  provider: string;
  totalFound: number;
  error?: string;
  warning?: string;
}

export class JobDiscoveryService {
  /**
   * Normalizes a text string for fuzzy deduplication
   */
  static normalizeString(str: string): string {
    return (str || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Deduplicates job listings by normalized (title + company) and job_url
   */
  static deduplicateJobs(jobs: JobListing[]): JobListing[] {
    const seenSignatures = new Set<string>();
    const seenUrls = new Set<string>();
    const unique: JobListing[] = [];

    for (const job of jobs) {
      const titleNorm = this.normalizeString(job.title);
      const companyNorm = this.normalizeString(job.company);
      const signature = `${titleNorm}::${companyNorm}`;
      const cleanUrl = (job.job_url || '').toLowerCase().trim();

      if (cleanUrl && seenUrls.has(cleanUrl)) {
        continue;
      }
      if (seenSignatures.has(signature)) {
        continue;
      }

      seenSignatures.add(signature);
      if (cleanUrl) seenUrls.add(cleanUrl);
      unique.push(job);
    }

    return unique;
  }

  /**
   * Extracts tech skills from a job description
   */
  static extractSkillsFromText(text: string): string[] {
    const lower = text.toLowerCase();
    const skillsDict = [
      'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'C++', 'Java', 'SQL',
      'React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux', 'Vitest',
      'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Supabase',
      'PyTorch', 'TensorFlow', 'Hugging Face Transformers', 'LangChain', 'LlamaIndex',
      'FastAPI', 'RAG', 'Vector Databases', 'Scikit-Learn', 'CUDA',
      'Product Strategy', 'User Research', 'PRD Authoring', 'Mixpanel', 'Figma',
      'A/B Testing', 'Git', 'CI/CD', 'REST APIs', 'GraphQL'
    ];

    const matched = new Set<string>();
    for (const s of skillsDict) {
      const reg = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(lower)) {
        matched.add(s);
      }
    }

    return Array.from(matched);
  }

  /**
   * Discovers jobs from the official Remotive API
   */
  static async fetchRemotiveJobs(category = 'software-dev', query?: string): Promise<JobDiscoveryResponse> {
    try {
      const url = `https://remotive.com/api/remote-jobs?category=${encodeURIComponent(category)}&limit=25`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Remotive API responded with HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];

      let filtered = rawJobs;
      if (query && query.trim()) {
        const qNorm = query.toLowerCase().trim();
        filtered = rawJobs.filter((j: any) => 
          (j.title || '').toLowerCase().includes(qNorm) || 
          (j.company_name || '').toLowerCase().includes(qNorm) ||
          (j.description || '').toLowerCase().includes(qNorm)
        );
      }

      const listings: JobListing[] = filtered.map((item: any) => {
        const plainDesc = (item.description || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        const extractedSkills = Array.isArray(item.tags) && item.tags.length > 0 
          ? item.tags.map((t: string) => t.trim()) 
          : this.extractSkillsFromText(plainDesc);

        return {
          id: `remotive-${item.id || uuidv4().slice(0, 8)}`,
          title: item.title || 'Software Engineering Opening',
          company: item.company_name || 'Tech Company',
          description: plainDesc.slice(0, 1500),
          location: item.candidate_required_location || 'Remote (Global)',
          employment_type: item.job_type || 'Full-time',
          experience_level: 'Entry / Mid',
          required_skills: extractedSkills.slice(0, 8),
          salary_range: item.salary || undefined,
          job_url: item.url || 'https://remotive.com',
          publication_date: item.publication_date ? item.publication_date.split('T')[0] : new Date().toISOString().split('T')[0],
          data_source: 'Remotive Live Job Feed API',
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'live',
          is_expired: false,
          created_at: new Date().toISOString()
        };
      });

      return {
        jobs: this.deduplicateJobs(listings),
        provenance: 'live',
        provider: 'Remotive API',
        totalFound: listings.length
      };
    } catch (err: any) {
      return {
        jobs: [],
        provenance: 'live',
        provider: 'Remotive API',
        totalFound: 0,
        error: `Remotive API Error: ${err.message}. Live external provider could not be reached.`
      };
    }
  }

  /**
   * Discovers jobs from the official Arbeitnow API
   */
  static async fetchArbeitnowJobs(query?: string): Promise<JobDiscoveryResponse> {
    try {
      const url = 'https://www.arbeitnow.com/api/job-board-api';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Arbeitnow API responded with HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawJobs = Array.isArray(data?.data) ? data.data : [];

      let filtered = rawJobs;
      if (query && query.trim()) {
        const qNorm = query.toLowerCase().trim();
        filtered = rawJobs.filter((j: any) => 
          (j.title || '').toLowerCase().includes(qNorm) || 
          (j.company_name || '').toLowerCase().includes(qNorm) ||
          (j.description || '').toLowerCase().includes(qNorm)
        );
      }

      const listings: JobListing[] = filtered.map((item: any) => {
        const plainDesc = (item.description || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        const extractedSkills = Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags
          : this.extractSkillsFromText(plainDesc);

        return {
          id: `arbeitnow-${item.slug || uuidv4().slice(0, 8)}`,
          title: item.title || 'Developer Position',
          company: item.company_name || 'Employer',
          description: plainDesc.slice(0, 1500),
          location: item.location || (item.remote ? 'Remote' : 'Europe / Global'),
          employment_type: item.job_types?.join(', ') || 'Full-time',
          experience_level: 'Fresher / Professional',
          required_skills: extractedSkills.slice(0, 8),
          job_url: item.url || 'https://www.arbeitnow.com',
          publication_date: item.created_at ? new Date(item.created_at * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          data_source: 'Arbeitnow Global Board API',
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'live',
          is_expired: false,
          created_at: new Date().toISOString()
        };
      });

      return {
        jobs: this.deduplicateJobs(listings),
        provenance: 'live',
        provider: 'Arbeitnow API',
        totalFound: listings.length
      };
    } catch (err: any) {
      return {
        jobs: [],
        provenance: 'live',
        provider: 'Arbeitnow API',
        totalFound: 0,
        error: `Arbeitnow API Error: ${err.message}. Live external provider could not be reached.`
      };
    }
  }

  /**
   * Imports jobs from user-pasted CSV text
   * Headers: Title, Company, Location, Description, Skills, URL, EmploymentType
   */
  static parseJobsFromCsv(csvText: string): { jobs: JobListing[]; errors: string[] } {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { jobs: [], errors: ['CSV must have a header row and at least one job data row.'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('role'));
    const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('employer'));
    const locIdx = headers.findIndex(h => h.includes('location'));
    const descIdx = headers.findIndex(h => h.includes('description') || h.includes('summary'));
    const skillsIdx = headers.findIndex(h => h.includes('skill') || h.includes('tag'));
    const urlIdx = headers.findIndex(h => h.includes('url') || h.includes('link'));
    const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('employment'));

    if (titleIdx === -1 || companyIdx === -1) {
      return { jobs: [], errors: ['CSV must contain at least "Title" and "Company" columns.'] };
    }

    const jobs: JobListing[] = [];
    const errors: string[] = [];

    const parseCsvRow = (text: string): string[] => {
      const res: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let j = 0; j < text.length; j++) {
        const c = text[j];
        if (c === '"') {
          if (inQuotes && text[j + 1] === '"') {
            cur += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          res.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      res.push(cur.trim());
      return res;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cleanCols = parseCsvRow(line);

      const title = cleanCols[titleIdx];
      const company = cleanCols[companyIdx];
      if (!title || !company) {
        errors.push(`Row ${i + 1} skipped: Missing title or company.`);
        continue;
      }

      const location = locIdx !== -1 ? cleanCols[locIdx] : 'Remote / Unspecified';
      const description = descIdx !== -1 ? cleanCols[descIdx] : `${title} opening at ${company}.`;
      const skillsStr = skillsIdx !== -1 ? cleanCols[skillsIdx] : '';
      const skills = skillsStr ? skillsStr.split(';').map(s => s.trim()).filter(Boolean) : this.extractSkillsFromText(description);
      const jobUrl = urlIdx !== -1 ? cleanCols[urlIdx] : `https://${this.normalizeString(company).replace(/\s+/g, '')}.com/careers`;
      const employmentType = typeIdx !== -1 ? cleanCols[typeIdx] : 'Full-time / Internship';

      jobs.push({
        id: `csv-${uuidv4().slice(0, 8)}`,
        title,
        company,
        description,
        location,
        employment_type: employmentType,
        experience_level: 'Fresher / Intern',
        required_skills: skills.length > 0 ? skills : ['TypeScript', 'Python'],
        job_url: jobUrl,
        publication_date: new Date().toISOString().split('T')[0],
        data_source: 'Manual CSV Import',
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'csv_imported',
        is_expired: false,
        created_at: new Date().toISOString()
      });
    }

    return { jobs: this.deduplicateJobs(jobs), errors };
  }

  /**
   * Imports a single job posting from direct text or URL entry
   */
  static parseSingleJobListing(params: {
    title: string;
    company: string;
    description: string;
    location?: string;
    job_url?: string;
    employment_type?: string;
    experience_level?: string;
    required_skills?: string[];
  }): JobListing {
    const description = params.description.trim();
    const skills = params.required_skills && params.required_skills.length > 0 
      ? params.required_skills 
      : this.extractSkillsFromText(description);

    return {
      id: `manual-${uuidv4().slice(0, 8)}`,
      title: params.title.trim(),
      company: params.company.trim(),
      description,
      location: params.location?.trim() || 'Remote',
      employment_type: params.employment_type?.trim() || 'Internship / Fresher',
      experience_level: params.experience_level?.trim() || 'Internship',
      required_skills: skills.length > 0 ? skills : ['General Engineering'],
      job_url: params.job_url?.trim() || `https://${params.company.toLowerCase().replace(/\s+/g, '')}.com/careers`,
      publication_date: new Date().toISOString().split('T')[0],
      data_source: 'Direct User Import',
      retrieval_timestamp: new Date().toISOString(),
      provenance: 'manually_sourced',
      is_expired: false,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Returns curated demo job listings clearly marked with provenance: 'demo'
   */
  static getDemoJobListings(query?: string): JobDiscoveryResponse {
    let list = [...DEMO_JOB_LISTINGS];
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }

    return {
      jobs: list,
      provenance: 'demo',
      provider: 'Curated Starter Dataset',
      totalFound: list.length
    };
  }
}
