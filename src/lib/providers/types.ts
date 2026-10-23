import { Company, Contact, ICPConfig, Provenance } from '@/types';

export interface CompanySearchParams {
  query?: string;
  category?: string;
  minLocations?: number;
  maxLocations?: number;
  buyingSignal?: string;
}

export interface SearchProviderInterface {
  name: string;
  isLive: boolean;
  searchCompanies(params: CompanySearchParams, icp: ICPConfig): Promise<{ companies: Company[]; provenance: Provenance }>;
  searchContacts(companyId: string, companyName: string, targetRoles: string[]): Promise<{ contacts: Contact[]; provenance: Provenance }>;
}
