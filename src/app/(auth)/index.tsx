import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { AppleSignInButton } from '@/features/auth/components/apple-sign-in-button';
import { isProviderEnabled, useGoogleSignIn } from '@/features/auth';
import { env } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';

export default function SignInScreen() {
  const { t } = useTranslation();
  const google = useGoogleSignIn();

  const onGoogle = () =>
    google.mutate(undefined, { onError: (e) => Alert.alert(getErrorMessage(e)) });

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="justify-end gap-3 pb-8">
      <View className="flex-1 justify-center gap-2">
        <Text variant="title">{t('auth.welcome')}</Text>
        <Text variant="caption">{t('auth.subtitle')}</Text>
      </View>

      {isProviderEnabled('apple') ? <AppleSignInButton /> : null}
      {isProviderEnabled('google') ? (
        <Button
          variant="outline"
          title={t('auth.continueWithGoogle')}
          loading={google.isPending}
          onPress={onGoogle}
        />
      ) : null}
      {isProviderEnabled('phone') ? (
        <Button title={t('auth.continueWithPhone')} onPress={() => router.push('/phone')} />
      ) : null}
      {isProviderEnabled('email') ? (
        <Button
          variant="secondary"
          title={t('auth.continueWithEmail')}
          onPress={() => router.push('/email-sign-in')}
        />
      ) : null}
      {isProviderEnabled('email_otp') ? (
        <Link href={{ pathname: '/email-passwordless', params: { mode: 'otp' } }} asChild>
          <Button variant="ghost" title={t('auth.emailCode')} />
        </Link>
      ) : null}
      {isProviderEnabled('magic_link') ? (
        <Link href={{ pathname: '/email-passwordless', params: { mode: 'link' } }} asChild>
          <Button variant="ghost" title={t('auth.magicLink')} />
        </Link>
      ) : null}

      {env.apiMock ? (
        <Text variant="caption" className="text-center">
          {t('auth.mockHint')}
        </Text>
      ) : null}
    </Screen>
  );
}
