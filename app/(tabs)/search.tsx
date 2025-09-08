// app/(tabs)/search.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import type { POI } from '@/types/navigation';

/** Type guard for POIs that have coordinates merged in */
const hasCoords = (p: POI): p is POI & { lat: number; lng: number } =>
  typeof (p as any).lat === 'number' && typeof (p as any).lng === 'number';

/** Local Haversine so we can safely compute meters here without relying on utils */
const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const formatDistance = (meters?: number) => {
  if (typeof meters !== 'number' || Number.isNaN(meters)) return 'N/A';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

type CategoryKey =
  | 'all'
  | 'parks'
  | 'attractions'
  | 'restaurants'
  | 'hotels'
  | 'shopping'
  | 'gas';

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  query: string; // what we pass to searchPOIs
  icon: keyof typeof Ionicons.glyphMap; // ✅ Ionicons only
}> = [
  { key: 'all',         label: 'All',          query: '',                   icon: 'grid-outline' },
  { key: 'parks',       label: 'Parks',        query: 'Park',               icon: 'leaf-outline' },
  { key: 'attractions', label: 'Attractions',  query: 'Tourist Attraction', icon: 'image-outline' },
  { key: 'restaurants', label: 'Restaurants',  query: 'Restaurant',         icon: 'restaurant-outline' },
  { key: 'hotels',      label: 'Hotels',       query: 'Hotel',              icon: 'bed-outline' },
  { key: 'shopping',    label: 'Shopping',     query: 'Shopping',           icon: 'cart-outline' },
  { key: 'gas',         label: 'Gas',          query: 'Gas Station',        icon: 'car-outline' },
];

export default function SearchScreen() {
  const {
    isDarkMode,
    currentLocation,
    nearbyPOIs,          // pre-sorted with distance by the provider when location is known
    searchPOIs,          // async(text) → POI[]
  } = useBaguioQuest();

  const dark = !!isDarkMode;
  const styles = createStyles(dark);

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryKey>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<POI[]>([]);

  const inputRef = useRef<TextInput>(null);

  // Initial load: show nearby (if any), otherwise empty until user searches or taps a category
  useEffect(() => {
    if (selectedCat === 'all') {
      setResults(nearbyPOIs ?? []);
    }
  }, [nearbyPOIs, selectedCat]);

  // Re-run when category changes (only if not 'all')
  useEffect(() => {
    const run = async () => {
      if (selectedCat === 'all') {
        setResults(nearbyPOIs ?? []);
        return;
      }
      const catDef = CATEGORIES.find(c => c.key === selectedCat);
      if (!catDef) return;
      setLoading(true);
      try {
        const out = await searchPOIs(catDef.query);
        setResults(out);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat]);

  const onSubmitSearch = async () => {
    const text = query.trim();
    if (!text) {
      if (selectedCat === 'all') setResults(nearbyPOIs ?? []);
      else {
        const catDef = CATEGORIES.find(c => c.key === selectedCat);
        if (catDef) {
          setLoading(true);
          try {
            const out = await searchPOIs(catDef.query);
            setResults(out);
          } finally {
            setLoading(false);
          }
        }
      }
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      const out = await searchPOIs(text);
      setResults(out);
    } finally {
      setLoading(false);
    }
  };

  // Enrich results with distance (fallback compute if not provided)
  const resultsWithDistance = useMemo(() => {
    return results
      .map((p) => {
        let meters = (p as any).distanceMeters as number | undefined;
        if (
          typeof meters !== 'number' &&
          currentLocation &&
          hasCoords(p)
        ) {
          meters = haversineMeters(
            currentLocation.latitude,
            currentLocation.longitude,
            p.lat,
            p.lng
          );
        }
        return { ...p, distanceMeters: meters };
      })
      .sort((a: any, b: any) => {
        const da = typeof a.distanceMeters === 'number' ? a.distanceMeters : Number.POSITIVE_INFINITY;
        const db = typeof b.distanceMeters === 'number' ? b.distanceMeters : Number.POSITIVE_INFINITY;
        return da - db;
      });
  }, [results, currentLocation]);

  const openDetails = (poi: POI) => {
    router.push({ pathname: '/poi-details', params: { poiId: poi.id } } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header search */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={dark ? '#9ca3af' : '#6b7280'} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search places, parks, restaurants…"
            placeholderTextColor={dark ? '#9ca3af' : '#6b7280'}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults(nearbyPOIs ?? []); }}>
              <Ionicons name="close-circle-outline" size={20} color={dark ? '#9ca3af' : '#94a3b8'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={onSubmitSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results list */}
      <ScrollView
        style={styles.results}
        contentContainerStyle={{ paddingBottom: 96 }} // leave room for bottom categories
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.muted}>Searching…</Text>
        ) : resultsWithDistance.length === 0 ? (
          <Text style={styles.muted}>No results. Try another keyword or a category below.</Text>
        ) : (
          resultsWithDistance.map((poi) => (
            <TouchableOpacity key={poi.id} style={styles.item} onPress={() => openDetails(poi)}>
              <View style={styles.itemIcon}>
                <Ionicons name="location-outline" size={18} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{poi.name}</Text>
                <Text style={styles.itemType}>{poi.type}</Text>
                {(poi as any).hours ? (
                  <Text style={styles.itemHours}>{(poi as any).hours}</Text>
                ) : null}
              </View>
              <Text style={styles.itemDistance}>
                {formatDistance((poi as any).distanceMeters)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Category Bar (fixed) */}
      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {CATEGORIES.map((c) => {
            const active = c.key === selectedCat;
            const bg = active ? '#2563eb' : dark ? '#0b0b0b' : '#eef2ff';
            const color = active ? '#fff' : '#2563eb';
            const border = dark ? 1 : 0;

            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.catChip, { backgroundColor: bg, borderWidth: border }]}
                onPress={() => setSelectedCat(c.key)}
              >
                <Ionicons name={c.icon} size={16} color={color} />
                <Text style={[styles.catText, { color }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#000' : '#f8fafc' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      paddingBottom: 8,
      backgroundColor: dark ? '#0b0b0b' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f2937' : '#e5e7eb',
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: dark ? '#111827' : '#f3f4f6',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: dark ? '#f9fafb' : '#1f2937',
    },
    searchBtn: {
      backgroundColor: '#2563eb',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    searchBtnText: { color: '#fff', fontWeight: '600' },

    results: { flex: 1, paddingTop: 8, paddingHorizontal: 12 },
    muted: {
      color: dark ? '#9ca3af' : '#6b7280',
      padding: 16,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 8,
      paddingVertical: 12,
      backgroundColor: dark ? '#0b0b0b' : '#fff',
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    itemIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: dark ? '#0b0b0b' : '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: dark ? 1 : 0,
      borderColor: '#1f2937',
    },
    itemName: { color: dark ? '#f9fafb' : '#1f2937', fontWeight: '600' },
    itemType: { color: dark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 },
    itemHours: { color: '#10b981', fontSize: 12, marginTop: 2 },
    itemDistance: { color: dark ? '#9ca3af' : '#6b7280', fontWeight: '500' },

    categoryBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingVertical: 10,
      backgroundColor: dark ? '#000' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: dark ? '#1f2937' : '#e5e7eb',
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderColor: '#1f2937',
    },
    catText: { fontWeight: '600' },
  });
