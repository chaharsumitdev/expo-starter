import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, Input, Screen, Text } from '@/components/ui';
import { useEmailRegister } from '@/features/auth';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/errors';

export default function EmailSignUpScreen() {
  const { t } = useTranslation();
  const register = useEmailRegister();
  const { control, handleSubmit, setError, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) =>
    register.mutate(values, { onError: (e) => setError('root', { message: getErrorMessage(e) }) }),
  );

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="pt-16">
      <Text variant="title">{t('auth.signUp')}</Text>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            placeholder={t('auth.namePlaceholder')}
            value={field.value}
            onChangeText={field.onChange}
            autoComplete="name"
            textContentType="name"
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            placeholder={t('auth.emailPlaceholder')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="username"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            placeholder={t('auth.passwordPlaceholder')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={onSubmit}
          />
        )}
      />
      {formState.errors.root ? <Text variant="error">{formState.errors.root.message}</Text> : null}
      <Button title={t('auth.signUp')} loading={register.isPending} onPress={onSubmit} />
      <Link href="/email-sign-in" replace asChild>
        <Button variant="ghost" title={t('auth.haveAccount')} />
      </Link>
    </Screen>
  );
}
