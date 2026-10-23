import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';

export async function POST() {
  try {
    Store.resetToDemo();
    return NextResponse.json({
      success: true,
      message: 'Platform database reset to initial demo state with verified sample records.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
