import { User } from '@/types/diagram.type';
import { getCurrentUser } from './auth.service';

// In Docker/production, frontend calls nginx at /api which proxies to backend
// In local dev, it can call backend directly
const MAIN_API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_API_BASE_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
  responseType?: 'json' | 'text' | 'blob';
}

async function requireAuthenticatedUser(): Promise<User> {
  try {
    const current = await getCurrentUser();
    const user = current?.user;
    if (!user) {
      throw new Error('Authentication required. Please log in.');
    }
    return user;
  } catch (err) {
    throw new Error('Authentication required. Please log in.');
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${MAIN_API_BASE_URL}${path}`;

  const user = await requireAuthenticatedUser();
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw new Error('Authentication required. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-user': JSON.stringify({id: user.id, name : user.firstName + " " + user.lastName}), 
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  const desired = options.responseType ?? 'json';
  if (desired === 'blob') {
    data = await response.blob().catch(() => null);
  } else {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const mainApi = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'POST', body }),
  put: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'PUT', body }),
  patch: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'DELETE' }),
};

export { MAIN_API_BASE_URL };