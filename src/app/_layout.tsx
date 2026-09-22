import '@/global.css';
import '@/lib/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useCSSVariable, useUniwind } from 'uniwind';

import { onBeforeSignOut, useAuth } from '@/features/auth';
import { registerPushToken, unregisterPushToken } from '@/lib/notifications';
import { useNotificationObserver } from '@/lib/notifications/use-notification-observer';
import { queryClient, setupQueryManagers } from '@/lib/query-client';
import '@/stores/preferences';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });

onBeforeSignOut(unregisterPushToken);

export default function RootLayout() {
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => setupQueryManagers(), []);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'loading') return;
    SplashScreen.hideAsync();
    if (status === 'signedIn') registerPushToken().catch(() => {});
  }, [status]);

  useNotificationObserver(status === 'signedIn');

  if (status === 'loading') return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationTheme>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={status === 'signedIn'}>
                <Stack.Screen name="(app)" />
              </Stack.Protected>
              <Stack.Protected guard={status === 'signedOut'}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              {/* Magic-link deep link target, reachable in any auth state. */}
              <Stack.Screen name="auth/callback" />
            </Stack>
          </NavigationTheme>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

/** Feeds the Uniwind tokens to native headers/tab bars and the status bar. */
function NavigationTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useUniwind();
  const [background, card, text, border, primary] = useCSSVariable([
    '--color-background',
    '--color-card',
    '--color-foreground',
    '--color-border',
    '--color-primary',
  ]) as string[];
  const dark = theme === 'dark';
  const base = dark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, background, card, text, border, primary },
      }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}
