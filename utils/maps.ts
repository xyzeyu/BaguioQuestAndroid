// utils/maps.ts
import { Platform, Linking, Alert } from 'react-native';

export const buildMapsSearchUrl = (query: string) => {
  const q = encodeURIComponent(query);
  if (Platform.OS === 'ios') return `http://maps.apple.com/?q=${q}`;
  if (Platform.OS === 'android') return `geo:0,0?q=${q}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
};

export const buildMapsDirectionsUrl = (destination: string) => {
  const d = encodeURIComponent(destination);
  if (Platform.OS === 'ios') return `http://maps.apple.com/?daddr=${d}`;
  if (Platform.OS === 'android') return `google.navigation:q=${d}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${d}`;
};

export const openInApp = async (url: string, fallbackLabel?: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      return Linking.openURL(url);
    }
    // Fallback to a universal http(s) maps URL
    const web = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fallbackLabel || 'Destination'
    )}`;
    return Linking.openURL(web);
  } catch (e) {
    console.error('openInApp error', e);
    Alert.alert('Unable to open maps', 'Please try again.');
  }
};
