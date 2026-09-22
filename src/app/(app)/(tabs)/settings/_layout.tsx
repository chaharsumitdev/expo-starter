import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function SettingsStack() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
      }}>
      <Stack.Screen name="index" options={{ title: t('settings.title') }} />
    </Stack>
  );
}
