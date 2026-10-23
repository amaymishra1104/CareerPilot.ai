import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';

export async function GET() {
  try {
    const icp = Store.getIcp();
    return NextResponse.json(icp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = Store.updateIcp(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
