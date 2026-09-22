import * as Notifications from 'expo-notifications';
import { type Href, router } from 'expo-router';
import { useEffect } from 'react';

let lastHandledId: string | null = null;

/**
 * Opens the route in a notification's `data.url` when the user taps it, including the tap
 * that launched the app. Send `{ "data": { "url": "/item/42" } }` from your backend.
 */
export function useNotificationObserver(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const redirect = (notification: Notifications.Notification) => {
      if (notification.request.identifier === lastHandledId) return;
      lastHandledId = notification.request.identifier;
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as Href);
    };

    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) redirect(last.notification);

    const sub = Notifications.addNotificationResponseReceivedListener((response) =>
      redirect(response.notification),
    );
    return () => sub.remove();
  }, [enabled]);
}
