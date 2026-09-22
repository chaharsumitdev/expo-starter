# Opt-in: Sentry (crash & error reporting)

```bash
npx @sentry/wizard@latest -i reactNative
```

The wizard installs `@sentry/react-native`, adds the config plugin and Metro config. Then:

1. Wrap Metro: keep `withUniwindConfig` **outermost**:
   ```js
   const { getSentryExpoConfig } = require('@sentry/react-native/metro');
   const config = getSentryExpoConfig(__dirname);
   module.exports = withUniwindConfig(config, { ... });
   ```
2. In `src/app/_layout.tsx`:
   ```ts
   import * as Sentry from '@sentry/react-native';
   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     enabled: !__DEV__,
     sendDefaultPii: false,
   });
   export default Sentry.wrap(RootLayout);
   ```
3. Tag users after sign-in: `Sentry.setUser({ id: user.id })`, and `Sentry.setUser(null)` in an `onBeforeSignOut` handler.
4. Add `SENTRY_AUTH_TOKEN` as an EAS secret so source maps upload on build and `eas update`.
