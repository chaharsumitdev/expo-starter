import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ExploreStack() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        // Android has no automatic content inset, so a transparent header would cover the content.
        headerTransparent: Platform.OS === 'ios',
      }}>
      <Stack.Screen name="index" options={{ title: t('explore.title') }} />
    </Stack>
  );
}
