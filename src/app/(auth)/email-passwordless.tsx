import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Screen, Text } from '@/components/ui';
import { useRequestMagicLink, useRequestOtp } from '@/features/auth';
import { emailSchema } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/errors';

/** Email OTP (`mode=otp`) or magic link (`mode=link`). */
export default function EmailPasswordlessScreen() {
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams<{ mode: 'otp' | 'link' }>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const requestOtp = useRequestOtp();
  const requestLink = useRequestMagicLink();

  const submit = () => {
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) return setError(t('auth.invalidEmail'));
    setError(undefined);
    const onError = (e: unknown) => setError(getErrorMessage(e));

    if (mode === 'link') {
      requestLink.mutate(parsed.data, {
        onSuccess: () => router.push({ pathname: '/check-email', params: { email: parsed.data } }),
        onError,
      });
    } else {
      requestOtp.mutate(
        { channel: 'email', destination: parsed.data },
        {
          onSuccess: ({ requestId, resendIn }) =>
            router.push({
              pathname: '/verify-otp',
              params: {
                requestId,
                destination: parsed.data,
                channel: 'email',
                resendIn: String(resendIn),
              },
            }),
          onError,
        },
      );
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="pt-16">
      <Text variant="title">{mode === 'link' ? t('auth.magicLink') : t('auth.emailCode')}</Text>
      <Input
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        onSubmitEditing={submit}
      />
      <Button
        title={t('common.continue')}
        loading={requestOtp.isPending || requestLink.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
