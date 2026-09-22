import { api, endpoints } from '@/lib/api';

import type { OtpChannel, OtpRequestResponse, Session, User } from './types';

const anon = { anonymous: true } as const;
const { auth } = endpoints;

/** Exchanges provider credentials with the backend. Every sign-in returns a `Session`. */
export const authApi = {
  requestOtp: (channel: OtpChannel, destination: string) =>
    api.post<OtpRequestResponse>(auth.otpRequest, { channel, destination }, anon),
  verifyOtp: (requestId: string, code: string) =>
    api.post<Session>(auth.otpVerify, { requestId, code }, anon),

  google: (idToken: string) => api.post<Session>(auth.google, { idToken }, anon),
  apple: (body: {
    identityToken: string;
    rawNonce: string;
    /** Apple only returns name/email on the very first sign-in, forward them. */
    fullName?: { givenName?: string | null; familyName?: string | null } | null;
    email?: string | null;
  }) => api.post<Session>(auth.apple, body, anon),

  emailLogin: (email: string, password: string) =>
    api.post<Session>(auth.emailLogin, { email, password }, anon),
  emailRegister: (body: { email: string; password: string; name?: string }) =>
    api.post<Session>(auth.emailRegister, body, anon),
  forgotPassword: (email: string) => api.post<void>(auth.passwordForgot, { email }, anon),

  requestMagicLink: (email: string, redirectUrl: string) =>
    api.post<void>(auth.magicLinkRequest, { email, redirectUrl }, anon),
  verifyMagicLink: (token: string) => api.post<Session>(auth.magicLinkVerify, { token }, anon),

  refresh: (refreshToken: string) => api.post<Session>(auth.refresh, { refreshToken }, anon),
  logout: (refreshToken: string) => api.post<void>(auth.logout, { refreshToken }),

  me: () => api.get<User>(endpoints.me),
  updateMe: (body: Partial<User>) => api.patch<User>(endpoints.me, body),
  deleteAccount: () => api.delete<void>(endpoints.me),
};
