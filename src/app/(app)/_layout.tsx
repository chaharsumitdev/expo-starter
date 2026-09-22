import { Stack } from 'expo-router';
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';

// Deep links straight to e.g. /item/42 still get the tabs underneath, so "back" works.
export const unstable_settings = { initialRouteName: '(tabs)' };

const tabTitleKeys = {
  '(home)': 'tabs.home',
  explore: 'tabs.explore',
  settings: 'tabs.settings',
} as const;

export default function AppLayout() {
  const { t } = useTranslation();
  const needsOnboarding = useAuth((s) => s.needsOnboarding);

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!needsOnboarding}>
        <Stack.Screen
          name="(tabs)"
          // The title is never shown, but it names the back button (VoiceOver, iOS long-press
          // menu) on screens pushed over the tabs. Follow the tab that's actually focused.
          options={({ route }) => {
            const tab = getFocusedRouteNameFromRoute(route) ?? '(home)';
            const key = tabTitleKeys[tab as keyof typeof tabTitleKeys] ?? 'tabs.home';
            return { headerShown: false, title: t(key) };
          }}
        />
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
