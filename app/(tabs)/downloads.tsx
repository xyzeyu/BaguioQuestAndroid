// app/(tabs)/downloads.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

interface MapArea {
  id: string;
  name: string;
  description: string;
  size: string;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress?: number;
  lastUpdated?: string;
}

export default function DownloadsScreen() {
  const { isDarkMode } = useBaguioQuest();
  const dark = !!isDarkMode;
  const styles = createStyles(dark);

  // Simple heuristic; for true network status consider @react-native-community/netinfo
  const [isOnline] = useState(Platform.OS !== 'web');

  const [mapAreas, setMapAreas] = useState<MapArea[]>([
    {
      id: 'downtown',
      name: 'Downtown Baguio',
      description: "Session Road, Burnham Park, Cathedral",
      size: '85 MB',
      isDownloaded: true,
      isDownloading: false,
      lastUpdated: '2 days ago',
    },
    {
      id: 'mines-view',
      name: 'Mines View Area',
      description: 'Mines View Park, Botanical Garden',
      size: '45 MB',
      isDownloaded: false,
      isDownloading: false,
    },
    {
      id: 'camp-john-hay',
      name: 'Camp John Hay',
      description: 'CJH Golf Course, The Manor, Bell Church',
      size: '62 MB',
      isDownloaded: false,
      isDownloading: false,
    },
    {
      id: 'wright-park',
      name: 'Wright Park Area',
      description: 'Wright Park, Mansion House, Teachers Camp',
      size: '38 MB',
      isDownloaded: true,
      isDownloading: false,
      lastUpdated: '1 week ago',
    },
    {
      id: 'kennon-road',
      name: 'Kennon Road',
      description: "Lion's Head, Kennon Road viewpoints",
      size: '72 MB',
      isDownloaded: false,
      isDownloading: false,
    },
  ]);

  const totalStorage = {
    used: '187 MB',
    available: '2.3 GB',
    total: '2.5 GB',
  };

  const setArea = (id: string, patch: Partial<MapArea>) =>
    setMapAreas(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));

  const handleDownload = (area: MapArea) => {
    if (!isOnline) {
      Alert.alert('No Internet Connection', 'Please connect to the internet to download map areas.');
      return;
    }
    Alert.alert(
      'Download Map Area',
      `Download ${area.name} (${area.size})? This will use your data connection.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // Start fake download
            setArea(area.id, { isDownloading: true, downloadProgress: 0 });
            let progress = 0;
            const iv = setInterval(() => {
              progress += 10;
              if (progress >= 100) {
                clearInterval(iv);
                setArea(area.id, {
                  isDownloading: false,
                  isDownloaded: true,
                  downloadProgress: 100,
                  lastUpdated: 'Just now',
                });
              } else {
                setArea(area.id, { downloadProgress: progress });
              }
            }, 300);
          },
        },
      ],
    );
  };

  const handleDownloadOfflineMap = () => {
    const offlineMapUrl = 'https://download.geofabrik.de/asia/philippines-latest.osm.pbf';
    Alert.alert(
      'Download Offline Map',
      'This will download the complete Baguio City offline map data (~150MB).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            Linking.openURL(offlineMapUrl).catch(() =>
              Alert.alert('Error', 'Unable to open download link. Please try again later.')
            );
          },
        },
      ],
    );
  };

  const handleDelete = (area: MapArea) => {
    Alert.alert(
      'Delete Map Area',
      `Delete ${area.name}? You can re-download it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setArea(area.id, { isDownloaded: false, lastUpdated: undefined }),
        },
      ],
    );
  };

  const handleUpdateAll = () => {
    if (!isOnline) {
      Alert.alert('No Internet Connection', 'Please connect to the internet to update map areas.');
      return;
    }
    Alert.alert(
      'Update All Maps',
      'This will update all downloaded map areas with the latest data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            setMapAreas(prev =>
              prev.map(a => (a.isDownloaded ? { ...a, isDownloading: true, downloadProgress: 0 } : a))
            );
            let progress = 0;
            const iv = setInterval(() => {
              progress += 20;
              if (progress >= 100) {
                clearInterval(iv);
                setMapAreas(prev =>
                  prev.map(a =>
                    a.isDownloaded
                      ? { ...a, isDownloading: false, downloadProgress: 100, lastUpdated: 'Just now' }
                      : a
                  )
                );
              } else {
                setMapAreas(prev =>
                  prev.map(a => (a.isDownloaded ? { ...a, downloadProgress: progress } : a))
                );
              }
            }, 300);
          },
        },
      ],
    );
  };

  const renderMapArea = (area: MapArea) => (
    <View key={area.id} style={styles.areaItem}>
      <View style={styles.areaIcon}>
        <Feather name="map-pin" size={20} color="#2563eb" />
      </View>

      <View style={styles.areaInfo}>
        <Text style={styles.areaName}>{area.name}</Text>
        <Text style={styles.areaDescription}>{area.description}</Text>
        <Text style={styles.areaSize}>{area.size}</Text>
        {area.lastUpdated && <Text style={styles.lastUpdated}>Updated {area.lastUpdated}</Text>}
      </View>

      <View style={styles.areaActions}>
        {area.isDownloaded ? (
          <View style={styles.downloadedContainer}>
            <Feather name="check-circle" size={16} color="#10b981" />
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(area)}>
              <Feather name="trash-2" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : area.isDownloading ? (
          <View style={styles.downloadingContainer}>
            <Feather name="clock" size={16} color="#f59e0b" />
            <Text style={styles.progressText}>{area.downloadProgress || 0}%</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(area)}>
            <Feather name="download" size={16} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Feather name="download" size={24} color="#2563eb" />
        <Text style={styles.headerTitle}>Offline Maps</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={styles.statusSection}>
          <View style={styles.connectionStatus}>
            {isOnline ? (
              <>
                <Feather name="wifi" size={20} color="#10b981" />
                <Text style={styles.onlineText}>Connected</Text>
              </>
            ) : (
              <>
                <Feather name="wifi-off" size={20} color="#ef4444" />
                <Text style={styles.offlineText}>Offline</Text>
              </>
            )}
          </View>

          {isOnline && (
            <TouchableOpacity style={styles.updateAllButton} onPress={handleUpdateAll}>
              <Text style={styles.updateAllText}>Update All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageInfo}>
            <Feather name="hard-drive" size={20} color={dark ? '#9ca3af' : '#6b7280'} />
            <View style={styles.storageText}>
              <Text style={styles.storageUsed}>
                {totalStorage.used} used of {totalStorage.total}
              </Text>
              <Text style={styles.storageAvailable}>{totalStorage.available} available</Text>
            </View>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageUsedBar, { width: '7.5%' }]} />
          </View>
        </View>

        {/* Offline Map Download */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Offline Map</Text>
          <Text style={styles.sectionDescription}>
            Download the complete Baguio City map for full offline navigation capability.
          </Text>

          <TouchableOpacity style={styles.offlineMapButton} onPress={handleDownloadOfflineMap}>
            <View style={styles.offlineMapIcon}>
              <Feather name="download" size={24} color="#2563eb" />
            </View>
            <View style={styles.offlineMapInfo}>
              <Text style={styles.offlineMapTitle}>Baguio City Complete Map</Text>
              <Text style={styles.offlineMapDescription}>
                Full offline map with all roads, landmarks, and POIs
              </Text>
              <Text style={styles.offlineMapSize}>~150 MB • Latest Update</Text>
            </View>
            <Feather name="external-link" size={20} color={dark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </View>

        {/* Map Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map Area Sections</Text>
          <Text style={styles.sectionDescription}>
            Download specific areas for faster access and reduced storage usage.
          </Text>

          {mapAreas.map(renderMapArea)}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>📱 Download maps on Wi-Fi to save mobile data</Text>
            <Text style={styles.tip}>🗺️ GPS works offline once maps are downloaded</Text>
            <Text style={styles.tip}>🔄 Update maps regularly for latest road changes</Text>
            <Text style={styles.tip}>💾 Downloaded maps are stored securely on your device</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Offline Navigation</Text>
          <Text style={styles.disclaimerText}>
            Offline maps provide basic navigation without internet. Some features like real-time
            traffic and live updates require an internet connection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#000' : '#f8fafc',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: dark ? '#0b0b0b' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f2937' : '#e5e7eb',
      columnGap: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: dark ? '#f9fafb' : '#1f2937',
      marginLeft: 12,
    },
    content: {
      flex: 1,
    },
    statusSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: dark ? '#0b0b0b' : '#ffffff',
      padding: 16,
      marginTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f2937' : '#e5e7eb',
    },
    connectionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 8,
    },
    onlineText: {
      fontSize: 14,
      color: '#10b981',
      fontWeight: '500',
    },
    offlineText: {
      fontSize: 14,
      color: '#ef4444',
      fontWeight: '500',
    },
    updateAllButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      borderRadius: 6,
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    updateAllText: {
      fontSize: 14,
      color: '#2563eb',
      fontWeight: '500',
    },
    section: {
      backgroundColor: dark ? '#0b0b0b' : '#ffffff',
      marginTop: 8,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#111827' : '#f3f4f6',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: dark ? '#f9fafb' : '#1f2937',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: dark ? '#9ca3af' : '#6b7280',
      paddingHorizontal: 16,
      marginBottom: 16,
      lineHeight: 20,
    },
    storageInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
      columnGap: 12,
    },
    storageText: {
      flexDirection: 'column',
    },
    storageUsed: {
      fontSize: 14,
      fontWeight: '500',
      color: dark ? '#f9fafb' : '#1f2937',
    },
    storageAvailable: {
      fontSize: 12,
      color: dark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    storageBar: {
      height: 4,
      backgroundColor: dark ? '#111827' : '#e5e7eb',
      marginHorizontal: 16,
      borderRadius: 2,
    },
    storageUsedBar: {
      height: '100%',
      backgroundColor: '#2563eb',
      borderRadius: 2,
    },
    areaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#111827' : '#f3f4f6',
    },
    areaIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    areaInfo: {
      flex: 1,
    },
    areaName: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#f9fafb' : '#1f2937',
    },
    areaDescription: {
      fontSize: 12,
      color: dark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    areaSize: {
      fontSize: 12,
      color: dark ? '#d1d5db' : '#374151',
      marginTop: 4,
      fontWeight: '500',
    },
    lastUpdated: {
      fontSize: 11,
      color: '#10b981',
      marginTop: 2,
    },
    areaActions: {
      alignItems: 'center',
    },
    downloadedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 8,
    },
    deleteButton: {
      padding: 4,
    },
    downloadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 6,
    },
    progressText: {
      fontSize: 12,
      color: '#f59e0b',
      fontWeight: '500',
    },
    downloadButton: {
      padding: 8,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      borderRadius: 6,
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    tipsList: {
      paddingHorizontal: 16,
      rowGap: 8,
    },
    tip: {
      fontSize: 14,
      color: dark ? '#d1d5db' : '#374151',
      lineHeight: 20,
    },
    disclaimer: {
      margin: 16,
      padding: 16,
      backgroundColor: dark ? '#052e4e' : '#f0f9ff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: dark ? '#0b4a77' : '#bae6fd',
    },
    disclaimerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#a5d8ff' : '#0369a1',
      marginBottom: 8,
    },
    disclaimerText: {
      fontSize: 12,
      color: dark ? '#cfe8ff' : '#0c4a6e',
      lineHeight: 16,
    },
    offlineMapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: dark ? '#0b0b0b' : '#f8fafc',
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: dark ? '#1f2937' : '#e5e7eb',
      borderStyle: 'dashed',
      columnGap: 16,
    },
    offlineMapIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    offlineMapInfo: { flex: 1 },
    offlineMapTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: dark ? '#f9fafb' : '#1f2937',
      marginBottom: 4,
    },
    offlineMapDescription: {
      fontSize: 14,
      color: dark ? '#9ca3af' : '#6b7280',
      marginBottom: 4,
    },
    offlineMapSize: {
      fontSize: 12,
      color: '#2563eb',
      fontWeight: '500',
    },
  });
