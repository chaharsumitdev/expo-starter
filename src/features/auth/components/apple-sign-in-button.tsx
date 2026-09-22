import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useUniwind } from 'uniwind';

import { getErrorMessage } from '@/lib/errors';

import { useAppleSignIn } from '@/features/auth/hooks';
import { isAppleSignInAvailable } from '@/features/auth/providers/apple';

/** Apple's own button (required by App Store guidelines). Renders nothing where unsupported. */
export function AppleSignInButton() {
  const { theme } = useUniwind();
  const [available, setAvailable] = useState(false);
  const apple = useAppleSignIn();

  useEffect(() => {
    isAppleSignInAvailable().then(setAvailable);
  }, []);

  if (!available) return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={
        theme === 'dark'
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={12}
      style={{ height: 48, opacity: apple.isPending ? 0.6 : 1 }}
      onPress={() => {
        if (apple.isPending) return;
        apple.mutate(undefined, { onError: (e) => Alert.alert(getErrorMessage(e)) });
      }}
    />
  );
}
