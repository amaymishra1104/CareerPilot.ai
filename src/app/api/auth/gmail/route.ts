import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { GmailIntegrationService } from '@/lib/integrations/gmail';

export async function GET(req: Request) {
  try {
    const settings = Store.getSettings();
    const clientId = settings.gmail_client_id || process.env.GMAIL_CLIENT_ID;
    const redirectUri = settings.gmail_redirect_uri || process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback';

    if (!clientId) {
      return NextResponse.json({
        error: 'Gmail Client ID is not configured. Please enter your Google OAuth credentials in Settings.'
      }, { status: 400 });
    }

    const authUrl = GmailIntegrationService.getAuthUrl(clientId, redirectUri);
    return NextResponse.json({ authUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
