import { Company, Contact, ICPConfig, Provenance } from '@/types';
import { SearchProviderInterface, CompanySearchParams } from './types';

export class LiveSearchProvider implements SearchProviderInterface {
  name = 'Live Intelligence Provider';
  isLive = true;

  private apiKey: string;
  private providerType: string;

  constructor(apiKey?: string, providerType: string = 'apollo') {
    this.apiKey = apiKey || process.env.SEARCH_API_KEY || '';
    this.providerType = providerType;
  }

  async searchCompanies(params: CompanySearchParams, icp: ICPConfig): Promise<{ companies: Company[]; provenance: Provenance }> {
    if (!this.apiKey) {
      throw new Error('Live search API key is not configured. Please add SEARCH_API_KEY in Settings or .env, or use Curated Mode.');
    }

    try {
      const endpoint = process.env.SEARCH_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions';
      
      const prompt = `Find 3 real US Quick Service Restaurant (QSR) or Fast Casual restaurant franchisee groups matching:
Categories: ${icp.restaurantCategories.join(', ')}
Location count: between ${params.minLocations || icp.companySizeMinLocations} and ${params.maxLocations || icp.companySizeMaxLocations} locations.
Filter query: ${params.query || 'active expanding franchise groups'}.
CRITICAL RULE: Every company MUST have at least one valid, verifiable public source URL (e.g. from company leadership page or news). Do not fabricate locations or URLs.
Return strictly a JSON array of objects with keys: name, website, headquarters, estimated_locations, restaurant_category, buying_signals (array of strings), source_urls (array of strings).`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!res.ok) {
        throw new Error(`Live provider returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content || '[]';
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const parsed: any[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      // Reject results that lack genuine source URLs or valid location counts
      const validItems = parsed.filter(item => 
        item.name && 
        Array.isArray(item.source_urls) && 
        item.source_urls.length > 0 &&
        item.source_urls[0].startsWith('http') &&
        typeof item.estimated_locations === 'number' &&
        item.estimated_locations > 0
      );

      const companies: Company[] = validItems.map((item, idx) => ({
        id: `comp-live-${Date.now()}-${idx}`,
        name: item.name,
        website: item.website || item.source_urls[0],
        industry: 'Quick-service restaurants',
        headquarters: item.headquarters || 'United States',
        estimated_locations: item.estimated_locations,
        company_size: `${item.estimated_locations} locations`,
        restaurant_category: item.restaurant_category || 'fast-casual',
        buying_signals: Array.isArray(item.buying_signals) && item.buying_signals.length > 0 ? item.buying_signals : ['restaurant expansion'],
        source_urls: item.source_urls,
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live' as Provenance,
        created_at: new Date().toISOString()
      }));

      return {
        companies,
        provenance: 'live'
      };
    } catch (err: any) {
      console.error('Live company search failed:', err);
      throw new Error(`Live Company Search failed: ${err.message || 'Unknown network error'}`);
    }
  }

  async searchContacts(companyId: string, companyName: string, targetRoles: string[]): Promise<{ contacts: Contact[]; provenance: Provenance }> {
    if (!this.apiKey) {
      throw new Error('Live search API key is not configured.');
    }

    try {
      const endpoint = process.env.SEARCH_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions';
      const prompt = `Identify real corporate operations executives for ${companyName} matching roles: ${targetRoles.join(', ')}.
CRITICAL RULE: Every person MUST have a working public source_url (leadership page, LinkedIn, or news announcement). Do not fabricate names, roles, or URLs.
Return strictly a JSON array of objects with keys: full_name, job_title, professional_profile_url, source_url.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!res.ok) {
        throw new Error(`Live provider returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content || '[]';
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const parsed: any[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      // Reject results lacking source_url
      const validContacts = parsed.filter(item => 
        item.full_name && 
        item.job_title && 
        item.source_url && 
        item.source_url.startsWith('http')
      );

      const contacts: Contact[] = validContacts.map((item, idx) => ({
        id: `lead-live-${Date.now()}-${idx}`,
        company_id: companyId,
        company_name: companyName,
        full_name: item.full_name,
        job_title: item.job_title,
        professional_profile_url: item.professional_profile_url || undefined,
        work_email: 'unavailable', // Never guess prospect email
        email_verification_status: 'unavailable',
        source_url: item.source_url,
        retrieval_timestamp: new Date().toISOString(),
        provenance: 'live' as Provenance,
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      }));

      return {
        contacts,
        provenance: 'live'
      };
    } catch (err: any) {
      console.error('Live lead search failed:', err);
      throw new Error(`Live Lead Search failed: ${err.message || 'Unknown error'}`);
    }
  }
}
