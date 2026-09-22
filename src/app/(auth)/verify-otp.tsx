import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, OtpInput, Screen, Text } from '@/components/ui';
import { authConfig, useRequestOtp, useVerifyOtp } from '@/features/auth';
import type { OtpChannel } from '@/features/auth/types';
import { env } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    requestId: string;
    destination: string;
    channel: OtpChannel;
    resendIn?: string;
  }>();
  const [requestId, setRequestId] = useState(params.requestId);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [cooldown, setCooldown] = useState(Number(params.resendIn ?? 30));

  const verify = useVerifyOtp();
  const resend = useRequestOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // On success the auth guard swaps (auth) for (app) automatically.
  const submit = (value = code) =>
    verify.mutate(
      { requestId, code: value },
      {
        onError: (e) => {
          setError(getErrorMessage(e));
          setCode('');
        },
      },
    );

  const onResend = () =>
    resend.mutate(
      { channel: params.channel, destination: params.destination },
      {
        onSuccess: (res) => {
          setRequestId(res.requestId);
          setCooldown(res.resendIn);
          setError(undefined);
        },
        onError: (e) => setError(getErrorMessage(e)),
      },
    );

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="pt-16">
      <Text variant="title">{t('auth.otpTitle')}</Text>
      <Text variant="caption">{t('auth.otpSubtitle', { destination: params.destination })}</Text>
      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          setError(undefined);
        }}
        onComplete={submit}
        length={authConfig.otp.length}
        error={!!error}
      />
      {error ? <Text variant="error">{error}</Text> : null}
      {env.apiMock ? <Text variant="caption">{t('auth.mockHint')}</Text> : null}
      <Button
        title={t('common.continue')}
        loading={verify.isPending}
        disabled={code.length < authConfig.otp.length}
        onPress={() => submit()}
      />
      <Button
        variant="ghost"
        title={cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
        disabled={cooldown > 0}
        loading={resend.isPending}
        onPress={onResend}
      />
    </Screen>
  );
}
