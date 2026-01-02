import { authApi , AUTH_API_BASE_URL } from './auth-api';
import type { AuthUser } from '@/types/user.type';
import type { Subscription } from '@/types/subscription.type';
import type { SubscriptionPlan } from '@/types/plan.type';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  user: AuthUser;
}

interface RegisterResponse {
  user: AuthUser;
  tokens?: {
    accessToken: string;
  };
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const res = await authApi.post<LoginResponse>('/auth/login', payload);
  return res.user;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return authApi.post<RegisterResponse>('/auth/register', payload);
}

interface MeResponse {
  user: AuthUser;
  subscription?: Subscription | null;
  plan?: SubscriptionPlan | null;
}

export async function getCurrentUser(): Promise<MeResponse> {
  return authApi.get<MeResponse>('/auth/me');
}

export async function logout(): Promise<void> {
  await authApi.post('/auth/logout');
}

export function getGoogleLoginUrl(returnTo?: string, errorRedirect?: string): string {
  // This backend endpoint will redirect the browser to Google's OAuth page
  const base = `${AUTH_API_BASE_URL}/auth/google/login`;
  if (returnTo || errorRedirect) {
    const stateObj = { ok: returnTo ?? '/', err: errorRedirect ?? (returnTo ?? '/') };
    return `${base}?state=${encodeURIComponent(JSON.stringify(stateObj))}`;
  }
  return base;
}

export function getGithubLoginUrl(returnTo?: string, errorRedirect?: string): string {
  // This backend endpoint will redirect the browser to GitHub's OAuth page
  const base = `${AUTH_API_BASE_URL}/auth/github/login`;
  if (returnTo || errorRedirect) {
    const stateObj = { ok: returnTo ?? '/', err: errorRedirect ?? (returnTo ?? '/') };
    return `${base}?state=${encodeURIComponent(JSON.stringify(stateObj))}`;
  }
  return base;
}

export async function getSubscriptionPlanByUserId(userId: string): Promise<SubscriptionPlan | null> {
  return authApi.get<SubscriptionPlan | null>(`/subscriptions/plan/user/${userId}`);
}

export async function forgotPassword(email: string): Promise<void> {
  await authApi.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await authApi.post('/auth/reset-password', { token, newPassword });
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await authApi.post('/auth/change-password', { oldPassword, newPassword });
}
