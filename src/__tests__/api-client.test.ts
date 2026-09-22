import { api, isApiError, registerAuthHooks } from '@/lib/api';

// jest.mock calls are hoisted above imports.
jest.mock('@/lib/env', () => ({
  env: { apiUrl: 'https://api.test', apiMock: false, authProviders: [], variant: 'development' },
}));

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

describe('api client', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('refreshes once for concurrent 401s and retries with the new token', async () => {
    let token = 'old';
    const refresh = jest.fn(async () => {
      token = 'new';
      return token;
    });
    registerAuthHooks({ getAccessToken: () => token, refresh });

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === 'Bearer new' ? respond(200, { ok: true }) : respond(401);
    });

    const results = await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError with the backend code and message', async () => {
    fetchMock.mockResolvedValue(respond(400, { code: 'invalid_otp', message: 'Wrong code' }));

    const error = await api.post('/auth/otp/verify', {}, { anonymous: true }).catch((e) => e);

    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 400, code: 'invalid_otp', message: 'Wrong code' });
  });
});
