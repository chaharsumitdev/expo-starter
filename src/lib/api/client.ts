import { env } from '@/lib/env';
import i18n from '@/lib/i18n';

import { ApiError } from './errors';
import { mockFetch } from './mock';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip the Authorization header and the refresh-on-401 logic (auth endpoints). */
  anonymous?: boolean;
};

/**
 * Hooks the auth feature plugs in at startup (see features/auth/store.ts).
 * Keeps this client free of any dependency on auth state.
 */
type AuthHooks = {
  getAccessToken: () => string | null;
  /** Refresh the session; resolve with the new access token, or null if the user must sign in again. */
  refresh: () => Promise<string | null>;
};

let authHooks: AuthHooks | null = null;
export function registerAuthHooks(hooks: AuthHooks) {
  authHooks = hooks;
}

// Single-flight: concurrent 401s share one refresh call.
let refreshPromise: Promise<string | null> | null = null;
function refreshOnce() {
  if (!authHooks) return Promise.resolve(null);
  refreshPromise ??= authHooks.refresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = `${env.apiUrl}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return params ? `${url}?${params}` : url;
}

async function send(method: Method, path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': i18n.language,
    ...options.headers,
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  };

  try {
    return env.apiMock
      ? await mockFetch(method, path, options.body, token)
      : await fetch(buildUrl(path, options.query), init);
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(i18n.t('errors.network'), 0);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ApiError(
      data?.message ?? i18n.t('errors.generic'),
      res.status,
      data?.code,
      data?.details,
    );
  }
  return data as T;
}

export async function request<T>(method: Method, path: string, options: RequestOptions = {}) {
  const token = options.anonymous ? null : (authHooks?.getAccessToken() ?? null);
  let res = await send(method, path, options, token);

  if (res.status === 401 && !options.anonymous && authHooks) {
    const fresh = await refreshOnce();
    if (fresh) res = await send(method, path, options, fresh);
  }

  return parse<T>(res);
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
