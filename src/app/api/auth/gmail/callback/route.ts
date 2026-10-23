import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { GmailIntegrationService } from '@/lib/integrations/gmail';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?tab=settings&error=' + encodeURIComponent(error), req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?tab=settings&error=missing_code', req.url));
  }

  try {
    const settings = Store.getSettings();
    const clientId = settings.gmail_client_id || process.env.GMAIL_CLIENT_ID || '';
    const clientSecret = settings.gmail_client_secret || process.env.GMAIL_CLIENT_SECRET || '';
    const redirectUri = settings.gmail_redirect_uri || process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback';

    const tokenData = await GmailIntegrationService.exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    Store.updateSettings({
      gmail_refresh_token: tokenData.refreshToken || settings.gmail_refresh_token,
      gmail_connected_email: tokenData.email || 'user@gmail.com',
      gmail_connected: true
    });

    return NextResponse.redirect(new URL('/?tab=settings&gmail_connected=success', req.url));
  } catch (err: any) {
    console.error('Gmail OAuth exchange error:', err);
    return NextResponse.redirect(new URL('/?tab=settings&error=' + encodeURIComponent(err.message), req.url));
  }
}
