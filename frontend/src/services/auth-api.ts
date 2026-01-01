// In Docker/production, frontend calls nginx at /api which proxies to auth service
// In local dev, it can call auth service directly
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${AUTH_API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

export const authApi = {
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

export { AUTH_API_BASE_URL };