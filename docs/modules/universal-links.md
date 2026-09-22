# Opt-in: Universal links / App Links (https deep links)

Custom-scheme links (`myapp://item/42`) work out of the box. Use https links when links are shared publicly or emailed (magic links), since they open the app if installed and your website otherwise.

1. `app.config.ts`:
   ```ts
   ios: { associatedDomains: ['applinks:example.com'] },
   android: {
     intentFilters: [{
       action: 'VIEW',
       autoVerify: true,
       data: [{ scheme: 'https', host: 'example.com', pathPrefix: '/' }],
       category: ['BROWSABLE', 'DEFAULT'],
     }],
   },
   ```
2. Host on your domain:
   - `https://example.com/.well-known/apple-app-site-association` (JSON, no extension):
     ```json
     {
       "applinks": {
         "details": [{ "appIDs": ["TEAMID.com.example.app"], "components": [{ "/": "/*" }] }]
       }
     }
     ```
   - `https://example.com/.well-known/assetlinks.json` with your package name and SHA-256 signing fingerprints (`npx eas-cli credentials`).
3. Rebuild. Expo Router maps `https://example.com/item/42` to `src/app/(app)/item/[id].tsx` automatically.
4. Rewrite legacy paths in `src/app/+native-intent.tsx`.
5. Magic links: have the backend email `https://example.com/auth/callback?token=…`.
