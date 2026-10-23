import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { DemoSearchProvider } from '@/lib/providers/demo-provider';
import { LiveSearchProvider } from '@/lib/providers/live-provider';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.toLowerCase().trim();
    const category = searchParams.get('category')?.toLowerCase().trim();
    const buyingSignal = searchParams.get('buyingSignal')?.toLowerCase().trim();
    const minLocations = searchParams.get('minLocations') ? Number(searchParams.get('minLocations')) : undefined;
    const maxLocations = searchParams.get('maxLocations') ? Number(searchParams.get('maxLocations')) : undefined;

    let companies = Store.getCompanies();

    if (query) {
      companies = companies.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.restaurant_category.toLowerCase().includes(query) ||
        c.headquarters.toLowerCase().includes(query)
      );
    }

    if (category && category !== 'all') {
      companies = companies.filter(c => c.restaurant_category.toLowerCase() === category);
    }

    if (buyingSignal && buyingSignal !== 'all') {
      companies = companies.filter(c => 
        c.buying_signals.some(s => s.toLowerCase().includes(buyingSignal))
      );
    }

    if (minLocations !== undefined && !isNaN(minLocations)) {
      companies = companies.filter(c => c.estimated_locations >= minLocations);
    }

    if (maxLocations !== undefined && !isNaN(maxLocations)) {
      companies = companies.filter(c => c.estimated_locations <= maxLocations);
    }

    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query, category, location, domain, minLocations, maxLocations, minEmployees, maxEmployees, buyingSignal, forceProvider } = body;
    const icp = Store.getIcp();
    const settings = Store.getSettings();

    const providerType = forceProvider || settings.search_provider;
    const apiKey = settings.apollo_api_key || settings.search_api_key || process.env.APOLLO_API_KEY;
    const provider = providerType === 'mock_demo'
      ? new DemoSearchProvider()
      : new LiveSearchProvider(apiKey, providerType);

    const searchRes: any = await provider.searchCompanies(
      { query, category, location, domain, minLocations, maxLocations, minEmployees, maxEmployees, buyingSignal },
      icp
    );
    const companies = searchRes.companies || [];
    const provenance = searchRes.provenance;
    const creditInfo = searchRes.creditInfo;

    const added = Store.addCompanies(companies);

    return NextResponse.json({
      success: true,
      provenance,
      provider: provider.name,
      creditInfo,
      totalFound: companies.length,
      newlyAdded: added.length,
      companies,
      allStoredCount: Store.getCompanies().length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
