# Opt-in: Maestro end-to-end tests

1. Install: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
2. Create `.maestro/sign-in.yaml` (runs against the mock API):
   ```yaml
   appId: com.example.expostarter.dev
   ---
   - launchApp: { clearState: true }
   - tapOn: 'Continue with phone'
   - inputText: '2015550123'
   - tapOn: 'Continue'
   - inputText: '000000'
   - assertVisible: 'Home'
   ```
3. Run: `maestro test .maestro/`
4. In CI: add a job to `.eas/workflows/ci.yml` using `type: maestro` with a `development-simulator` build. See https://docs.expo.dev/eas/workflows/examples/e2e-tests/

Argent can also record and replay flows (`argent flow`). Ask your AI assistant: "create a flow for sign in".
