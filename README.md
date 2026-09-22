# Expo Starter

A starter template for React Native apps with everything already set up: Expo SDK 57, Expo Router, auth, i18n, push notifications, data fetching and styling. Clone it, rename it, and start building features.

## New app in 5 minutes

```bash
gh repo create my-app --template chaharsumitdev/expo-starter --private --clone
cd my-app
pnpm install
pnpm rename --name "My App" --bundle-id com.me.myapp
eas login && pnpm eas:init  # links an EAS project (needed for push, updates and EAS builds)
pnpm ios                         # builds the dev client on your Mac and runs it
```

Use `gh repo create --template` (or "Use this template" on GitHub), not `create-expo-app --template`, which drops dotfiles like `.env`, `.npmrc` and `.eas/`.

With `EXPO_PUBLIC_API_MOCK=true` (default in `.env`) the whole app works without a backend. The OTP code is `000000`.

Then:

1. Set brand colors in `src/global.css`, and replace icons/splash in `assets/images`.
2. Point `EXPO_PUBLIC_API_URL` at your API, set `EXPO_PUBLIC_API_MOCK=false`, and match `docs/backend-contract.md`.
3. Choose sign-in methods with `EXPO_PUBLIC_AUTH_PROVIDERS` (see `docs/auth-setup.md`).

## Build rule: local by default, cloud only for production

Everything during development builds **on your Mac** and costs nothing. The Expo free plan's monthly cloud build quota is kept for store releases.

| What                                          | Command                                      | Where it builds      | Uses EAS quota          |
| --------------------------------------------- | -------------------------------------------- | -------------------- | ----------------------- |
| Daily development (simulator / cabled device) | `pnpm ios` · `pnpm android`                  | Your Mac             | No                      |
| Installable builds (devices, testers, QA)     | `pnpm build:*`                               | Your Mac (`--local`) | No                      |
| JS-only fix to a shipped app                  | `pnpm update:prod`                           | No build (OTA)       | No (counts update MAU)  |
| Store release                                 | `pnpm release:cloud` → `pnpm release:submit` | EAS cloud            | **Yes, 1 per platform** |

Never run a bare `eas build`: without `--local` it runs in the cloud. Use the scripts.

## Prerequisites (one time per machine)

| Tool                       | Why                                 | Install                                                                         |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| Node 22, pnpm 10, Watchman | JS tooling                          | `brew install node@22 watchman`, `corepack enable`                              |
| Xcode + CocoaPods          | iOS builds                          | App Store, then `xcode-select --install` and `brew install cocoapods`           |
| fastlane                   | iOS `eas build --local` only        | `brew install fastlane`                                                         |
| JDK 17 + Android Studio    | Android builds (SDK, NDK, emulator) | `brew install openjdk@17`, Android Studio → SDK Manager                         |
| EAS CLI + Expo account     | `eas build --local`, push, updates  | `npm i -g eas-cli`, then `eas login` (not needed for `pnpm ios`/`pnpm android`) |
| Apple Developer account    | Device and store iOS builds         | Not needed for the simulator                                                    |

Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8   # CocoaPods and fastlane fail without a UTF-8 locale
```

## Development workflow

### Every day

```bash
pnpm start          # Metro. Open the already-installed dev app on the simulator/device.
```

JS and style changes hot-reload. In the Metro terminal: `i` opens iOS, `a` Android, `r` reloads, `j` opens React Native DevTools, `m` the dev menu.

### When to rebuild the app

The dev app contains the native code. Rebuild it (`pnpm ios` / `pnpm android`) only when native code changes:

- you installed a package that has native code (`npx expo install <pkg>`)
- you changed `app.config.ts` (plugins, permissions, bundle id, scheme, icons, splash)
- you upgraded the Expo SDK

If a config change doesn't show up, regenerate the native projects: `npx expo prebuild --clean`, then `pnpm ios`. `ios/` and `android/` are generated and git-ignored, so this is always safe.

For everything else, just keep Metro running.

### Targets

```bash
pnpm ios                      # iOS simulator
pnpm ios --device             # cabled iPhone (pick from the list; needs signing in Xcode once)
pnpm android                  # running emulator, or starts one
pnpm android --device         # cabled Android phone with USB debugging on
```

### Env and backend

- `.env` is committed and holds shared defaults (mock API on).
- `.env.local` is git-ignored. Put personal overrides there, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000` and `EXPO_PUBLIC_API_MOCK=false` to hit your local backend. Restart Metro after changes.
- A physical device can't reach `localhost` on your Mac. Use the Mac's LAN IP.

### Before committing

`pnpm check` runs typecheck, lint and tests. lefthook runs the same on `git commit`, and GitHub Actions runs it on PRs (free, no EAS usage).

### Debugging

