import { Company, Contact, ICPConfig, Provenance } from '@/types';
import { SearchProviderInterface, CompanySearchParams } from './types';

export class ApolloMissingApiKeyError extends Error {
  constructor() {
    super('Apollo API key is not configured. Live search API key is not configured. Please add APOLLO_API_KEY to your .env.local file or configure it in Settings.');
    this.name = 'ApolloMissingApiKeyError';
  }
}

export class ApolloAuthenticationError extends Error {
  constructor(message = 'Apollo authentication failed. Your API key may be invalid or expired.') {
    super(message);
    this.name = 'ApolloAuthenticationError';
  }
}

export class ApolloRateLimitError extends Error {
  constructor(message = 'Apollo rate limit exceeded (HTTP 429). Please wait before making more requests.') {
    super(message);
    this.name = 'ApolloRateLimitError';
  }
}

export class ApolloCreditExhaustedError extends Error {
  constructor(message = 'Apollo API credit limit reached or endpoint not authorized for your plan.') {
    super(message);
    this.name = 'ApolloCreditExhaustedError';
  }
}

export class ApolloApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApolloApiError';
    this.status = status;
  }
}

export class ApolloSearchProvider implements SearchProviderInterface {
  name = 'Apollo.io Live Provider';
  isLive = true;

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.APOLLO_API_KEY || process.env.SEARCH_API_KEY || '';
    this.baseUrl = (baseUrl || process.env.APOLLO_API_BASE_URL || 'https://api.apollo.io/api/v1').replace(/\/+$/, '');
  }

  getApiKey(): string {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async makeRequest(endpoint: string, body: Record<string, any>): Promise<any> {
    if (!this.apiKey) {
      throw new ApolloMissingApiKeyError();
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        let errorDetail = '';
        try {
          const errJson = await res.json();
          errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch {
          errorDetail = res.statusText;
        }

        if (res.status === 401) {
          throw new ApolloAuthenticationError(`Apollo authentication failed (HTTP 401): ${errorDetail}`);
        }
        if (res.status === 429) {
          throw new ApolloRateLimitError(`Apollo rate limit exceeded (HTTP 429): ${errorDetail}`);
        }
        if (res.status === 402 || res.status === 403) {
          throw new ApolloCreditExhaustedError(`Apollo plan limitation or exhausted credits (HTTP ${res.status}): ${errorDetail}`);
        }

        throw new ApolloApiError(`Apollo API returned HTTP ${res.status}: ${errorDetail}`, res.status);
      }

      return await res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new ApolloApiError('Apollo API request timed out after 12 seconds.', 408);
      }
      if (err instanceof ApolloMissingApiKeyError ||
          err instanceof ApolloAuthenticationError ||
          err instanceof ApolloRateLimitError ||
          err instanceof ApolloCreditExhaustedError ||
          err instanceof ApolloApiError) {
        throw err;
      }
      throw new ApolloApiError(`Network failure communicating with Apollo: ${err.message}`, 500);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Discovers real US Quick Service Restaurant (QSR) companies via Apollo API.
   * Target ICP: US QSR and Fast-Casual restaurant chains.
   */
  async searchCompanies(
    params: CompanySearchParams, 
    icp: ICPConfig
  ): Promise<{ companies: Company[]; provenance: Provenance; creditInfo?: any }> {
    const locations = params.location ? [params.location] : ['United States'];
    
    // Employee ranges for headcount (explicitly distinct from restaurant locations)
    let employeeRanges: string[] = [];
    if (params.minEmployees !== undefined || params.maxEmployees !== undefined) {
      const min = params.minEmployees || 20;
      const max = params.maxEmployees || 500;
      employeeRanges = [`${min},${max}`];
    }

    const payload: Record<string, any> = {
      page: 1,
      per_page: 10,
      organization_locations: locations
    };

    if (params.query && params.query.trim()) {
      payload.q_organization_name = params.query.trim();
    } else if (params.category && params.category !== 'all') {
      payload.q_organization_name = params.category;
    } else {
      payload.q_organization_name = 'restaurant';
    }

    if (employeeRanges.length > 0) {
      payload.organization_num_employees_ranges = employeeRanges;
    }

    const data = await this.makeRequest('/mixed_companies/search', payload);

    const orgs: any[] = data.organizations || data.accounts || [];

    const companies: Company[] = orgs.map((org: any, idx: number) => {
      const rawDomain = org.primary_domain || org.website_url || '';
      const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
      const website = domain ? `https://${domain}` : (org.website_url || '');

      const hqParts = [org.city, org.state, org.country || 'United States'].filter(Boolean);
      const headquarters = hqParts.length > 0 ? hqParts.join(', ') : (org.raw_address || 'United States');

      // Headcount is NOT restaurant locations. We track employee_count explicitly,
      // and mark location_count_status as 'unknown' unless independently verified.
      const employeeCount = typeof org.estimated_num_employees === 'number' 
        ? org.estimated_num_employees 
        : undefined;

      const sourceUrls: string[] = [];
      if (website) sourceUrls.push(website);
      if (org.linkedin_url) sourceUrls.push(org.linkedin_url);
      if (sourceUrls.length === 0) sourceUrls.push(`https://app.apollo.io/#/organizations/${org.id}`);

      const buyingSignals = [
        'Multi-unit operational management',
        org.industry ? `${org.industry} digital initiative` : 'Restaurant guest experience transformation'
      ];

      return {
        id: org.id ? `comp-apollo-${org.id}` : `comp-live-${Date.now()}-${idx}`,
        name: org.name || 'Unknown Restaurant Group',
        website,
        industry: org.industry || 'Restaurants & Food Service',
        headquarters,
        estimated_locations: 0, // Location count is unknown from Apollo employee count; must be verified
        location_count_status: 'unknown',
        employee_count: employeeCount,
        company_size: employeeCount ? `${employeeCount} employees` : undefined,
        description: org.short_description || org.seo_description || `${org.name} operations profile in Apollo`,
        provider_company_id: org.id || undefined,
        source_provider: 'apollo',
        restaurant_category: params.category || 'Quick-Service & Fast-Casual',
        buying_signals: buyingSignals,
        source_urls: sourceUrls,
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live',
        created_at: new Date().toISOString()
      };
    });

    return {
      companies,
      provenance: 'live',
      creditInfo: {
        totalFound: data.pagination?.total_entries || companies.length,
        notice: 'Apollo B2B Intelligence Live'
      }
    };
  }

  /**
   * Discovers decision-makers (COO, VP Ops, CX, Technology) associated with a company.
   * Validates company match and marks email verification status.
   */
  async searchContacts(
    companyId: string, 
    companyName: string, 
    targetRoles: string[]
  ): Promise<{ contacts: Contact[]; provenance: Provenance; creditInfo?: any }> {
    // Determine raw provider ID if formatted like "comp-apollo-..."
    const cleanProviderOrgId = companyId.startsWith('comp-apollo-')
      ? companyId.replace('comp-apollo-', '')
      : (companyId.length > 10 && !companyId.includes('-') ? companyId : undefined);

    const roles = (targetRoles && targetRoles.length > 0)
      ? targetRoles
      : [
          'Chief Operating Officer',
          'VP of Operations',
          'Director of Operations',
          'Chief Digital Officer',
          'VP of Technology',
          'Head of Customer Experience',
          'Head of Innovation'
        ];

    const payload: Record<string, any> = {
      q_organization_name: companyName,
      person_titles: roles,
      page: 1,
      per_page: 10
    };

    if (cleanProviderOrgId) {
      payload.organization_ids = [cleanProviderOrgId];
    }

    let data: any;
    try {
      // First try the modern standard endpoint
      data = await this.makeRequest('/mixed_people/api_search', payload);
    } catch (err: any) {
      // If 404 or unsupported on older sandbox, attempt fallback to mixed_people/search
      if (err instanceof ApolloApiError && (err.status === 404 || err.status === 422)) {
        data = await this.makeRequest('/mixed_people/search', payload);
      } else {
        throw err;
      }
    }

    const people: any[] = data.people || data.contacts || [];

    const contacts: Contact[] = [];

    for (let idx = 0; idx < people.length; idx++) {
      const p = people[idx];
      const fullName = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown Executive';

      // Confirm company association
      const reportedOrgName = p.organization?.name || p.organization_name || '';
      const orgMatches = reportedOrgName.length > 0 && (
        reportedOrgName.toLowerCase().includes(companyName.toLowerCase()) ||
        companyName.toLowerCase().includes(reportedOrgName.toLowerCase()) ||
        (cleanProviderOrgId && p.organization_id === cleanProviderOrgId)
      );

      const isCompanyVerified = Boolean(orgMatches || cleanProviderOrgId);
      const companyVerificationDetail = isCompanyVerified
        ? `Confirmed association with ${companyName} via Apollo organization ID ${p.organization_id || cleanProviderOrgId || ''}`
        : `Reported company: ${reportedOrgName || 'Unconfirmed'}`;

      // Email status
      let emailStatus: 'verified' | 'unverified' | 'unavailable' = 'unavailable';
      if (p.email_status === 'verified') {
        emailStatus = 'verified';
      } else if (p.email_status === 'extrapolated' || p.email_status === 'unverified') {
        emailStatus = 'unverified';
      }

      const workEmail = p.email && !p.email.includes('*') ? p.email : 'unavailable';

      const sourceUrl = p.linkedin_url || (p.organization?.primary_domain ? `https://${p.organization.primary_domain}` : `https://app.apollo.io/#/people/${p.id}`);

      contacts.push({
        id: p.id ? `lead-apollo-${p.id}` : `lead-live-${Date.now()}-${idx}`,
        company_id: companyId,
        company_name: companyName,
        full_name: fullName,
        job_title: p.title || 'Operations Executive',
        professional_profile_url: p.linkedin_url || undefined,
        work_email: workEmail,
        email_verification_status: emailStatus,
        provider_person_id: p.id || undefined,
        source_provider: 'apollo',
        is_company_verified: isCompanyVerified,
        company_verification_detail: companyVerificationDetail,
        source_url: sourceUrl,
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live',
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      });
    }

    return {
      contacts,
      provenance: 'live',
      creditInfo: {
        totalFound: data.pagination?.total_entries || contacts.length,
        notice: 'Apollo Decision-Maker Discovery Live'
      }
    };
  }

  /**
   * Enriches an organization via Apollo organizations/enrich endpoint if domain is available.
   */
  async enrichOrganization(domain: string): Promise<any> {
    if (!domain) return null;
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    try {
      const data = await this.makeRequest('/organizations/enrich', { domain: cleanDomain });
      return data.organization || data;
    } catch (err) {
      console.warn(`Apollo organization enrichment failed for ${domain}:`, err);
      return null;
    }
  }
}
