import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';

export async function GET() {
  const profile = Store.getUserProfile();
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = Store.updateUserProfile(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
