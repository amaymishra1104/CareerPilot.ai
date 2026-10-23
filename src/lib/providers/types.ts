import { Company, Contact, ICPConfig, Provenance } from '@/types';

export interface CompanySearchParams {
  query?: string;
  category?: string;
  location?: string;
  domain?: string;
  minLocations?: number;
  maxLocations?: number;
  minEmployees?: number;
  maxEmployees?: number;
  buyingSignal?: string;
}

export interface ProviderSearchResult<T> {
  data: T;
  provenance: Provenance;
  provider: string;
  totalFound?: number;
  creditInfo?: {
    creditsUsed?: number;
    creditsRemaining?: number | string;
    notice?: string;
  };
}

export interface SearchProviderInterface {
  name: string;
  isLive: boolean;
  searchCompanies(params: CompanySearchParams, icp: ICPConfig): Promise<{ companies: Company[]; provenance: Provenance; creditInfo?: any }>;
  searchContacts(companyId: string, companyName: string, targetRoles: string[]): Promise<{ contacts: Contact[]; provenance: Provenance; creditInfo?: any }>;
}