- `j` in Metro opens DevTools (console, components, network, profiler).
- The Argent MCP server lets AI agents tap, type and screenshot the simulator. See `AGENTS.md`.
- Deep links: `xcrun simctl openurl booted "expostarter-dev://item/42"`.

## Local builds (`eas build --local`)

Same build process as the EAS cloud, run on your Mac. Use it when you need an installable app that isn't tied to Metro on your machine: a dev client on a teammate's phone, a preview build for testers, or checking a release build before shipping. Needs `eas login` and a linked project (`pnpm eas:init`).

| Script                       | Output                                      | Install it                                                          |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm build:sim`             | `build/*.tar.gz` (iOS simulator dev client) | `eas build:run -p ios --path build/<file>.tar.gz`                   |
| `pnpm build:dev:ios`         | `build/*.ipa` (device dev client)           | `xcrun devicectl device install app --device <id> build/<file>.ipa` |
| `pnpm build:dev:android`     | `build/*.apk`                               | `adb install build/<file>.apk`                                      |
| `pnpm build:preview:ios`     | `build/*.ipa` (internal, real API)          | same as dev iOS                                                     |
| `pnpm build:preview:android` | `build/*.apk` (internal, real API)          | `adb install`, or share the file                                    |
| `pnpm build:prod:ios`        | `build/*.ipa` (App Store signed)            | `eas submit -p ios --path build/<file>.ipa`                         |
| `pnpm build:prod:android`    | `build/*.aab` (Play signed)                 | `eas submit -p android --path build/<file>.aab`                     |

Notes:

- iOS device builds (`development`, `preview`) use ad hoc provisioning. Register each iPhone once with `eas device:create`, then rebuild. `xcrun devicectl list devices` shows device ids.
- Signing credentials are managed by EAS and downloaded for the local build. The first iOS build asks you to log in to your Apple account.
- The build uses your working tree, including uncommitted changes, but **not git-ignored files**. `.env.local` is not included. Build-time values go in `.env` or the profile's `env` in `eas.json`.
- A local build takes 5–15 minutes and builds one platform at a time. See `docs/builds.md` for limitations and troubleshooting.

## Releasing to the stores

1. Test a production-like build locally first: `pnpm build:preview:ios` / `pnpm build:preview:android`.
2. Bump `version` in `app.config.ts` for a new store version. Build numbers auto-increment remotely (`appVersionSource: remote`), for local and cloud builds alike.
3. Build in the cloud and submit:

   ```bash
   pnpm release:cloud        # production builds for iOS + Android on EAS (2 builds of your quota)
   pnpm release:submit       # uploads the latest builds to App Store Connect / Google Play
   ```

   Out of quota, or want zero usage? Build locally and submit the file:

   ```bash
   pnpm build:prod:ios && eas submit -p ios --path build/<file>.ipa
   pnpm build:prod:android && eas submit -p android --path build/<file>.aab
   ```

4. JS-only fixes after release don't need a new build: `pnpm update:prod` ships an over-the-air update to installed apps with the same `version` (`runtimeVersion` follows the app version). Anything native (see "When to rebuild") needs a new store build.

`.eas/workflows/release.yml` automates step 3/4 (fingerprint → OTA update or cloud builds + submit). It is manual only: `eas workflow:run .eas/workflows/release.yml`.

Check your remaining build quota at expo.dev → Billing → Usage.

## Variants

`APP_VARIANT=development|preview|production` (set per profile in `eas.json`) changes the bundle id (`.dev`, `.preview`), app name and URL scheme, so all three can be installed side by side. `pnpm ios`/`pnpm android` build the development variant.

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
| Quality             | TypeScript strict, ESLint, Prettier, lefthook, Jest + RNTL, GitHub Actions CI       |
| Shipping            | EAS Build (local-first)/Submit/Update, dev/preview/prod variants                    |
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
docs/                   backend contract, auth setup, builds, opt-in modules
```

## Scripts

|                                       |                                                  |
| ------------------------------------- | ------------------------------------------------ |
| `pnpm start`                          | Metro for the dev client                         |
| `pnpm ios` / `pnpm android`           | Build the dev client locally and run it          |
| `pnpm build:<profile>:<platform>`     | Local EAS build into `build/` (see Local builds) |
| `pnpm build:sim`                      | Local iOS simulator dev client                   |
| `pnpm release:cloud`                  | **Cloud** production builds (uses quota)         |
| `pnpm release:submit`                 | Submit the latest builds to the stores           |
| `pnpm update:preview` / `update:prod` | OTA update to the preview / production channel   |
| `pnpm check`                          | typecheck + lint + test                          |
| `pnpm rename`                         | Set app name, bundle id, scheme, slug            |
| `pnpm eas:init`                       | Link an EAS project, write its id to app.config  |
| `pnpm doctor`                         | expo-doctor                                      |

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
