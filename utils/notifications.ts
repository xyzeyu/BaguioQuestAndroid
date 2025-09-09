// utils/notifications.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationBehavior } from 'expo-notifications';

// Show alerts even when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<NotificationBehavior> => ({
    // Common fields
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,

    // iOS 14+ specific fields (safe to include; Android will ignore)
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationSetup(): Promise<boolean> {
  try {
    // Android requires a channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Request permission if not granted
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }

    // Web has limited support; just return false to skip scheduling
    if (Platform.OS === 'web') return false;
    return status === 'granted';
  } catch (e) {
    console.warn('Notification setup failed:', e);
    return false;
  }
}

export async function notify(title: string, body?: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // fire immediately
    });
  } catch (e) {
    console.warn('notify() failed:', e);
  }
}
