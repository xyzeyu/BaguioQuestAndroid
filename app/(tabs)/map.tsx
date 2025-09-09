// app/(tabs)/map.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  Polygon,
  Polyline,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useBaguioQuest } from '../../hooks/use-baguio-quest';
import type { POI } from '../../types/navigation';
import { calculateDistanceMeters } from '../../utils/navigation';

// NEW: coding + geofences + notifications + sticky banner + json
import { useNumberCoding, getSavedPlateLastDigit } from '../../hooks/use-number-coding';
import { useGeofences } from '../../hooks/use-geofences';
import { ensureNotificationSetup, notify } from '../../utils/notifications';
import StickyBanner from '../../components/StickyBanner';
import codingZone from '../../data/coding_zone.json';
import oneWayData from '../../data/oneway_segments.json';

export default function MapScreen() {
  const { currentLocation, nearbyPOIs, updateLocation, isDarkMode } = useBaguioQuest();

  const dark = !!isDarkMode;
  const styles = createStyles(dark);
  const mapRef = useRef<MapView | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const initialRegion: Region = {
    latitude: 16.4023,
    longitude: 120.5960,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: initialRegion.latitude,
    lng: initialRegion.longitude,
  });

  // ---------- NEW: coding/alerts prefs ----------
  const [plate, setPlate] = useState<number | undefined>(undefined);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [notifiedKey, setNotifiedKey] = useState<string | null>(null); // avoid spam notifications

  useEffect(() => {
    (async () => {
      const savedPlate = await getSavedPlateLastDigit();
      if (savedPlate !== undefined) setPlate(savedPlate);
      const codingAlerts = await AsyncStorage.getItem('codingAlerts');
      if (codingAlerts != null) setAlertsEnabled(codingAlerts === 'true');
      if (codingAlerts === 'true') await ensureNotificationSetup();
    })();
  }, []);

  // Hook to evaluate coding status (based on day/time rules + plate)
  const coding = useNumberCoding(plate);

  // Hook for geofence/one-way checks
  const { insideCodingZone, heading, nearestOneWay } = useGeofences();

  // ---------- Original helpers ----------
  const formatDistance = (meters?: number) => {
    if (typeof meters !== 'number') return 'N/A';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'BaguioQuest needs location access to show your position.',
          [{ text: 'OK' }]
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.High,
      });

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      const acc = loc.coords.accuracy ?? 0;

      updateLocation({ latitude: lat, longitude: lng, accuracy: acc });

      requestAnimationFrame(() => {
        mapRef.current?.animateToRegion(
          { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
          600
        );
      });

      if (Platform.OS !== 'web') {
        await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (loc2) => {
            const lt = loc2.coords.latitude;
            const lg = loc2.coords.longitude;
            const ac = loc2.coords.accuracy ?? 0;
            updateLocation({ latitude: lt, longitude: lg, accuracy: ac });
          }
        );
      }
    } catch (e) {
      console.error('permission/location error', e);
      setLocationPermission(false);
    }
  }, [updateLocation]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const hasCoords = (p: POI): p is POI & { lat: number; lng: number } =>
    typeof (p as any).lat === 'number' && typeof (p as any).lng === 'number';

  const poisWithCoords = useMemo(
    () => nearbyPOIs.filter(hasCoords) as Array<POI & { lat: number; lng: number; distanceMeters?: number }>,
    [nearbyPOIs]
  );

  const poisWithDistanceFromMap = useMemo(() => {
    return poisWithCoords
      .map((p) => ({
        ...p,
        distanceMeters: calculateDistanceMeters(mapCenter.lat, mapCenter.lng, p.lat, p.lng),
      }))
      .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
  }, [poisWithCoords, mapCenter]);

  const centerOnUser = () => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600
    );
  };

  const openDetails = (poi: POI) => {
    router.push({ pathname: '/poi-details', params: { poiId: poi.id } });
  };

  // ---------- NEW: Coding Zone polygon coordinates ----------
  const codingPolygon = useMemo(() => {
    try {
      const ring = (codingZone as any).features[0].geometry.coordinates[0];
      return ring.map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
    } catch {
      return [];
    }
  }, []);

  // ---------- NEW: One-way polyline to paint if user is near ----------
  const oneWayPolyline = useMemo(() => {
    if (!nearestOneWay || nearestOneWay.distanceM > 30) return undefined;
    // Use the first feature or match by name if available
    const feat =
      (oneWayData as any).features.find((f: any) => f.properties?.name === nearestOneWay.name) ||
      (oneWayData as any).features[0];
    if (!feat) return undefined;
    const coords = feat.geometry.coordinates.map((c: number[]) => ({
      latitude: c[1],
      longitude: c[0],
    }));
    return { coords, ok: nearestOneWay.ok };
  }, [nearestOneWay]);

  // ---------- NEW: Notify on risky enter (zone + affected + window) ----------
  useEffect(() => {
    if (!alertsEnabled) return;
    (async () => {
      const ready = await ensureNotificationSetup();
      if (!ready) return;

      const key = `${insideCodingZone}-${coding.isAffected}-${coding.isWindow}-${coding.dayKey}`;
      if (insideCodingZone && coding.isAffected && coding.isWindow && notifiedKey !== key) {
        notify('Number Coding Zone', 'You’re entering a Coding Zone and are restricted today.');
        setNotifiedKey(key);
      }
    })();
  }, [insideCodingZone, coding.isAffected, coding.isWindow, coding.dayKey, alertsEnabled, notifiedKey]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where to? Session Rd, Burnham Park..."
            placeholderTextColor={dark ? '#9ca3af' : '#6b7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() =>
              router.push({ pathname: '/search', params: { q: searchQuery } })
            }
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Permission state */}
      {locationPermission === null && (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Requesting location permission…</Text>
        </View>
      )}
      {locationPermission === false && (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={24} color="#ef4444" />
          <Text style={styles.stateText}>
            Location access needed. Enable in Settings, then tap “Retry”.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestLocationPermission}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: dark ? '#111827' : '#e5e7eb' }]}
            onPress={() =>
              updateLocation({ latitude: 16.4023, longitude: 120.596, accuracy: 10 })
            }
          >
            <Text style={[styles.primaryBtnText, { color: dark ? '#f9fafb' : '#111827' }]}>
              Use Demo Location
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={(r) => setMapCenter({ lat: r.latitude, lng: r.longitude })}
          scrollEnabled
          zoomEnabled
          rotateEnabled
          pitchEnabled
        >
          {/* NEW: Coding Zone polygon overlay */}
          {codingPolygon.length > 0 && (
            <Polygon
              coordinates={codingPolygon}
              strokeWidth={2}
              strokeColor="#D97706"
              fillColor="rgba(217,119,6,0.15)"
            />
          )}

          {/* NEW: Nearby one-way segment coloring (green ok / red wrong) */}
          {oneWayPolyline && (
            <Polyline
              coordinates={oneWayPolyline.coords}
              strokeWidth={6}
              strokeColor={oneWayPolyline.ok ? '#10b981' : '#ef4444'}
            />
          )}

          {/* Your markers/POIs */}
          {poisWithCoords.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={{ latitude: poi.lat, longitude: poi.lng }}
              title={poi.name}
              description={poi.type}
              onPress={() => openDetails(poi)}
            />
          ))}
        </MapView>

        {/* Center on user */}
        <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUser}>
          <Ionicons name="navigate-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* NEW: Sticky banner for Coding restriction */}
      {insideCodingZone && coding.isWindow && coding.isAffected && (
        <StickyBanner
          kind="warning"
          text={`🚧 Number Coding Active — Your plate is restricted today (${coding.dayKey}, 7:00–19:00). Tap for alternate route.`}
          onPress={() => {
            notify('Alternate route', 'Trying to avoid the Coding Zone.');
            // TODO: Add waypoint just outside polygon and open external Maps
          }}
        />
      )}

      {/* NEW: Sticky banner for One-way directionality */}
      {nearestOneWay && nearestOneWay.distanceM <= 30 && (
        <StickyBanner
          kind={nearestOneWay.ok ? 'ok' : 'error'}
          text={
            nearestOneWay.ok
              ? '✅ One-way alignment OK'
              : '⚠️ One-way ahead — your heading is against flow. Re-route recommended.'
          }
        />
      )}

      {/* Nearby POIs — distance from MAP center */}
      <ScrollView style={styles.pois} keyboardShouldPersistTaps="handled">
        <Text style={styles.poisTitle}>Nearby Places (from map center)</Text>
        {poisWithDistanceFromMap.map((poi) => (
          <TouchableOpacity key={poi.id} style={styles.poiItem} onPress={() => openDetails(poi)}>
            <View style={styles.poiIcon}>
              <Ionicons name="location-outline" size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiType}>{poi.type}</Text>
              {(poi as any).hours ? (
                <Text style={{ color: '#10b981', fontSize: 12 }}>{(poi as any).hours}</Text>
              ) : null}
            </View>
            <Text style={styles.poiDistance}>{formatDistance(poi.distanceMeters)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#000' : '#f8fafc' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: dark ? '#0b0b0b' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f2937' : '#e5e7eb',
      zIndex: 1,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: dark ? '#111827' : '#f3f4f6',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchInput: { flex: 1, fontSize: 16, marginLeft: 8, color: dark ? '#f9fafb' : '#1f2937' },
    stateBox: { padding: 16, gap: 12, alignItems: 'center' },
    stateText: { color: dark ? '#d1d5db' : '#374151' },

    myLocationButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: dark ? '#0b0b0b' : '#ffffff',
      padding: 12,
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#2563eb',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    primaryBtnText: { color: '#fff', fontWeight: '600' },

    pois: {
      maxHeight: 240,
      backgroundColor: dark ? '#0b0b0b' : '#fff',
      margin: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    poisTitle: {
      color: dark ? '#f9fafb' : '#1f2937',
      fontWeight: '600',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    poiItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f2937' : '#f3f4f6',
      gap: 12,
    },
    poiIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    poiName: { color: dark ? '#f9fafb' : '#1f2937', fontWeight: '600' },
    poiType: { color: dark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 },
    poiDistance: { color: dark ? '#9ca3af' : '#6b7280', fontWeight: '500' },
  });
