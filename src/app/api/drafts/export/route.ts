import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { GmailIntegrationService } from '@/lib/integrations/gmail';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const leadId = searchParams.get('leadId') || undefined;

    const drafts = Store.getDrafts(leadId);

    if (format === 'csv') {
      const csv = GmailIntegrationService.exportDraftsToCsv(drafts);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="osvi-email-drafts.csv"'
        }
      });
    }

    return NextResponse.json(drafts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
