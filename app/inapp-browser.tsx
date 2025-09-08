import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { Ionicons } from '@expo/vector-icons';

type Params = {
  /** direct url to open */
  url?: string;
  /** search query (e.g., a POI name) */
  q?: string;
  /** "map" -> show pin search, "nav" -> directions */
  mode?: 'map' | 'nav';
  /** optional page title */
  title?: string;
};

export default function InAppBrowserScreen() {
  const { url, q, mode, title } = useLocalSearchParams<Params>();
  const { currentLocation } = useBaguioQuest();

  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);

  const targetUrl = useMemo(() => {
    // 1) If explicit url provided, use it
    if (typeof url === 'string' && url.length > 0) return url;

    // 2) Build a Google Maps URL from query/mode
    if (typeof q === 'string' && q.trim().length > 0) {
      const encQ = encodeURIComponent(q.trim());
      if (mode === 'nav') {
        // Directions: origin if we have it, otherwise let Google infer
        const origin = currentLocation
          ? `${currentLocation.latitude},${currentLocation.longitude}`
          : '';
        const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
        return `https://www.google.com/maps/dir/?api=1&destination=${encQ}${originParam}`;
      }
      // Default to a search pin
      return `https://www.google.com/maps/search/?api=1&query=${encQ}`;
    }

    // Fallback: open Google Maps home
    return 'https://www.google.com/maps';
  }, [url, q, mode, currentLocation]);

  const openInExternal = async () => {
    const toOpen = currentUrl || targetUrl;
    if (!toOpen) return;
    try {
      await Linking.openURL(toOpen);
    } catch (e) {
      console.warn('Failed to open externally:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Close"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Feather name="x" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.titleText}>
            {title || (mode === 'nav' ? 'Directions' : 'Maps')}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            accessibilityLabel="Back"
            style={[styles.iconBtn, !canGoBack && { opacity: 0.4 }]}
            disabled={!canGoBack}
            onPress={() => webviewRef.current?.goBack()}
          >
            <Feather name="chevron-left" size={22} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Refresh"
            style={styles.iconBtn}
            onPress={() => {
              if (currentUrl) {
                webviewRef.current?.reload();
              } else if (targetUrl) {
                // initial load fallback
                setCurrentUrl(targetUrl);
              }
            }}
          >
            <Feather name="refresh-ccw" size={20} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Open in external browser"
            style={styles.iconBtn}
            onPress={openInExternal}
          >
            <Feather name="external-link" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webWrap}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" />
            <Text style={styles.loaderText}>Loading…</Text>
          </View>
        )}

        <WebView
          ref={webviewRef}
          source={{ uri: targetUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCurrentUrl(navState.url);
          }}
          startInLoadingState={false}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures={true}
          // Keep Google Maps usable inside a webview
          userAgent={
            Platform.select({
              android:
                'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
              ios:
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
              default: undefined,
            }) as string | undefined
          }
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  titleWrap: { flex: 1, paddingHorizontal: 8 },
  titleText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  webWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loader: {
    position: 'absolute',
    zIndex: 10,
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: { marginLeft: 8, color: '#6b7280', fontSize: 12, fontWeight: '500' },
});
