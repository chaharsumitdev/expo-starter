/**
 * In-app mock backend, enabled with EXPO_PUBLIC_API_MOCK=true.
 * Lets the template (and new apps) run end-to-end before the real API exists.
 *
 * - Any OTP code `000000` is accepted.
 * - Any email/password is accepted (password must be ≥ 8 chars).
 * - Magic-link token `demo` is accepted.
 */
import type { Session } from '@/features/auth/types';

import { endpoints } from './endpoints';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const error = (status: number, code: string, message: string) => json(status, { code, message });

let tokenCounter = 0;
function makeSession(user: Partial<Session['user']>, isNewUser = false): Session {
  tokenCounter += 1;
  return {
    accessToken: `mock-access-${tokenCounter}`,
    refreshToken: `mock-refresh-${tokenCounter}`,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    user: { id: 'user_1', name: 'Demo User', ...user },
    isNewUser,
  };
}

const items = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  title: `Item ${i + 1}`,
  description: 'Served by the mock API. Replace endpoints.items with your own.',
}));

type Body = Record<string, string | undefined> | undefined;

export async function mockFetch(
  method: string,
  path: string,
  rawBody: unknown,
  token: string | null,
): Promise<Response> {
  await delay();
  const body = rawBody as Body;
  const { auth } = endpoints;

  switch (`${method} ${path}`) {
    case `POST ${auth.otpRequest}`:
      return json(200, { requestId: `req_${Date.now()}`, expiresIn: 300, resendIn: 30 });
    case `POST ${auth.otpVerify}`:
      return body?.code === '000000'
        ? json(200, makeSession({ phone: '+10000000000' }, true))
        : error(400, 'invalid_otp', 'That code is incorrect. Try 000000.');
    case `POST ${auth.google}`:
    case `POST ${auth.apple}`:
      return json(200, makeSession({ email: 'demo@example.com' }));
    case `POST ${auth.emailLogin}`:
    case `POST ${auth.emailRegister}`:
      return (body?.password?.length ?? 0) >= 8
        ? json(200, makeSession({ email: body?.email }, path === auth.emailRegister))
        : error(400, 'invalid_credentials', 'Invalid email or password.');
    case `POST ${auth.passwordForgot}`:
    case `POST ${auth.magicLinkRequest}`:
      return json(204);
    case `POST ${auth.magicLinkVerify}`:
      return body?.token === 'demo'
        ? json(200, makeSession({ email: 'demo@example.com' }))
        : error(400, 'invalid_token', 'This link has expired.');
    case `POST ${auth.refresh}`:
      return json(200, makeSession({}));
    case `POST ${auth.logout}`:
    case `POST ${endpoints.devices.pushToken}`:
    case `DELETE ${endpoints.devices.pushToken}`:
      return json(204);
  }

  if (!token) return error(401, 'unauthorized', 'Not signed in.');

  if (path === endpoints.me && method === 'GET') {
    return json(200, { id: 'user_1', name: 'Demo User', email: 'demo@example.com' });
  }
  if (path === endpoints.me && method === 'PATCH') return json(200, { id: 'user_1', ...body });
  if (path === endpoints.me && method === 'DELETE') return json(204);
  if (path === endpoints.items.list) return json(200, items);
  const detail = path.match(/^\/items\/(\w+)$/);
  if (detail) {
    const item = items.find((i) => i.id === detail[1]);
    return item ? json(200, item) : error(404, 'not_found', 'Item not found.');
  }

  return error(404, 'not_found', `Mock: no handler for ${method} ${path}`);
}
