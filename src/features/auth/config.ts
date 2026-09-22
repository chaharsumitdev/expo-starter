import { Platform } from 'react-native';

import { env, type AuthProviderId } from '@/lib/env';

/**
 * Which sign-in methods are offered comes from EXPO_PUBLIC_AUTH_PROVIDERS (per env / EAS profile).
 * Non-secret behaviour lives here.
 */
export const authConfig = {
  phone: {
    /** ISO country used when the number has no + prefix. */
    defaultCountry: 'US' as const,
  },
  otp: {
    length: 6,
  },
};

export function isProviderEnabled(id: AuthProviderId) {
  if (!env.authProviders.includes(id)) return false;
  // Apple sign-in is native on iOS only; hidden on Android/web.
  if (id === 'apple') return Platform.OS === 'ios';
  if (id === 'google') return Platform.OS !== 'web';
  return true;
}
