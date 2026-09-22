import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isApiError, registerAuthHooks } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { zustandStorage } from '@/lib/storage';

import { authApi } from './api';
import { sessionStorage, type Tokens } from './session-storage';
import type { Session, User } from './types';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** In memory only. Persisted copy lives in SecureStore. */
  tokens: Tokens | null;
  needsOnboarding: boolean;

  hydrate: () => Promise<void>;
  setSession: (session: Session) => Promise<void>;
  setUser: (user: User) => void;
  completeOnboarding: () => void;
  /** Clears local state; `remote` also revokes the refresh token on the backend. */
  signOut: (options?: { remote?: boolean }) => Promise<void>;
};

/** Runs before tokens are cleared on sign-out (e.g. unregister the push token). */
const signOutHandlers = new Set<() => Promise<void> | void>();
export function onBeforeSignOut(handler: () => Promise<void> | void) {
  signOutHandlers.add(handler);
  return () => signOutHandlers.delete(handler);
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'loading',
      user: null,
      tokens: null,
      needsOnboarding: false,

      hydrate: async () => {
        const tokens = await sessionStorage.load().catch(() => null);
        set(
          tokens
            ? { tokens, status: 'signedIn' }
            : { tokens: null, user: null, status: 'signedOut' },
        );
      },

      setSession: async ({ user, isNewUser, ...tokens }) => {
        await sessionStorage.save(tokens);
        set((s) => ({
          tokens,
          user,
          status: 'signedIn',
          needsOnboarding: isNewUser ?? s.needsOnboarding,
        }));
      },

      setUser: (user) => set({ user }),

      completeOnboarding: () => set({ needsOnboarding: false }),

      signOut: async ({ remote = true } = {}) => {
        const { tokens } = get();
        await Promise.allSettled([...signOutHandlers].map((h) => h()));
        if (remote && tokens) await authApi.logout(tokens.refreshToken).catch(() => {});
        await sessionStorage.clear();
        queryClient.clear();
        set({ tokens: null, user: null, status: 'signedOut', needsOnboarding: false });
      },
    }),
    {
      name: 'auth',
      storage: zustandStorage,
      // Tokens are never written to MMKV.
      partialize: (s) => ({ user: s.user, needsOnboarding: s.needsOnboarding }),
    },
  ),
);

registerAuthHooks({
  getAccessToken: () => useAuth.getState().tokens?.accessToken ?? null,
  refresh: async () => {
    const { tokens, setSession, signOut } = useAuth.getState();
    if (!tokens) return null;
    try {
      const session = await authApi.refresh(tokens.refreshToken);
      await setSession({ ...session, isNewUser: undefined });
      return session.accessToken;
    } catch (e) {
      // Only drop the session when the backend rejects it, not on a flaky network.
      if (isApiError(e) && !e.isNetworkError) await signOut({ remote: false });
      return null;
    }
  },
});
