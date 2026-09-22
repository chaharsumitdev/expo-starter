import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api, endpoints } from '@/lib/api';
import { env } from '@/lib/env';

// How notifications behave while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Android requires a channel before a token can be fetched. Add more channels as needed. */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type PushPermission = 'granted' | 'denied' | 'undetermined';

// Android has no "undetermined": it reports "denied" until the user is asked, with canAskAgain = true.
function toPushPermission({ status, canAskAgain }: Notifications.NotificationPermissionsStatus) {
  return status === 'denied' && canAskAgain ? 'undetermined' : status;
}

export async function getPushPermission(): Promise<PushPermission> {
  return toPushPermission(await Notifications.getPermissionsAsync());
}

/** Shows the OS prompt (only once per install on iOS). Call it at a meaningful moment. */
export async function requestPushPermission(): Promise<PushPermission> {
  await ensureAndroidChannel();
  return toPushPermission(await Notifications.requestPermissionsAsync());
}

let registeredToken: string | null = null;

/**
 * If permission is already granted, fetch the Expo push token and send it to the backend.
 * Never prompts. Safe to call on every sign-in / launch.
 */
export async function registerPushToken(): Promise<string | null> {
  if (!Device.isDevice && Platform.OS === 'android') return null; // emulators w/o Play services
  if ((await getPushPermission()) !== 'granted') return null;
  if (!env.easProjectId) {
    if (__DEV__) console.warn('[push] No EAS projectId. Run `eas init` to enable push tokens.');
    return null;
  }
  await ensureAndroidChannel();
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: env.easProjectId,
  });
  if (token !== registeredToken) {
    await api.post(endpoints.devices.pushToken, { token, platform: Platform.OS });
    registeredToken = token;
  }
  return token;
}

/** Call before signing out so this device stops receiving the user's notifications. */
export async function unregisterPushToken() {
  if (!registeredToken) return;
  await api
    .delete(endpoints.devices.pushToken, { body: { token: registeredToken } })
    .catch(() => {});
  registeredToken = null;
}
