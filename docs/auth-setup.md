# Auth setup

Choose sign-in methods per app (and per environment) with one variable:

```bash
EXPO_PUBLIC_AUTH_PROVIDERS=phone,google,apple,email,email_otp,magic_link
```

Only enabled methods are shown on the sign-in screen. Google/Apple native config is only added to the build when enabled. After changing this variable, rebuild the native app (`pnpm ios` / `pnpm android`) because config plugins are involved.

Test all flows without a backend: `EXPO_PUBLIC_API_MOCK=true` (code `000000`, any password ≥ 8 chars).

## Phone OTP / email OTP / magic link

Nothing to configure in the app. Your backend sends codes and emails (see `backend-contract.md`).
Defaults (country, code length) are in `src/features/auth/config.ts`.

## Google

1. In Google Cloud Console → APIs & Services → Credentials, create OAuth client IDs:
   - **Web application**: this is `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and the audience your backend verifies.
   - **iOS**: bundle id from `app.config.ts` (each variant gets its own: `.dev`, `.preview`, none). This is `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
   - **Android**: package name + SHA-1. Get SHA-1 from `npx eas-cli credentials` (EAS builds) and from `cd android && ./gradlew signingReport` (local debug builds). Add one Android client per SHA-1. Also add the Play App Signing SHA-1 from the Play Console for store builds.
2. Put both IDs in `.env` (or EAS env vars) and rebuild.

## Apple (iOS only)

1. Apple Developer → Identifiers → your App ID → enable **Sign in with Apple** (EAS does this automatically when it manages credentials).
2. That's it for the app. The button only appears on iOS devices that support it.
3. Backend: verify `identityToken` (audience = bundle id), handle the nonce, store name/email from the first sign-in.

> **App Store rule 4.8:** if an iOS app offers Google (or any third-party) sign-in, it must also offer Sign in with Apple. Keep `apple` enabled whenever `google` is.

## Adding another method (e.g. Facebook, passkeys)

1. Add an adapter in `src/features/auth/providers/<name>.ts` returning a credential.
2. Add an exchange call in `src/features/auth/api.ts` and a hook in `hooks.ts` using `useSessionMutation`.
3. Add its id to `AUTH_PROVIDERS` in `src/lib/env.ts` and a button in `src/app/(auth)/index.tsx`.
