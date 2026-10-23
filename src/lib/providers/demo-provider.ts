import { Company, Contact, ICPConfig, Provenance } from '@/types';
import { SearchProviderInterface, CompanySearchParams } from './types';
import { DEMO_COMPANIES, DEMO_CONTACTS } from '@/lib/seed';

export class DemoSearchProvider implements SearchProviderInterface {
  name = 'Curated QSR Intelligence Provider';
  isLive = false;

  async searchCompanies(params: CompanySearchParams, icp: ICPConfig): Promise<{ companies: Company[]; provenance: Provenance }> {
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
        provenance: 'real_curated' as Provenance,
        retrieval_timestamp: new Date().toISOString()
      })),
      provenance: 'real_curated'
    };
  }

  async searchContacts(companyId: string, companyName: string, targetRoles: string[]): Promise<{ contacts: Contact[]; provenance: Provenance }> {
    const matched = DEMO_CONTACTS.filter(c => c.company_id === companyId);
    
    if (matched.length > 0) {
      return {
        contacts: matched.map(c => ({
          ...c,
          provenance: 'real_curated' as Provenance,
          retrieval_timestamp: new Date().toISOString()
        })),
        provenance: 'real_curated'
      };
    }

    // Zero-fabrication guarantee: Return empty if company lacks verified curated decision-maker
    return {
      contacts: [],
      provenance: 'real_curated'
    };
  }
}
