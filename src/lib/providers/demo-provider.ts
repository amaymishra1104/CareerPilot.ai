import { Company, Contact, ICPConfig, Provenance } from '@/types';
import { SearchProviderInterface, CompanySearchParams } from './types';
import { DEMO_COMPANIES, DEMO_CONTACTS } from '@/lib/seed';

export class DemoSearchProvider implements SearchProviderInterface {
  name = 'Demo Sandbox Provider (Mocked)';
  isLive = false;

  async searchCompanies(params: CompanySearchParams, icp: ICPConfig): Promise<{ companies: Company[]; provenance: Provenance }> {
    // Return sample companies matching filters
    let results = [...DEMO_COMPANIES];

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.restaurant_category.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q) ||
        c.buying_signals.some(s => s.toLowerCase().includes(q))
      );
    }

    if (params.category && params.category !== 'all') {
      results = results.filter(c => c.restaurant_category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params.minLocations !== undefined) {
      results = results.filter(c => c.estimated_locations >= params.minLocations!);
    }

    if (params.maxLocations !== undefined) {
      results = results.filter(c => c.estimated_locations <= params.maxLocations!);
    }

    if (params.buyingSignal && params.buyingSignal !== 'all') {
      results = results.filter(c => 
        c.buying_signals.some(s => s.toLowerCase().includes(params.buyingSignal!.toLowerCase()))
      );
    }

    return {
      companies: results.map(c => ({
        ...c,
        provenance: 'demo' as Provenance,
        retrieval_timestamp: new Date().toISOString()
      })),
      provenance: 'demo'
    };
  }

  async searchContacts(companyId: string, companyName: string, targetRoles: string[]): Promise<{ contacts: Contact[]; provenance: Provenance }> {
    const matched = DEMO_CONTACTS.filter(c => c.company_id === companyId);
    
    if (matched.length > 0) {
      return {
        contacts: matched.map(c => ({
          ...c,
          provenance: 'demo' as Provenance,
          retrieval_timestamp: new Date().toISOString()
        })),
        provenance: 'demo'
      };
    }

    // If company exists but has no predefined demo contact, create realistic sample contact adhering to ICP role
    const defaultRole = targetRoles[0] || 'VP of Operations';
    const sampleContact: Contact = {
      id: `lead-demo-${Date.now()}`,
      company_id: companyId,
      company_name: companyName,
      full_name: 'Alex Morgan',
      job_title: defaultRole,
      professional_profile_url: `https://linkedin.demo/in/alex-morgan-${companyId}`,
      work_email: `alex.morgan@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo`,
      email_verification_status: 'verified',
      source_url: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo/team`,
      retrieval_timestamp: new Date().toISOString(),
      provenance: 'demo',
      approval_status: 'PENDING',
      created_at: new Date().toISOString()
    };

    return {
      contacts: [sampleContact],
      provenance: 'demo'
    };
  }
}
