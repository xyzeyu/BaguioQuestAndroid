// app/poi-details.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import type { POI } from '@/types/navigation';
import { buildMapsDirectionsUrl, buildMapsSearchUrl, openInApp } from '@/utils/maps';
import { calculateDistanceMeters } from '@/utils/navigation';

const hasCoords = (p: POI | null): p is POI & { lat: number; lng: number } =>
  !!p && typeof (p as any).lat === 'number' && typeof (p as any).lng === 'number';

const formatDistance = (m?: number) => {
  if (typeof m !== 'number') return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
};

export default function POIDetailsScreen() {
  const { poiId } = useLocalSearchParams<{ poiId: string }>();
  const { getPOIById, isDarkMode, currentLocation } = useBaguioQuest();
  const [poi, setPOI] = useState<POI | null>(null);

  useEffect(() => {
    if (poiId) setPOI(getPOIById(poiId));
  }, [poiId, getPOIById]);

  const distanceM = useMemo(() => {
    if (!poi || !currentLocation || !hasCoords(poi)) return undefined;
    return calculateDistanceMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      poi.lat,
      poi.lng
    );
  }, [poi, currentLocation]);

  const dark = !!isDarkMode;
  const styles = createStyles(dark);

  if (!poi) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Place not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const onMap = async () => openInApp(buildMapsSearchUrl(poi.name), poi.name);
  const onNavigate = async () => openInApp(buildMapsDirectionsUrl(poi.name), poi.name);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={dark ? '#fff' : '#1f2937'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{poi.name}</Text>
              <Text style={styles.type}>{poi.type}</Text>
            </View>
            <View style={styles.badges}>
              {typeof distanceM === 'number' && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="walk-outline" size={14} color="#0ea5e9" />
                  <Text style={styles.distanceText}>{formatDistance(distanceM)}</Text>
                </View>
              )}
              {!!poi.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.rating}>{poi.rating}</Text>
                </View>
              )}
            </View>
          </View>

          {!!poi.description && <Text style={styles.description}>{poi.description}</Text>}

          <View style={styles.statsContainer}>
            {!!poi.hours && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.statText}>{poi.hours}</Text>
              </View>
            )}
          </View>
        </View>

        {!!poi.amenities?.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {poi.amenities.map((a, i) => (
                <View key={i} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>🛣️ Prefer main roads when possible</Text>
            <Text style={styles.tip}>↪️ Watch for one-way streets nearby</Text>
            <Text style={styles.tip}>🅿️ Parking may be limited on peak hours</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.navigateButton} onPress={onNavigate}>
            <Ionicons name="navigate" size={20} color="#ffffff" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapsButton} onPress={onMap}>
            <Ionicons name="map-outline" size={20} color="#2563eb" />
            <Text style={styles.mapsButtonText}>Open Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#000' : '#f8fafc' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 18, color: dark ? '#9ca3af' : '#6b7280', marginBottom: 20 },
    backButton: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: dark ? '#000' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f1f1f' : '#e5e7eb',
    },
    headerButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: dark ? '#fff' : '#1f2937' },

    content: { flex: 1 },

    infoSection: { backgroundColor: dark ? '#000' : '#ffffff', padding: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: dark ? '#fff' : '#1f2937', marginBottom: 4 },
    type: { fontSize: 14, color: dark ? '#9ca3af' : '#6b7280', fontWeight: '500' },

    badges: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e0f2fe',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 6,
    },
    distanceText: { color: '#0369a1', fontWeight: '600', fontSize: 12 },

    ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    rating: { fontSize: 14, color: '#d97706', fontWeight: '600', marginLeft: 4 },

    description: { fontSize: 16, color: dark ? '#d1d5db' : '#374151', lineHeight: 24, marginBottom: 16 },

    statsContainer: { flexDirection: 'row', gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center' },
    statText: { fontSize: 14, color: dark ? '#9ca3af' : '#6b7280', marginLeft: 6 },

    section: { backgroundColor: dark ? '#000' : '#ffffff', marginTop: 8, padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: dark ? '#fff' : '#1f2937', marginBottom: 12 },
    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' },
    amenityText: { fontSize: 14, color: '#166534', marginLeft: 6, fontWeight: '500' },
    tipsList: { gap: 8 },
    tip: { fontSize: 14, color: dark ? '#d1d5db' : '#374151', lineHeight: 20 },

    bottomActions: { backgroundColor: dark ? '#000' : '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: dark ? '#1f1f1f' : '#e5e7eb' },
    buttonRow: { flexDirection: 'row', gap: 12 },
    navigateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, gap: 8 },
    navigateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    mapsButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#2563eb', gap: 8 },
    mapsButtonText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  });
