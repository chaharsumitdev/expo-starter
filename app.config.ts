import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * ─── Per-app identity ────────────────────────────────────────────────────────
 * `pnpm rename` rewrites this block. Everything else derives from it.
 */
const APP = {
  name: 'Expo Starter',
  slug: 'expo-starter',
  scheme: 'expostarter',
  bundleId: 'com.example.expostarter',
  easProjectId: '', // set by `eas init`
  owner: undefined as string | undefined,
};

/** dev / preview / production — selected by APP_VARIANT (set per profile in eas.json). */
type Variant = 'development' | 'preview' | 'production';
const variant = (process.env.APP_VARIANT ?? 'development') as Variant;

const VARIANTS: Record<Variant, { suffix: string; nameSuffix: string }> = {
  development: { suffix: '.dev', nameSuffix: ' (Dev)' },
  preview: { suffix: '.preview', nameSuffix: ' (Preview)' },
  production: { suffix: '', nameSuffix: '' },
};

const { suffix, nameSuffix } = VARIANTS[variant];
const bundleId = `${APP.bundleId}${suffix}`;
const scheme = `${APP.scheme}${suffix.replace('.', '-')}`;

/** Auth providers are toggled by env so native config is only added when needed. */
const authProviders = (process.env.EXPO_PUBLIC_AUTH_PROVIDERS ?? 'phone,google,apple')
  .split(',')
  .map((p: string) => p.trim());
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleEnabled = authProviders.includes('google');
const appleEnabled = authProviders.includes('apple');

/** Reversed iOS client id, required by Google Sign-In as a URL scheme. */
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace('.apps.googleusercontent.com', '')}`
  : 'com.googleusercontent.apps.REPLACE_ME';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `${APP.name}${nameSuffix}`,
  slug: APP.slug,
  owner: APP.owner,
  scheme,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  runtimeVersion: { policy: 'appVersion' },
  updates: APP.easProjectId ? { url: `https://u.expo.dev/${APP.easProjectId}` } : undefined,
  ios: {
    bundleIdentifier: bundleId,
    icon: './assets/expo.icon',
    supportsTablet: true,
    usesAppleSignIn: appleEnabled,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    // Universal links: see docs/modules/universal-links.md
    // associatedDomains: ['applinks:example.com'],
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  locales: {
    // Localized app name / permission strings shown by the OS.
    en: './src/locales/en/native.json',
    ar: './src/locales/ar/native.json',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
        dark: { backgroundColor: '#0A0A0A' },
      },
    ],
    'expo-secure-store',
    [
      'expo-localization',
      // RTL is managed in JS (src/lib/i18n) so an in-app language choice can override the device.
      { supportedLocales: { ios: ['en', 'ar'], android: ['en', 'ar'] } },
    ],
    [
      'expo-notifications',
      {
        color: '#2563EB',
        // icon: './assets/images/notification-icon.png', // Android: 96x96 white-on-transparent
      },
    ],
    [
      'expo-widgets',
      {
        widgets: [
          {
            name: 'StatsWidget',
            displayName: APP.name,
            description: 'Glanceable stats from the app',
            ios: { supportedFamilies: ['systemSmall', 'systemMedium'] },
          },
        ],
      },
    ],
    ...(googleEnabled
      ? ([['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]] as [
          string,
          object,
        ][])
      : []),
    ...(appleEnabled ? ['expo-apple-authentication'] : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    variant,
    eas: APP.easProjectId ? { projectId: APP.easProjectId } : undefined,
  },
});
