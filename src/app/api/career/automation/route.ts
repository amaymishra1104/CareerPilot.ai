import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { DailyAutomationRunner } from '@/lib/career/daily-automation';

export async function GET() {
  const config = Store.getDailyAutomationConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = Store.updateDailyAutomationConfig(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'user-amay-01';

    const report = await DailyAutomationRunner.runDailyWorkflow(userId);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
