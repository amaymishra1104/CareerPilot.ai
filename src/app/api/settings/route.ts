import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';

export async function GET() {
  try {
    const settings = Store.getSettings();
    // Mask sensitive keys for client display
    return NextResponse.json({
      ...settings,
      llm_api_key: settings.llm_api_key ? '••••••••' + settings.llm_api_key.slice(-4) : '',
      search_api_key: settings.search_api_key ? '••••••••' + settings.search_api_key.slice(-4) : '',
      gmail_client_secret: settings.gmail_client_secret ? '••••••••' : ''
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = Store.getSettings();

    // Preserve existing secrets if masked values were sent
    const updated = {
      ...body,
      llm_api_key: body.llm_api_key?.startsWith('••••') ? current.llm_api_key : body.llm_api_key,
      search_api_key: body.search_api_key?.startsWith('••••') ? current.search_api_key : body.search_api_key,
      gmail_client_secret: body.gmail_client_secret?.startsWith('••••') ? current.gmail_client_secret : body.gmail_client_secret
    };

    const saved = Store.updateSettings(updated);
    return NextResponse.json({
      success: true,
      settings: {
        ...saved,
        llm_api_key: saved.llm_api_key ? '••••••••' + saved.llm_api_key.slice(-4) : '',
        search_api_key: saved.search_api_key ? '••••••••' + saved.search_api_key.slice(-4) : '',
        gmail_client_secret: saved.gmail_client_secret ? '••••••••' : ''
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
