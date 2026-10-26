import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';

export async function GET() {
  const prefs = Store.getJobPreferences();
  return NextResponse.json(prefs);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = Store.updateJobPreferences(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
