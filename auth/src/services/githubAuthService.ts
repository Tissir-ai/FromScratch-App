import { OAuthApp } from '@octokit/oauth-app';
import dotenv from 'dotenv';

dotenv.config();

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
  console.warn('[githubAuthService] GitHub OAuth env vars are not fully configured');
}

const githubApp = new OAuthApp({
  clientType: 'oauth-app',
  clientId: GITHUB_CLIENT_ID || '',
  clientSecret: GITHUB_CLIENT_SECRET || '',
});

export interface NormalizedOAuthUser {
  provider: 'google' | 'github';
  providerId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export function getGithubAuthUrl(state?: string): string {
  if (!GITHUB_CLIENT_ID || !GITHUB_REDIRECT_URI) {
    throw new Error('GitHub OAuth is not configured');
  }

  const url = githubApp.getWebFlowAuthorizationUrl({
    redirectUrl: GITHUB_REDIRECT_URI,
    state,
    scopes: ['read:user', 'user:email'],
  });

  return url.url;
}

export async function getGithubUserFromCode(code: string): Promise<NormalizedOAuthUser> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
    throw new Error('GitHub OAuth is not configured');
  }

  const { authentication } = await githubApp.createToken({
    code,
    redirectUrl: GITHUB_REDIRECT_URI,
  });

  const accessToken = authentication.token;

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'fromscratch-auth-app',
    },
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch GitHub user: ${userResponse.status}`);
  }

  const userData: any = await userResponse.json();

  let email: string | null = userData.email ?? null;
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'fromscratch-auth-app',
      },
    });

    if (emailsResponse.ok) {
      const emails: any[] = await emailsResponse.json();
      const primary = emails.find((e) => e.primary) ?? emails[0];
      email = primary?.email ?? null;
    }
  }

  const name: string | null = userData.name ?? null;
  let firstName: string | null = null;
  let lastName: string | null = null;

  if (name) {
    const parts = name.split(' ');
    firstName = parts[0] ?? null;
    lastName = parts.slice(1).join(' ') || null;
  }

  return {
    provider: 'github',
    providerId: String(userData.id),
    email,
    firstName,
    lastName,
    avatarUrl: userData.avatar_url ?? null,
  };
}
