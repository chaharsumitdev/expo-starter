/// <reference types="jest" />

// Native modules that have no JS fallback in the Jest environment.
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (k: string) => store.get(k),
      set: (k: string, v: string) => store.set(k, String(v)),
      remove: (k: string) => store.delete(k),
      clearAll: () => store.clear(),
    }),
  };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: async (k: string) => store.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => void store.set(k, v),
    deleteItemAsync: async (k: string) => void store.delete(k),
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: () => () => {},
  fetch: async () => ({ isConnected: true }),
}));
