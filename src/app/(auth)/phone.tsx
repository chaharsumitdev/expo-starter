import { router } from 'expo-router';
import { type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, getDefaultCountry, PhoneInput, Screen, Text } from '@/components/ui';
import { authConfig, useRequestOtp } from '@/features/auth';
import { getErrorMessage } from '@/lib/errors';

export default function PhoneScreen() {
  const { t } = useTranslation();
  const [country, setCountry] = useState<CountryCode>(() =>
    getDefaultCountry(authConfig.phone.defaultCountry),
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const requestOtp = useRequestOtp();

  const submit = () => {
    const phone = parsePhoneNumberFromString(value, country);
    if (!phone?.isValid()) return setError(t('auth.invalidPhone'));
    setError(undefined);
    const destination = phone.number; // E.164
    requestOtp.mutate(
      { channel: 'sms', destination },
      {
        onSuccess: ({ requestId, resendIn }) =>
          router.push({
            pathname: '/verify-otp',
            params: { requestId, destination, channel: 'sms', resendIn: String(resendIn) },
          }),
        onError: (e) => setError(getErrorMessage(e)),
      },
    );
  };

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="pt-16">
      <Text variant="title">{t('auth.phoneTitle')}</Text>
      <Text variant="caption">{t('auth.phoneSubtitle')}</Text>
      <PhoneInput
        country={country}
        onCountryChange={setCountry}
        value={value}
        onChangeText={setValue}
        error={error}
        placeholder={t('auth.phonePlaceholder')}
        autoFocus
      />
      <Button title={t('common.continue')} loading={requestOtp.isPending} onPress={submit} />
    </Screen>
  );
}
