import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Screen, Text } from '@/components/ui';
import { authApi, useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/errors';

/** Shown once after the first sign-in (`isNewUser` from the backend). */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const completeOnboarding = useAuth((s) => s.completeOnboarding);
  const [name, setName] = useState(user?.name ?? '');

  const save = useMutation({
    mutationFn: () => authApi.updateMe({ name: name.trim() }),
    onSuccess: (updated) => {
      setUser({ ...user, ...updated });
      completeOnboarding();
    },
  });

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="justify-center">
      <Text variant="title">{t('onboarding.title')}</Text>
      <Text variant="caption">{t('onboarding.subtitle')}</Text>
      <Input
        placeholder={t('auth.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        error={save.error ? getErrorMessage(save.error) : undefined}
      />
      <Button
        title={t('onboarding.finish')}
        disabled={!name.trim()}
        loading={save.isPending}
        onPress={() => save.mutate()}
      />
    </Screen>
  );
}
