import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { WorkflowRunner } from '@/lib/workflow/runner';

export async function POST(req: Request) {
  try {
    const settings = Store.getSettings();
    const configuredSecret = settings.n8n_webhook_secret;

    // Fail closed: Webhook MUST NOT authenticate if secret is unconfigured
    if (!configuredSecret || configuredSecret.trim().length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: N8N webhook secret is not configured on the server. Webhook endpoint is closed.' },
        { status: 401 }
      );
    }

    // Verify authentication secret
    const headerSecret = req.headers.get('x-osvi-secret') || 
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!headerSecret || headerSecret !== configuredSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing webhook secret token.' },
        { status: 401 }
      );
    }

    const payload = await req.json().catch(() => ({}));
    const execution = await WorkflowRunner.runPipeline(payload.executionId);

    return NextResponse.json({
      success: true,
      source: 'n8n_webhook',
      executionId: execution.id,
      status: execution.status,
      summary: execution.summary,
      stats: execution.stats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
