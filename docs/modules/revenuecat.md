# Opt-in: RevenueCat (subscriptions & in-app purchases)

```bash
npx expo install react-native-purchases react-native-purchases-ui
```

1. Create products in App Store Connect / Play Console, then add them to a RevenueCat project with entitlements (e.g. `pro`).
2. Add public SDK keys to `.env`: `EXPO_PUBLIC_RC_IOS_KEY`, `EXPO_PUBLIC_RC_ANDROID_KEY`.
3. Create `src/features/purchases/`:
   ```ts
   import Purchases from 'react-native-purchases';
   export function configurePurchases(userId: string) {
     Purchases.configure({
       apiKey:
         Platform.OS === 'ios'
           ? process.env.EXPO_PUBLIC_RC_IOS_KEY!
           : process.env.EXPO_PUBLIC_RC_ANDROID_KEY!,
       appUserID: userId, // your backend user id, so purchases follow the account
     });
   }
   ```
   Call it after sign-in, and `Purchases.logOut()` in an `onBeforeSignOut` handler.
4. Read entitlements with a TanStack query (`Purchases.getCustomerInfo()`) and show the paywall with `RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'pro' })`.
5. Point RevenueCat webhooks at your backend so the server knows who is subscribed.
6. Rebuild the dev client. Purchases don't work in Expo Go.
