# Opt-in: Product analytics

Pick one:

- **PostHog** (open source, feature flags + session replay): `npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization`
- **Amplitude**: `npx expo install @amplitude/analytics-react-native @react-native-async-storage/async-storage`
- **Firebase Analytics**: needs `@react-native-firebase/app` + config plugin and `GoogleService-Info.plist` / `google-services.json`.

Pattern (keeps the vendor swappable): create `src/lib/analytics.ts`

```ts
export const analytics = {
  identify: (userId: string, traits?: Record<string, unknown>) => {
    /* vendor call */
  },
  track: (event: string, props?: Record<string, unknown>) => {
    /* vendor call */
  },
  screen: (name: string) => {
    /* vendor call */
  },
  reset: () => {
    /* vendor call */
  },
};
```

- Screen tracking: in `src/app/_layout.tsx`, `const pathname = usePathname(); useEffect(() => analytics.screen(pathname), [pathname]);`
- `identify` after sign-in, `reset` in an `onBeforeSignOut` handler.
- iOS: if you track across apps/sites, add `expo-tracking-transparency` and request permission first. The `NSUserTrackingUsageDescription` string is already in `src/locales/*/native.json`.
