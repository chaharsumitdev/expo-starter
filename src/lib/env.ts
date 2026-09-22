import Constants from 'expo-constants';
import { z } from 'zod';

const AUTH_PROVIDERS = ['phone', 'google', 'apple', 'email', 'email_otp', 'magic_link'] as const;
export type AuthProviderId = (typeof AUTH_PROVIDERS)[number];

const schema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_API_MOCK: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  EXPO_PUBLIC_AUTH_PROVIDERS: z
    .string()
    .default('phone')
    .transform((v) =>
      v
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.enum(AUTH_PROVIDERS))),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().optional(),
});

// EXPO_PUBLIC_* vars are only inlined when accessed statically, so list them explicitly.
const parsed = schema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_API_MOCK: process.env.EXPO_PUBLIC_API_MOCK,
  EXPO_PUBLIC_AUTH_PROVIDERS: process.env.EXPO_PUBLIC_AUTH_PROVIDERS,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = {
  apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/$/, ''),
  apiMock: parsed.data.EXPO_PUBLIC_API_MOCK,
  authProviders: parsed.data.EXPO_PUBLIC_AUTH_PROVIDERS,
  googleWebClientId: parsed.data.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: parsed.data.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  variant: (Constants.expoConfig?.extra?.variant ?? 'development') as
    'development' | 'preview' | 'production',
  easProjectId: Constants.expoConfig?.extra?.eas?.projectId as string | undefined,
};
