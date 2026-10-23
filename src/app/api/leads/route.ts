import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { DemoSearchProvider } from '@/lib/providers/demo-provider';
import { LiveSearchProvider } from '@/lib/providers/live-provider';
import { ApprovalStatus } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || undefined;
    const approvalStatus = (searchParams.get('status') as ApprovalStatus) || undefined;

    const contacts = Store.getContacts({ company_id: companyId, approval_status: approvalStatus });
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, roles } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required.' }, { status: 400 });
    }

    const company = Store.getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: `Company with ID ${companyId} not found.` }, { status: 404 });
    }

    const icp = Store.getIcp();
    const settings = Store.getSettings();
    const targetRoles = roles || icp.targetRoles;

    const provider = settings.search_provider === 'mock_demo'
      ? new DemoSearchProvider()
      : new LiveSearchProvider(settings.search_api_key, settings.search_provider);

    const { contacts, provenance } = await provider.searchContacts(company.id, company.name, targetRoles);
    const newlyAdded = Store.addContacts(contacts);

    return NextResponse.json({
      success: true,
      provenance,
      totalFound: contacts.length,
      newlyAdded: newlyAdded.length,
      contacts: Store.getContacts({ company_id: companyId })
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
