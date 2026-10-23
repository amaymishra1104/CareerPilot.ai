import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { checkPasscodeGate } from '@/lib/auth/passcode';

export async function GET(req: Request) {
  try {
    const gateError = checkPasscodeGate(req);
    if (gateError) return gateError;
    const settings = Store.getSettings();
    const hasApollo = Boolean(process.env.APOLLO_API_KEY || settings.apollo_api_key || settings.search_api_key);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY || settings.gemini_api_key || (settings.llm_provider === 'gemini' && settings.llm_api_key));

    const mask = (key?: string) => key && key.length > 4 ? '••••••••' + key.slice(-4) : (key ? '••••••••' : '');

    return NextResponse.json({
      ...settings,
      apollo_configured: hasApollo,
      gemini_configured: hasGemini,
      apollo_api_key: mask(settings.apollo_api_key || settings.search_api_key || process.env.APOLLO_API_KEY),
      gemini_api_key: mask(settings.gemini_api_key || process.env.GEMINI_API_KEY),
      llm_api_key: mask(settings.llm_api_key),
      search_api_key: mask(settings.search_api_key),
      gmail_client_secret: settings.gmail_client_secret ? '••••••••' : '',
      gmail_refresh_token: settings.gmail_refresh_token ? '••••••••' : '',
      n8n_webhook_secret: settings.n8n_webhook_secret ? '••••••••' : ''
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const gateError = checkPasscodeGate(req);
    if (gateError) return gateError;

    const body = await req.json();
    const current = Store.getSettings();

    // Preserve existing secrets if masked values were sent
    const updated = {
      ...body,
      apollo_api_key: body.apollo_api_key?.startsWith('••••') ? current.apollo_api_key : body.apollo_api_key,
      gemini_api_key: body.gemini_api_key?.startsWith('••••') ? current.gemini_api_key : body.gemini_api_key,
      llm_api_key: body.llm_api_key?.startsWith('••••') ? current.llm_api_key : body.llm_api_key,
      search_api_key: body.search_api_key?.startsWith('••••') ? current.search_api_key : body.search_api_key,
      gmail_client_secret: body.gmail_client_secret?.startsWith('••••') ? current.gmail_client_secret : body.gmail_client_secret,
      gmail_refresh_token: body.gmail_refresh_token?.startsWith('••••') ? current.gmail_refresh_token : body.gmail_refresh_token,
      n8n_webhook_secret: body.n8n_webhook_secret?.startsWith('••••') ? current.n8n_webhook_secret : body.n8n_webhook_secret
    };

    const saved = Store.updateSettings(updated);
    const mask = (key?: string) => key && key.length > 4 ? '••••••••' + key.slice(-4) : (key ? '••••••••' : '');

    return NextResponse.json({
      success: true,
      settings: {
        ...saved,
        apollo_configured: Boolean(process.env.APOLLO_API_KEY || saved.apollo_api_key || saved.search_api_key),
        gemini_configured: Boolean(process.env.GEMINI_API_KEY || saved.gemini_api_key),
        apollo_api_key: mask(saved.apollo_api_key || saved.search_api_key || process.env.APOLLO_API_KEY),
        gemini_api_key: mask(saved.gemini_api_key || process.env.GEMINI_API_KEY),
        llm_api_key: mask(saved.llm_api_key),
        search_api_key: mask(saved.search_api_key),
        gmail_client_secret: saved.gmail_client_secret ? '••••••••' : '',
        gmail_refresh_token: saved.gmail_refresh_token ? '••••••••' : '',
        n8n_webhook_secret: saved.n8n_webhook_secret ? '••••••••' : ''
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
