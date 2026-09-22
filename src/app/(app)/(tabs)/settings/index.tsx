import * as Application from 'expo-application';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { Row, Screen, Section, Text } from '@/components/ui';
import { useAuth, useDeleteAccount } from '@/features/auth';
import { env } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';
import { getLanguagePreference, type Language, languages, setLanguage } from '@/lib/i18n';
import {
  getPushPermission,
  type PushPermission,
  registerPushToken,
  requestPushPermission,
} from '@/lib/notifications';
import { type ThemePreference, usePreferences } from '@/stores/preferences';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = usePreferences((s) => s.theme);
  const setTheme = usePreferences((s) => s.setTheme);
  const signOut = useAuth((s) => s.signOut);
  const deleteAccount = useDeleteAccount();
  const [languagePref, setLanguagePref] = useState(getLanguagePreference);
  const [push, setPush] = useState<PushPermission>('undetermined');

  useFocusEffect(
    useCallback(() => {
      getPushPermission().then(setPush);
    }, []),
  );

  // Switching between LTR and RTL languages reloads the app to flip the layout.
  const chooseLanguage = async (lang: Language | null) => {
    setLanguagePref(lang);
    await setLanguage(lang);
  };

  const enablePush = async () => {
    if (push === 'denied') return Linking.openSettings();
    const status = await requestPushPermission();
    setPush(status);
    if (status === 'granted') registerPushToken().catch(() => {});
  };

  const confirmDelete = () =>
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.delete'),
        style: 'destructive',
        onPress: () =>
          deleteAccount.mutate(undefined, { onError: (e) => Alert.alert(getErrorMessage(e)) }),
      },
    ]);

  return (
    <Screen scroll contentClassName="gap-6">
      <Section title={t('settings.appearance')}>
        {THEMES.map((value) => (
          <Row
            key={value}
            title={t(`settings.theme.${value}`)}
            selected={theme === value}
            onPress={() => setTheme(value)}
          />
        ))}
      </Section>

      <Section title={t('settings.language')}>
        <Row
          title={t('settings.languageSystem')}
          selected={languagePref === null}
          onPress={() => chooseLanguage(null)}
        />
        {languages.map((lang) => (
          <Row
            key={lang.code}
            title={lang.label}
            selected={languagePref === lang.code}
            onPress={() => chooseLanguage(lang.code)}
          />
        ))}
      </Section>

      <Section title={t('settings.notifications')}>
        <Row
          title={t('settings.enableNotifications')}
          value={
            push === 'granted'
              ? t('settings.notificationsEnabled')
              : push === 'denied'
                ? t('settings.notificationsDenied')
                : undefined
          }
          onPress={push === 'granted' ? undefined : enablePush}
        />
      </Section>

      <Section title={t('settings.account')}>
        <Row title={t('settings.signOut')} onPress={() => signOut()} />
        <Row title={t('settings.deleteAccount')} destructive onPress={confirmDelete} />
      </Section>

      <Text variant="caption" className="text-center">
        {t('settings.version', {
          version: `${Application.nativeApplicationVersion ?? '1.0.0'} (${Application.nativeBuildVersion ?? '1'})`,
          variant: env.variant,
        })}
      </Text>
    </Screen>
  );
}
