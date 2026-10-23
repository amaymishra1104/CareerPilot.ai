import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { EnrichmentEngine } from '@/lib/enrichment/enricher';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId query parameter is required.' }, { status: 400 });
    }

    const enrichment = Store.getEnrichmentByLeadId(leadId);
    if (!enrichment) {
      return NextResponse.json({ error: `Enrichment not found for lead ${leadId}` }, { status: 404 });
    }

    return NextResponse.json(enrichment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, forceRefresh } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    const contact = Store.getContactById(leadId);
    if (!contact) {
      return NextResponse.json({ error: `Lead ${leadId} not found.` }, { status: 404 });
    }

    const company = Store.getCompanyById(contact.company_id);
    if (!company) {
      return NextResponse.json({ error: `Company ${contact.company_id} not found.` }, { status: 404 });
    }

    const settings = Store.getSettings();
    const enrichment = await EnrichmentEngine.enrichLead(contact, company, settings, { forceRefresh: Boolean(forceRefresh) });
    Store.saveEnrichment(enrichment);

    return NextResponse.json({
      success: true,
      enrichment
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
