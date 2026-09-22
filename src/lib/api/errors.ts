/** Normalised error thrown by the API client for any non-2xx response or network failure. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Machine-readable code from the backend body (`{ code }`), e.g. `invalid_otp`. */
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
