import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeStack() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
      }}>
      <Stack.Screen name="index" options={{ title: t('tabs.home') }} />
    </Stack>
  );
}
