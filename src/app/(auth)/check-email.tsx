import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Screen, Text } from '@/components/ui';
import { env } from '@/lib/env';

export default function CheckEmailScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <Screen edges={['top', 'bottom']} contentClassName="justify-center">
      <Text variant="title">{t('auth.checkEmailTitle')}</Text>
      <Text variant="caption">{t('auth.checkEmailSubtitle', { email })}</Text>
      {env.apiMock ? (
        // Simulates tapping the emailed link.
        <Button
          variant="secondary"
          title="Mock: open magic link"
          onPress={() => router.push({ pathname: '/auth/callback', params: { token: 'demo' } })}
        />
      ) : null}
      <Button variant="ghost" title={t('auth.backToSignIn')} onPress={() => router.dismissAll()} />
    </Screen>
  );
}
