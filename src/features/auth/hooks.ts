import { useMutation } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { authApi } from './api';
import { getAppleCredential } from './providers/apple';
import { getGoogleIdToken } from './providers/google';
import { useAuth } from './store';
import type { OtpChannel, Session } from './types';

/** Wraps a credential exchange so every method ends in `setSession`. Null = user cancelled. */
function useSessionMutation<TVars>(exchange: (vars: TVars) => Promise<Session | null>) {
  const setSession = useAuth((s) => s.setSession);
  return useMutation({
    mutationFn: async (vars: TVars) => {
      const session = await exchange(vars);
      if (session) await setSession(session);
      return session;
    },
  });
}

export const useGoogleSignIn = () =>
  useSessionMutation<void>(async () => {
    const idToken = await getGoogleIdToken();
    return idToken ? authApi.google(idToken) : null;
  });

export const useAppleSignIn = () =>
  useSessionMutation<void>(async () => {
    const credential = await getAppleCredential();
    return credential ? authApi.apple(credential) : null;
  });

export const useVerifyOtp = () =>
  useSessionMutation(({ requestId, code }: { requestId: string; code: string }) =>
    authApi.verifyOtp(requestId, code),
  );

export const useEmailLogin = () =>
  useSessionMutation(({ email, password }: { email: string; password: string }) =>
    authApi.emailLogin(email, password),
  );

export const useEmailRegister = () =>
  useSessionMutation((body: { email: string; password: string; name?: string }) =>
    authApi.emailRegister(body),
  );

export const useVerifyMagicLink = () =>
  useSessionMutation((token: string) => authApi.verifyMagicLink(token));

export const useRequestOtp = () =>
  useMutation({
    mutationFn: ({ channel, destination }: { channel: OtpChannel; destination: string }) =>
      authApi.requestOtp(channel, destination),
  });

export const useRequestMagicLink = () =>
  useMutation({
    // The email link must point back into the app: <scheme>://auth/callback?token=…
    mutationFn: (email: string) =>
      authApi.requestMagicLink(email, Linking.createURL('/auth/callback')),
  });

export const useForgotPassword = () =>
  useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email) });

export const useDeleteAccount = () => {
  const signOut = useAuth((s) => s.signOut);
  return useMutation({
    mutationFn: async () => {
      await authApi.deleteAccount();
      await signOut({ remote: false });
    },
  });
};
