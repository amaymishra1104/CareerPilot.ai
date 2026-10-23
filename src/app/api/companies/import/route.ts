import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { CsvImporter } from '@/lib/providers/csv-provider';

export async function POST(req: Request) {
  try {
    const { csvText } = await req.json();
    if (!csvText || typeof csvText !== 'string') {
      return NextResponse.json({ error: 'Missing CSV text content.' }, { status: 400 });
    }

    const parsed = CsvImporter.parse(csvText);

    if (parsed.errors.length > 0 && parsed.companies.length === 0) {
      return NextResponse.json({ error: parsed.errors.join(' ') }, { status: 400 });
    }

    const addedCompanies = Store.addCompanies(parsed.companies);
    const addedContacts = Store.addContacts(parsed.contacts);

    return NextResponse.json({
      success: true,
      provenance: 'manually_sourced',
      parsedCount: parsed.totalParsed,
      addedCompaniesCount: addedCompanies.length,
      addedContactsCount: addedContacts.length,
      errors: parsed.errors,
      companies: Store.getCompanies()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
