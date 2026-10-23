import { Company, Contact, Provenance } from '@/types';

export interface CsvImportResult {
  companies: Company[];
  contacts: Contact[];
  errors: string[];
  totalParsed: number;
}

export class CsvImporter {
  static parse(csvText: string): CsvImportResult {
    const lines = csvText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const result: CsvImportResult = {
      companies: [],
      contacts: [],
      errors: [],
      totalParsed: 0
    };

    if (lines.length < 2) {
      result.errors.push('CSV file is empty or missing headers.');
      return result;
    }

    // Header parse
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Required headers: company, website or contact_name
    const nameIdx = headers.findIndex(h => h.includes('company'));
    const websiteIdx = headers.findIndex(h => h.includes('website') || h.includes('url'));
    const locIdx = headers.findIndex(h => h.includes('location') || h.includes('store') || h.includes('count'));
    const catIdx = headers.findIndex(h => h.includes('category') || h.includes('type'));
    const hqIdx = headers.findIndex(h => h.includes('headquarters') || h.includes('hq') || h.includes('city') || h.includes('state'));
    const signalIdx = headers.findIndex(h => h.includes('signal'));
    const contactIdx = headers.findIndex(h => h.includes('contact') || h.includes('lead') || h.includes('executive') || h.includes('name') && h !== 'company_name');
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('role'));
    const emailIdx = headers.findIndex(h => h.includes('email'));

    if (nameIdx === -1) {
      result.errors.push('CSV must include a "company_name" or "company" column header.');
      return result;
    }

    const seenCompanyNames = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV tokenization handling quoted strings
      const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      const companyName = row[nameIdx];
      if (!companyName) continue;

      result.totalParsed++;

      const website = (websiteIdx !== -1 && row[websiteIdx]) ? row[websiteIdx] : `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const locations = (locIdx !== -1 && row[locIdx]) ? parseInt(row[locIdx], 10) || 35 : 35;
      const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx] : 'fast-casual';
      const hq = (hqIdx !== -1 && row[hqIdx]) ? row[hqIdx] : 'United States';
      const signal = (signalIdx !== -1 && row[signalIdx]) ? row[signalIdx] : 'restaurant expansion';

      const companyId = `comp-manual-${Date.now()}-${i}`;

      if (!seenCompanyNames.has(companyName.toLowerCase())) {
        seenCompanyNames.add(companyName.toLowerCase());
        const company: Company = {
          id: companyId,
          name: companyName,
          website,
          industry: 'Quick-service restaurants',
          headquarters: hq,
          estimated_locations: locations,
          company_size: `${locations} locations`,
          restaurant_category: category,
          buying_signals: [signal],
          source_urls: [website],
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'manually_sourced' as Provenance,
          created_at: new Date().toISOString()
        };
        result.companies.push(company);
      }

      // Check if contact info exists in row
      const contactName = contactIdx !== -1 ? row[contactIdx] : '';
      const jobTitle = titleIdx !== -1 ? row[titleIdx] : 'VP of Operations';
      const email = emailIdx !== -1 ? row[emailIdx] : '';

      if (contactName && contactName.toLowerCase() !== companyName.toLowerCase()) {
        const contact: Contact = {
          id: `lead-manual-${Date.now()}-${i}`,
          company_id: companyId,
          company_name: companyName,
          full_name: contactName,
          job_title: jobTitle,
          work_email: email || undefined,
          email_verification_status: email ? 'unverified' : 'unavailable',
          source_url: website,
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'manually_sourced' as Provenance,
          approval_status: 'PENDING',
          created_at: new Date().toISOString()
        };
        result.contacts.push(contact);
      }
    }

    return result;
  }
}
