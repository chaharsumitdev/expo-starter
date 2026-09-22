/**
 * Every backend path in one place — adapt these to your API.
 * The request/response contract is documented in docs/backend-contract.md.
 */
export const endpoints = {
  auth: {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    google: '/auth/google',
    apple: '/auth/apple',
    emailLogin: '/auth/email/login',
    emailRegister: '/auth/email/register',
    passwordForgot: '/auth/password/forgot',
    magicLinkRequest: '/auth/magic-link/request',
    magicLinkVerify: '/auth/magic-link/verify',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  me: '/me',
  devices: {
    pushToken: '/devices/push-token',
  },
  items: {
    list: '/items',
    detail: (id: string) => `/items/${id}`,
  },
} as const;
