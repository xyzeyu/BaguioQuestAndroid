// app/map-browser.tsx
import React, { useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function MapBrowserScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);

  const startUrl = useMemo(() => decodeURIComponent(url || ''), [url]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ? decodeURIComponent(title) : 'Maps'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webRef}
        source={{ uri: startUrl }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(s) => {
          setCanGoBack(!!s.canGoBack);
          setCanGoForward(!!s.canGoForward);
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => canGoBack && webRef.current?.goBack()}
          disabled={!canGoBack}
        >
          <Feather name="arrow-left" size={18} color={canGoBack ? '#fff' : '#7a7a7a'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => canGoForward && webRef.current?.goForward()}
          disabled={!canGoForward}
        >
          <Feather name="arrow-right" size={18} color={canGoForward ? '#fff' : '#7a7a7a'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => webRef.current?.reload()}>
          <Feather name="refresh-ccw" size={18} color="#fff" />
        </TouchableOpacity>
        {loading ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    height: 48,
    backgroundColor: '#000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toolBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
