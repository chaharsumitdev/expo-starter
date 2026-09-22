import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useVerifyMagicLink } from '@/features/auth';

/** Target of the emailed magic link: <scheme>://auth/callback?token=… */
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const verify = useVerifyMagicLink();
  const [failed, setFailed] = useState(!token);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token, {
      onSuccess: () => router.replace('/'),
      onError: () => setFailed(true),
    });
  }, [token, verify]);

  return (
    <Screen edges={['top', 'bottom']} contentClassName="items-center justify-center">
      {failed ? (
        <>
          <Text variant="heading" className="text-center">
            {t('auth.linkInvalid')}
          </Text>
          <Button title={t('auth.backToSignIn')} onPress={() => router.replace('/')} />
        </>
      ) : (
        <>
          <ActivityIndicator colorClassName="accent-primary" />
          <Text variant="caption">{t('auth.verifyingLink')}</Text>
        </>
      )}
    </Screen>
  );
}
