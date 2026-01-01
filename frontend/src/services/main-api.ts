import { User } from '@/types/diagram.type';

// In Docker/production, frontend calls nginx at /api which proxies to backend
// In local dev, it can call backend directly
const MAIN_API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_API_BASE_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Module-level user storage for services that can't easily access AuthContext
let _currentUser: User | null = null;

export function setCurrentUser(user: User | null): void {
  _currentUser = user;
}

export function getCurrentUserFromStore(): User | null {
  return _currentUser;
}

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
  user?: User | null; // Accept user from context (takes priority)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${MAIN_API_BASE_URL}${path}`;

  // User can be passed directly or retrieved from module store
  const user = options.user ?? _currentUser;
  
  if (!user) {
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
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
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
  get: <T>(path: string, user?: User | null, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'GET', user }),
  post: <T>(path: string, body?: any, user?: User | null, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'POST', body, user }),
  put: <T>(path: string, body?: any, user?: User | null, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'PUT', body, user }),
  patch: <T>(path: string, body?: any, user?: User | null, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'PATCH', body, user }),
  delete: <T>(path: string, user?: User | null, options?: RequestOptions) =>
    request<T>(path, { ...(options || {}), method: 'DELETE', user }),
};

export { MAIN_API_BASE_URL };