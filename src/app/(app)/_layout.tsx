import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';

// Deep links straight to e.g. /item/42 still get the tabs underneath, so "back" works.
export const unstable_settings = { initialRouteName: '(tabs)' };

export default function AppLayout() {
  const { t } = useTranslation();
  const needsOnboarding = useAuth((s) => s.needsOnboarding);

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: t('item.title') }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'formSheet',
            headerShown: false,
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 1],
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
