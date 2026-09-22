This is an Expo SDK 57 / React Native 0.86 app built from a personal starter template. Prioritize mobile-first patterns, performance and cross-platform behavior.

## Expo has changed. Do not trust your training data

Before writing code that touches an Expo, EAS or React Native API, fetch the versioned docs: `https://docs.expo.dev/versions/v57.0.0/` or the index at https://docs.expo.dev/llms.txt. Never answer from memory.

## Commands

```bash
npx expo install <pkg>   # ALWAYS instead of pnpm add for RN/Expo packages (SDK-compatible versions)
pnpm check               # typecheck + lint + test. Run before declaring a task done.
pnpm ios | pnpm android  # build + run the dev client (needed after adding native code)
pnpm start               # Metro only
```

## Architecture rules

- **Routes only in `src/app/`.** Everything else goes in `src/features/<feature>/` (api, hooks, store, components), `src/components/ui/` (shared UI), or `src/lib/` (infrastructure).
- **Imports:** always the `@/` alias. Parent-relative `../` imports are lint errors.
- **Auth guard:** `src/app/_layout.tsx` uses `Stack.Protected` driven by `useAuth().status`. Never redirect manually after sign-in/out. Update the store and the guard swaps groups.
- **Server data:** TanStack Query only. Define `queryOptions` factories per feature (see `src/features/items/api.ts`). Don't copy server data into Zustand.
- **Client state:** Zustand stores, persisted with `zustandStorage` (MMKV). Secrets/tokens go in `expo-secure-store`, never MMKV.
- **HTTP:** use `api` from `@/lib/api` and add paths to `src/lib/api/endpoints.ts`. When mocking, add handlers to `src/lib/api/mock.ts`.
- **Styling:** Uniwind `className` with the design tokens from `src/global.css` (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `rounded-card`, `rounded-control`…). No hardcoded colors. For third-party components use `withUniwind(Component)`. For color props use `*ColorClassName="accent-<token>"`, or `useCSSVariable('--color-<token>')` in JS.
- **RTL:** use logical classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`), never `ml-`/`mr-`/`left-`/`right-`. Leave text alignment at its default (it follows the layout direction); `text-left`/`text-start` pin it to the left even in RTL.
- **i18n:** every user-visible string goes through `t('…')` from `react-i18next`. Add keys to **all** `src/locales/*/translation.json` (a test enforces parity). Format numbers/dates with `format` from `@/lib/i18n`.
- **UI kit first:** use `Screen`, `Text`, `Button`, `Input`, `Card`, `Section`/`Row` from `@/components/ui` before writing new primitives.
- **Lists:** FlashList for anything scrollable with more than a handful of rows. **Images:** `expo-image`.
- **Animation:** Reanimated shared values + worklets. Use `scheduleOnRN` (react-native-worklets) to call JS from the UI thread.
- **Native config:** `ios/` and `android/` are generated. Change `app.config.ts` or config plugins, never the native folders.
- **Env:** `EXPO_PUBLIC_*` vars are validated in `src/lib/env.ts`. Add new ones there (statically referenced). They are public. No secrets.

## Device testing

The Argent MCP server (`.mcp.json`) can drive iOS simulators and Android emulators: tap, type, screenshot, profile. Use it to verify UI changes on a running dev build. Mock API mode (`EXPO_PUBLIC_API_MOCK=true`) accepts OTP `000000`.

## Docs

- `docs/backend-contract.md`: API the app expects
- `docs/auth-setup.md`: Google/Apple console setup, enabling providers
- `docs/modules/*`: opt-in integrations (Sentry, RevenueCat, Maestro, analytics, universal links)
