import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Download,
  MapPin,
  Trash2,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  HardDrive,
} from 'lucide-react-native';
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
  const { settings, updateSettings } = useBaguioQuest();
  const [isOnline] = useState(Platform.OS !== 'web');

  const [mapAreas] = useState<MapArea[]>([
    {
      id: 'downtown',
      name: 'Downtown Baguio',
      description: 'Session Road, Burnham Park, Cathedral',
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
      description: 'Lion\'s Head, Kennon Road viewpoints',
      size: '72 MB',
      isDownloaded: false,
      isDownloading: false,
    },
  ]);

  const [totalStorage] = useState({
    used: '187 MB',
    available: '2.3 GB',
    total: '2.5 GB',
  });

  const handleDownload = (area: MapArea) => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'Please connect to the internet to download map areas.',
        [{ text: 'OK' }]
      );
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
            console.log(`Starting download for ${area.name}`);
            // Simulate download process
          }
        },
      ]
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
          onPress: () => {
            console.log(`Deleting ${area.name}`);
          }
        },
      ]
    );
  };

  const handleUpdateAll = () => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'Please connect to the internet to update map areas.',
        [{ text: 'OK' }]
      );
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
            console.log('Updating all map areas');
          }
        },
      ]
    );
  };

  const renderMapArea = (area: MapArea) => (
    <View key={area.id} style={styles.areaItem}>
      <View style={styles.areaIcon}>
        <MapPin size={20} color="#2563eb" />
      </View>
      
      <View style={styles.areaInfo}>
        <Text style={styles.areaName}>{area.name}</Text>
        <Text style={styles.areaDescription}>{area.description}</Text>
        <Text style={styles.areaSize}>{area.size}</Text>
        {area.lastUpdated && (
          <Text style={styles.lastUpdated}>Updated {area.lastUpdated}</Text>
        )}
      </View>

      <View style={styles.areaActions}>
        {area.isDownloaded ? (
          <View style={styles.downloadedContainer}>
            <CheckCircle size={16} color="#10b981" />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(area)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : area.isDownloading ? (
          <View style={styles.downloadingContainer}>
            <Clock size={16} color="#f59e0b" />
            <Text style={styles.progressText}>
              {area.downloadProgress || 0}%
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownload(area)}
          >
            <Download size={16} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Download size={24} color="#2563eb" />
        <Text style={styles.headerTitle}>Offline Maps</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={styles.statusSection}>
          <View style={styles.connectionStatus}>
            {isOnline ? (
              <>
                <Wifi size={20} color="#10b981" />
                <Text style={styles.onlineText}>Connected</Text>
              </>
            ) : (
              <>
                <WifiOff size={20} color="#ef4444" />
                <Text style={styles.offlineText}>Offline</Text>
              </>
            )}
          </View>
          
          {isOnline && (
            <TouchableOpacity 
              style={styles.updateAllButton}
              onPress={handleUpdateAll}
            >
              <Text style={styles.updateAllText}>Update All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageInfo}>
            <HardDrive size={20} color="#6b7280" />
            <View style={styles.storageText}>
              <Text style={styles.storageUsed}>
                {totalStorage.used} used of {totalStorage.total}
              </Text>
              <Text style={styles.storageAvailable}>
                {totalStorage.available} available
              </Text>
            </View>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageUsedBar, { width: '7.5%' }]} />
          </View>
        </View>

        {/* Map Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Map Areas</Text>
          <Text style={styles.sectionDescription}>
            Download map areas for offline navigation. Maps work without internet once downloaded.
          </Text>
          
          {mapAreas.map(renderMapArea)}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>
              📱 Download maps on Wi-Fi to save mobile data
            </Text>
            <Text style={styles.tip}>
              🗺️ GPS works offline once maps are downloaded
            </Text>
            <Text style={styles.tip}>
              🔄 Update maps regularly for latest road changes
            </Text>
            <Text style={styles.tip}>
              💾 Downloaded maps are stored securely on your device
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Offline Navigation</Text>
          <Text style={styles.disclaimerText}>
            Offline maps provide basic navigation without internet. Some features like 
            real-time traffic and live updates require an internet connection. 
            Always carry backup navigation methods for important trips.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  updateAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  updateAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 20,
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storageText: {
    marginLeft: 12,
  },
  storageUsed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  storageAvailable: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  storageBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
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
    borderBottomColor: '#f3f4f6',
  },
  areaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  areaDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  areaSize: {
    fontSize: 12,
    color: '#374151',
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
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  downloadButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  tipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 16,
  },
});