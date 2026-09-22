import * as SecureStore from 'expo-secure-store';

import type { Session } from './types';

/** Only tokens go to the keychain/keystore. The user profile is kept in the (persisted) auth store. */
export type Tokens = Pick<Session, 'accessToken' | 'refreshToken' | 'expiresAt'>;

const KEY = 'auth.tokens';

export const sessionStorage = {
  async load(): Promise<Tokens | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  },
  save: (tokens: Tokens) => SecureStore.setItemAsync(KEY, JSON.stringify(tokens)),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
