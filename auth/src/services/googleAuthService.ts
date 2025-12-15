import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  // We don't throw here to allow the app to start without Google configured,
  // but any call into this service will fail loudly.
  console.warn('[googleAuthService] Google OAuth env vars are not fully configured');
}

const googleClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});

export interface NormalizedOAuthUser {
  provider: 'google' | 'github';
  providerId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export function getGoogleAuthUrl(state?: string): string {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth is not configured');
  }

  const scopes = [
    'openid',
    'email',
    'profile',
  ];

  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state,
  });

  return url;
}

export async function getGoogleUserFromCode(code: string): Promise<NormalizedOAuthUser> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth is not configured');
  }

  const { tokens } = await googleClient.getToken(code);
  if (!tokens.id_token) {
    throw new Error('No id_token returned from Google');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new Error('Invalid Google ID token payload');
  }

  const email = payload.email ?? null;
  const fullName = payload.name ?? '';
  const givenName = payload.given_name ?? null;
  const familyName = payload.family_name ?? null;

  let firstName: string | null = givenName;
  let lastName: string | null = familyName;

  if (!firstName && fullName) {
    const parts = fullName.split(' ');
    firstName = parts[0] ?? null;
    lastName = parts.slice(1).join(' ') || null;
  }

  return {
    provider: 'google',
    providerId: payload.sub,
    email,
    firstName,
    lastName,
    avatarUrl: payload.picture ?? null,
  };
}
