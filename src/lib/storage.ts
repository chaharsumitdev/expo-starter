import { createMMKV } from 'react-native-mmkv';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/** Fast synchronous key-value storage for non-sensitive data. Tokens go in SecureStore instead. */
export const storage = createMMKV({ id: 'app' });

const mmkvStateStorage: StateStorage = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => {
    storage.remove(key);
  },
};

/** Pass to zustand `persist({ storage: zustandStorage })`. */
export const zustandStorage = createJSONStorage(() => mmkvStateStorage);
