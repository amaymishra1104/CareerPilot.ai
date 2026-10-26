import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { CareerGmailDraftService } from '@/lib/career/gmail-draft-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json({ error: 'draftId is required.' }, { status: 400 });
    }

    const draft = Store.getPersonalizedDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ error: `Draft ${draftId} not found.` }, { status: 404 });
    }

    const settings = Store.getSettings();
    const result = await CareerGmailDraftService.createGmailDraftForOutreach(draft, settings);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
