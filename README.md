# Expo Starter

A starter template for React Native apps with everything already set up: Expo SDK 57, Expo Router, auth, i18n, push notifications, data fetching and styling. Clone it, rename it, and start building features.

## New app in 5 minutes

```bash
pnpm create expo-app my-app --template https://github.com/chaharsumitdev/expo-starter
cd my-app
pnpm rename --name "My App" --bundle-id com.me.myapp
npx eas-cli@latest init          # links EAS project (needed for push + updates)
pnpm ios                         # builds the dev client and runs it
```

With `EXPO_PUBLIC_API_MOCK=true` (default in `.env`) the whole app works without a backend. The OTP code is `000000`.

Then:

1. Set brand colors in `src/global.css`, and replace icons/splash in `assets/images`.
2. Point `EXPO_PUBLIC_API_URL` at your API, set `EXPO_PUBLIC_API_MOCK=false`, and match `docs/backend-contract.md`.
3. Choose sign-in methods with `EXPO_PUBLIC_AUTH_PROVIDERS` (see `docs/auth-setup.md`).

## Stack

| Area                | Library                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| Routing, deep links | Expo Router (typed routes, `Stack.Protected`, NativeTabs)                           |
| Styling             | Uniwind (Tailwind v4). Tokens in `src/global.css`, light/dark                       |
| Client state        | Zustand, persisted with MMKV                                                        |
| Server state        | TanStack Query v5 (refetch on focus/reconnect)                                      |
| API                 | `fetch` client with bearer auth, single-flight token refresh, mock mode             |
| Auth                | Your backend. Phone OTP, Google, Apple (iOS), email+password, email OTP, magic link |
| i18n                | i18next + expo-localization, typed keys, RTL, `Intl` formatting                     |
| Push                | expo-notifications (Expo push tokens), tap opens a deep link                        |
| Animation           | Reanimated 4 + worklets, Gesture Handler                                            |
| UI                  | expo-image, FlashList v2, keyboard-controller, @expo/ui, expo-haptics               |
| Forms               | react-hook-form + zod                                                               |
| Widgets             | expo-widgets (iOS home screen)                                                      |
| Quality             | TypeScript strict, ESLint, Prettier, lefthook, Jest + RNTL                          |
| Shipping            | EAS Build/Submit/Update, dev/preview/prod variants, EAS Workflows CI                |
| AI tooling          | Argent MCP (drives simulators), Expo MCP plugin, CLAUDE.md / AGENTS.md              |

## Project layout

```
src/
  app/                  routes only (Expo Router)
    _layout.tsx         providers + auth guard
    (auth)/             sign-in flows, shown when signed out
    (app)/              signed-in area: onboarding, (tabs), item/[id], modal
    auth/callback.tsx   magic-link deep link target
  components/ui/        design system (Button, Text, Input, Screen, OtpInput, PhoneInput…)
  features/<name>/      api + hooks + store + components per feature
  lib/                  api client, env, storage, i18n, notifications, query client
  locales/<lang>/       translation.json (in-app) + native.json (app name, permission text)
  stores/               global zustand stores
  widgets/              iOS widgets
docs/                   backend contract, auth setup, opt-in modules
```

## Scripts

|                             |                                       |
| --------------------------- | ------------------------------------- |
| `pnpm start`                | Metro for the dev client              |
| `pnpm ios` / `pnpm android` | Build and run the dev client          |
| `pnpm check`                | typecheck + lint + test               |
| `pnpm rename`               | Set app name, bundle id, scheme, slug |
| `pnpm doctor`               | expo-doctor                           |

## Variants

`APP_VARIANT=development|preview|production` (set per profile in `eas.json`) changes the bundle id (`.dev`, `.preview`), app name and URL scheme, so all three can be installed side by side.

```bash
npx eas-cli build --profile development   # dev client for devices
npx eas-cli build --profile preview       # internal testing
npx eas-cli build --profile production    # store
npx eas-cli update --channel production   # OTA JS update
```

## Deep links

- `<scheme>://item/42` opens `src/app/(app)/item/[id].tsx`. The dev scheme is `expostarter-dev`.
- Test on the simulator: `xcrun simctl openurl booted "expostarter-dev://item/42"`
- Push notifications with `data.url` open that route.
- https links: `docs/modules/universal-links.md`.

## Adding a language

1. Add `src/locales/<code>/translation.json` and `native.json`. A test fails if keys drift from `en`.
2. Register it in `src/lib/i18n/resources.ts`.
3. Add it to `locales` and `supportedLocales` in `app.config.ts`, then rebuild.

RTL languages flip the layout automatically. Switching between LTR and RTL in-app reloads the JS. Native headers and the tab bar pick up the new direction on the next cold start. Use `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-` classes, not `ml-`/`mr-`/`left-`/`right-`, and leave text alignment at its default.

## Opt-in modules

Documented but not installed: [Sentry](docs/modules/sentry.md), [RevenueCat](docs/modules/revenuecat.md), [Maestro](docs/modules/maestro.md), [Analytics](docs/modules/analytics.md), [Universal links](docs/modules/universal-links.md).

## Notes

- Uses a development build, not Expo Go (Google Sign-In, MMKV, widgets are native).
- `ios/` and `android/` are generated (CNG) and git-ignored. Change native config in `app.config.ts`.
- pnpm uses `node-linker=hoisted` (`.npmrc`) for maximum React Native library compatibility.
- If `pod install` fails with a Unicode error, run `export LANG=en_US.UTF-8`.
