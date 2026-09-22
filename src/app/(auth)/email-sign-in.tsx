import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { useEmailLogin, useForgotPassword } from '@/features/auth';
import { emailSchema, signInSchema, type SignInValues } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/errors';

export default function EmailSignInScreen() {
  const { t } = useTranslation();
  const login = useEmailLogin();
  const forgot = useForgotPassword();
  const { control, handleSubmit, getValues, setError, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onError: (e) => setError('root', { message: getErrorMessage(e) }) }),
  );

  const onForgot = () => {
    const email = getValues('email');
    if (!emailSchema.safeParse(email).success) {
      return setError('email', { message: t('auth.invalidEmail') });
    }
    forgot.mutate(email, { onSettled: () => Alert.alert(t('auth.resetSent')) });
  };

  return (
    <Screen scroll edges={['top', 'bottom']} contentClassName="pt-16">
      <Text variant="title">{t('auth.emailTitle')}</Text>
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
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={onSubmit}
          />
        )}
      />
      {formState.errors.root ? <Text variant="error">{formState.errors.root.message}</Text> : null}
      <Button title={t('auth.signIn')} loading={login.isPending} onPress={onSubmit} />
      <Button variant="ghost" title={t('auth.forgotPassword')} onPress={onForgot} />
      <Link href="/email-sign-up" replace asChild>
        <Button variant="ghost" title={t('auth.noAccount')} />
      </Link>
    </Screen>
  );
}
