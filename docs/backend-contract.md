# Backend contract

What the app expects from your API. Paths live in `src/lib/api/endpoints.ts`; change them there if your API differs.

## Conventions

- JSON in, JSON out. The app sends `Accept-Language` with the user's current language (`en`, `ar`, …). Use it for server-side messages.
- Authenticated requests send `Authorization: Bearer <accessToken>`.
- Errors: any non-2xx with a body of `{ "code": "invalid_otp", "message": "Human readable, localized", "details"?: any }`. `message` is shown to the user as-is.
- On `401` the app calls `POST /auth/refresh` once (shared across concurrent requests) and retries. If refresh returns 4xx, the user is signed out.

## Session (returned by every sign-in endpoint and by refresh)

```json
{
  "accessToken": "…",
  "refreshToken": "…",
  "expiresAt": "2026-09-22T12:00:00Z",
  "user": {
    "id": "u_1",
    "name": "Ada",
    "email": "ada@example.com",
    "phone": "+15555550100",
    "avatarUrl": null
  },
  "isNewUser": true
}
```

`isNewUser: true` sends the user through onboarding. Tokens are stored in the iOS Keychain / Android Keystore.

## Auth endpoints

| Method | Path                       | Body                                             | Returns                              | Backend must                                                                                                                                                                                                                                               |
| ------ | -------------------------- | ------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/otp/request`        | `{ channel: "sms" \| "email", destination }`     | `{ requestId, expiresIn, resendIn }` | Send the code (Twilio Verify, MSG91, SES…). `destination` is E.164 for SMS. Rate-limit per destination and IP.                                                                                                                                             |
| POST   | `/auth/otp/verify`         | `{ requestId, code }`                            | Session                              | Check code + expiry, cap attempts. Create the user if new.                                                                                                                                                                                                 |
| POST   | `/auth/google`             | `{ idToken }`                                    | Session                              | Verify the ID token with Google (signature, `aud` = **web** client id, `iss`, `exp`). Use `sub` as the stable id.                                                                                                                                          |
| POST   | `/auth/apple`              | `{ identityToken, rawNonce, fullName?, email? }` | Session                              | Verify against Apple JWKS (`aud` = iOS bundle id, `iss` = `https://appleid.apple.com`), check `sha256(rawNonce) == nonce` claim. Use `sub` as the stable id. `fullName`/`email` are only sent on the user's **first** Apple sign-in, so persist them then. |
| POST   | `/auth/email/login`        | `{ email, password }`                            | Session                              |                                                                                                                                                                                                                                                            |
| POST   | `/auth/email/register`     | `{ email, password, name? }`                     | Session                              | Return `isNewUser: true`.                                                                                                                                                                                                                                  |
| POST   | `/auth/password/forgot`    | `{ email }`                                      | 204                                  | Always 204 (don't reveal whether the account exists).                                                                                                                                                                                                      |
| POST   | `/auth/magic-link/request` | `{ email, redirectUrl }`                         | 204                                  | Email a link to `redirectUrl?token=<one-time token>`. `redirectUrl` is the app's own deep link (e.g. `myapp://auth/callback`). Allow-list the app schemes. For best deliverability, email an `https://` link that redirects to the app.                    |
| POST   | `/auth/magic-link/verify`  | `{ token }`                                      | Session                              | Single use, short expiry.                                                                                                                                                                                                                                  |
| POST   | `/auth/refresh`            | `{ refreshToken }`                               | Session                              | Rotate refresh tokens. Reject reused ones.                                                                                                                                                                                                                 |
| POST   | `/auth/logout`             | `{ refreshToken }`                               | 204                                  | Revoke the refresh token.                                                                                                                                                                                                                                  |

### Account linking

Decide how to merge identities: same verified email via Google + Apple + email login → one user. Apple "Hide my email" relay addresses won't match; offer linking from settings if it matters.

## User

| Method | Path  | Body         | Returns                                                                                                                                       |
| ------ | ----- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/me` |              | User                                                                                                                                          |
| PATCH  | `/me` | Partial User | User                                                                                                                                          |
| DELETE | `/me` |              | 204. **Required by the App Store** for apps with account creation. Delete or anonymize data, revoke tokens and Apple tokens (`/auth/revoke`). |

## Push notifications

| Method | Path                  | Body                                      | Returns                                |
| ------ | --------------------- | ----------------------------------------- | -------------------------------------- |
| POST   | `/devices/push-token` | `{ token, platform: "ios" \| "android" }` | 204 (upsert, tied to the current user) |
| DELETE | `/devices/push-token` | `{ token }`                               | 204                                    |

Tokens are **Expo push tokens** (`ExponentPushToken[…]`). Send with the Expo Push API (`https://exp.host/--/api/v2/push/send`, SDKs for Node/Python/Go/…). Handle `DeviceNotRegistered` receipts by deleting the token.

To open a screen on tap, include a route in `data.url`:

```json
{ "to": "ExponentPushToken[…]", "title": "New message", "body": "…", "data": { "url": "/item/42" } }
```

Switching to raw APNs/FCM tokens instead: replace `getExpoPushTokenAsync` with `getDevicePushTokenAsync` in `src/lib/notifications/index.ts`.

## Example resource

`GET /items` → `Item[]`, `GET /items/:id` → `Item` where `Item = { id, title, description }`. Replace with your own. See `src/features/items/api.ts` for the query pattern.
