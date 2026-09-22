# Builds reference

The README covers the everyday commands. This page covers how local EAS builds work, their limits, and fixes for common failures.

## Which build do I need?

| Need                                                  | Use                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| Develop on my simulator/phone with Metro              | `pnpm ios` / `pnpm android`                                |
| Dev client on someone else's device, or without Xcode | `pnpm build:dev:ios` / `:android`                          |
| Share with testers, real API, no Metro                | `pnpm build:preview:ios` / `:android`                      |
| Check the exact release build before shipping         | `pnpm build:prod:ios` / `:android`                         |
| Ship to the stores                                    | `pnpm release:cloud` (or local prod + `eas submit --path`) |

`pnpm ios` (`expo run:ios`) compiles with Xcode directly and never talks to EAS. `eas build --local` runs the EAS build pipeline on your Mac: it resolves the `eas.json` profile, downloads signing credentials from EAS, runs prebuild, and produces a signed artifact.

## Profiles (`eas.json`)

| Profile                 | Variant       | Output                     | Distribution      |
| ----------------------- | ------------- | -------------------------- | ----------------- |
| `development`           | `development` | iOS `.ipa`, Android `.apk` | internal (ad hoc) |
| `development-simulator` | `development` | iOS simulator `.tar.gz`    | simulator         |
| `preview`               | `preview`     | iOS `.ipa`, Android `.apk` | internal (ad hoc) |
| `production`            | `production`  | iOS `.ipa`, Android `.aab` | stores            |

`preview` and `production` set `EXPO_PUBLIC_API_MOCK=false`. OTA updates (`pnpm update:*`) set the same variables in the script, because `eas update` doesn't read build profile `env`.

## What a local build includes

- Your working tree, including uncommitted changes, minus anything in `.gitignore` (and `.easignore` if you add one).
- `.env` is included. `.env.local` is not. Put build-time values in `.env` or the profile's `env` block.
- EAS environment variables with "Secret" visibility are not available locally. Export them in your shell before building.

## Limitations of `--local`

- One platform per run (`-p all` isn't supported). That's why there are separate `:ios` and `:android` scripts.
- The `node`, `pnpm`, `image`, `cocoapods` and `ndk` fields in `eas.json` are ignored. Your Mac's installed versions are used. Those fields only apply to cloud builds.
- No build cache. Each build does a fresh prebuild and pod install.
- macOS or Linux only. iOS needs macOS with Xcode, CocoaPods and fastlane.

## Credentials

- EAS stores signing credentials and the local build downloads them. The first iOS build asks for your Apple ID to create certificates and profiles. Android generates an upload keystore on the first build.
- `eas credentials` shows or manages them.
- Ad hoc iOS builds only install on registered devices: `eas device:create`, then rebuild so the profile includes the device.
- Google Sign-In on Android needs the SHA-1 of the keystore that signed the build. Get it with `eas credentials -p android` and add it to the Google Cloud OAuth client (see `docs/auth-setup.md`). Play Store installs are re-signed by Google, so also add the SHA-1 from Play Console → App integrity.

## Debugging a failed local build

```bash
EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_LOCAL_BUILD_WORKINGDIR=$PWD/.eas-build pnpm build:sim
```

This keeps the working directory. Xcode logs are in `.eas-build/logs`. Delete `.eas-build` afterwards.

| Error                                                  | Fix                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `fastlane: command not found`                          | `brew install fastlane`                                         |
| `Unicode Normalization not appropriate for ASCII-8BIT` | `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`                    |
| `SDK location not found`                               | `export ANDROID_HOME=$HOME/Library/Android/sdk`                 |
| Java version errors                                    | `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`              |
| `Project … does not exist` / not linked                | `eas login` and `pnpm eas:init`                                 |
| iOS app won't install on a phone                       | Register it with `eas device:create` and rebuild                |
| Simulator build won't install on a device              | `development-simulator` is simulator-only. Use `build:dev:ios`. |

## Cloud usage

Only `pnpm release:cloud` and the manual `.eas/workflows/release.yml` run builds on EAS servers. CI runs on GitHub Actions. On the free plan, builds stop when the monthly quota runs out (no charges) and it resets on the 1st. Local builds keep working regardless.

## Expected warnings

These appear in every local iOS build and need no action. They come from React Native, Expo and CocoaPods, in the generated `ios/` folder.

| Log line                                                             | Why                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ignoring duplicate libraries: '-lc++'`                              | Several RN pods link libc++. Xcode's linker warns and de-duplicates.                                          |
| `Script has ambiguous dependencies … Strip Local Network Keys`       | expo-dev-launcher's build phase runs on every build by design.                                                |
| `Unable to determine whether to build React-jsinspector as a module` | The app and the widget extension target want different module settings. CocoaPods picks a safe default.       |
| `<Pod> has added N script phases. Please inspect`                    | CocoaPods notice for Expo/RN pods that ship build scripts.                                                    |
| `NODE_ENV environment variable is required … mode-specific .env`     | EAS evaluates the config outside Expo CLI, so `.env.development`-style files are skipped. `.env` still loads. |

A real failure ends the build with `Build failed` and an error. Warnings don't.
