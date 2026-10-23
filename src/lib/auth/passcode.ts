import { NextResponse } from 'next/server';

export interface PasscodeAuthResult {
  authorized: boolean;
  error?: string;
  reviewerIdentity: string;
}

/**
 * Validates request against optional/configured OSVI_PASSCODE environment variable.
 * Fails closed if OSVI_PASSCODE is configured and request lacks valid passcode.
 */
export function verifyPasscode(req: Request): PasscodeAuthResult {
  const configuredPasscode = process.env.OSVI_PASSCODE;
  const reviewerIdentity = 
    req.headers.get('x-reviewer-identity') || 
    process.env.GMAIL_USER_EMAIL || 
    'amaymishra1104@gmail.com (Auditor)';

  if (!configuredPasscode) {
    // Passcode not configured in environment (development/open mode)
    return {
      authorized: true,
      reviewerIdentity
    };
  }

  const headerPasscode = 
    req.headers.get('x-osvi-passcode') || 
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!headerPasscode || headerPasscode !== configuredPasscode) {
    return {
      authorized: false,
      error: 'Unauthorized: Missing or invalid OSVI shared passcode.',
      reviewerIdentity
    };
  }

  return {
    authorized: true,
    reviewerIdentity
  };
}

/**
 * Helper to immediately return 401 response if passcode authorization fails.
 */
export function checkPasscodeGate(req: Request): NextResponse | null {
  const auth = verifyPasscode(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}
