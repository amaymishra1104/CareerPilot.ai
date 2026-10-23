import { Company, Contact, Provenance } from '@/types';

export interface CsvImportResult {
  companies: Company[];
  contacts: Contact[];
  errors: string[];
  warnings: string[];
  skipped: string[];
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
      warnings: [],
      skipped: [],
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
    const contactIdx = headers.findIndex(h => h.includes('contact') || h.includes('lead') || h.includes('executive') || (h.includes('name') && h !== 'company_name'));
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('role'));
    const emailIdx = headers.findIndex(h => h.includes('email'));

    if (nameIdx === -1) {
      result.errors.push('CSV must include a "company_name" or "company" column header.');
      return result;
    }

    // Maps normalized company name -> saved company id to fix repeated row foreign key bug
    const seenCompanies = new Map<string, string>();
    const seenContacts = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Robust CSV tokenization handling quoted strings with embedded commas
      const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      const companyName = row[nameIdx];
      if (!companyName) continue;

      result.totalParsed++;
      const normalizedComp = companyName.toLowerCase();

      // Retrieve or allocate consistent company ID
      let companyId: string;
      if (seenCompanies.has(normalizedComp)) {
        companyId = seenCompanies.get(normalizedComp)!;
      } else {
        companyId = `comp-manual-${Date.now()}-${i}`;
        seenCompanies.set(normalizedComp, companyId);

        const rawLoc = locIdx !== -1 ? row[locIdx] : '';
        const parsedLoc = rawLoc ? parseInt(rawLoc, 10) : NaN;
        
        if (isNaN(parsedLoc)) {
          result.warnings.push(`Row ${i}: Location count for "${companyName}" was missing or invalid; recorded as 0.`);
        } else if (parsedLoc < 20 || parsedLoc > 200) {
          result.warnings.push(`Row ${i}: "${companyName}" has ${parsedLoc} locations, which is outside the US QSR ICP sweet-spot (20–200 units).`);
        }

        const locations = !isNaN(parsedLoc) ? parsedLoc : 0;
        const website = (websiteIdx !== -1 && row[websiteIdx]) ? row[websiteIdx] : '';
        const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx] : 'unspecified';
        const hq = (hqIdx !== -1 && row[hqIdx]) ? row[hqIdx] : 'United States';
        
        const rawSignal = signalIdx !== -1 ? row[signalIdx] : '';
        const signals = rawSignal ? [rawSignal] : [];
        if (!rawSignal) {
          result.warnings.push(`Row ${i}: No buying signal provided for "${companyName}".`);
        }

        const company: Company = {
          id: companyId,
          name: companyName,
          website,
          industry: 'Quick-service restaurants',
          headquarters: hq,
          estimated_locations: locations,
          company_size: locations > 0 ? `${locations} locations` : 'Location count unspecified',
          restaurant_category: category,
          buying_signals: signals,
          source_urls: website ? [website] : [],
          retrieval_timestamp: new Date().toISOString(),
          provenance: 'manually_sourced' as Provenance,
          created_at: new Date().toISOString()
        };
        result.companies.push(company);
      }

      // Check contact info
      const contactName = contactIdx !== -1 ? row[contactIdx] : '';
      const jobTitle = (titleIdx !== -1 && row[titleIdx]) ? row[titleIdx] : 'Operations Lead';
      const email = emailIdx !== -1 ? row[emailIdx] : '';

      if (contactName && contactName.toLowerCase() !== normalizedComp) {
        const contactKey = `${contactName.toLowerCase()}::${normalizedComp}`;
        if (seenContacts.has(contactKey)) {
          result.skipped.push(`Row ${i}: Duplicate contact "${contactName}" at "${companyName}" was skipped.`);
          continue;
        }
        seenContacts.add(contactKey);

        const contact: Contact = {
          id: `lead-manual-${Date.now()}-${i}`,
          company_id: companyId, // Guaranteed to point to saved company ID
          company_name: companyName,
          full_name: contactName,
          job_title: jobTitle,
          work_email: email || 'unavailable',
          email_verification_status: email ? 'unverified' : 'unavailable',
          source_url: (websiteIdx !== -1 && row[websiteIdx]) ? row[websiteIdx] : '',
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
