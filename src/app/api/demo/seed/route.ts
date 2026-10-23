import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { checkPasscodeGate } from '@/lib/auth/passcode';

export async function POST(req: Request) {
  try {
    const gateError = checkPasscodeGate(req);
    if (gateError) return gateError;

    Store.resetToDemo();
    return NextResponse.json({
      success: true,
      message: 'Platform database reset to initial verified real_curated state.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
