import { Uniwind } from 'uniwind';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

/** Example of a persisted client-state store. Add app-wide preferences here. */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        Uniwind.setTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'preferences',
      storage: zustandStorage,
      onRehydrateStorage: () => (state) => {
        if (state) Uniwind.setTheme(state.theme);
      },
    },
  ),
);
