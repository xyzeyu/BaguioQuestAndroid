// hooks/use-baguio-quest.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

import type { POI, RouteInfo, Location, NavigationSettings } from '../types/navigation';
import { mockPOIs } from '../mocks/pois';
import { calculateDistanceMeters, findMainRoadRoute } from '../utils/navigation';

const hasCoords = (p: POI): p is POI & { lat: number; lng: number } =>
  typeof (p as any).lat === 'number' && typeof (p as any).lng === 'number';

interface BaguioQuestState {
  currentLocation: Location | null;
  selectedPOI: POI | null;
  currentRoute: RouteInfo | null;
  isNavigating: boolean;
  nearbyPOIs: POI[];
  savedPOIs: POI[];
  recentSearches: string[];
  popularPOIs: POI[];
  settings: NavigationSettings;
  isDarkMode: boolean;
  hasSeenSplash: boolean;
  hasAcceptedTerms: boolean;
}

const defaultSettings: NavigationSettings = {
  numberCodingEnabled: true,
  offlineMode: false,
  notifications: true,
  units: 'metric',
  avoidTolls: false,
  preferMainRoads: true,
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const [BaguioQuestProvider, useBaguioQuest] = createContextHook(() => {
  const [state, setState] = useState<BaguioQuestState>({
    currentLocation: null,
    selectedPOI: null,
    currentRoute: null,
    isNavigating: false,
    nearbyPOIs: [],
    savedPOIs: [],
    recentSearches: [],
    popularPOIs: mockPOIs.slice(0, 8),
    settings: defaultSettings,
    isDarkMode: false,
    hasSeenSplash: false,
    hasAcceptedTerms: false,
  });

  // Load persisted data once
  useEffect(() => {
    (async () => {
      try {
        const [savedPOIsRaw, recentRaw, settingsRaw, darkRaw, seenRaw, acceptedRaw] =
          await Promise.all([
            AsyncStorage.getItem('baguio_saved_pois'),
            AsyncStorage.getItem('baguio_recent_searches'),
            AsyncStorage.getItem('baguio_settings'),
            AsyncStorage.getItem('baguio_dark_mode'),
            AsyncStorage.getItem('baguio_seen_splash'),
            AsyncStorage.getItem('baguio_accepted_terms'),
          ]);

        const savedPOIs = safeParse<POI[]>(savedPOIsRaw, []);
        const recentSearches = safeParse<string[]>(recentRaw, []);
        const loadedSettings = { ...defaultSettings, ...safeParse<Partial<NavigationSettings>>(settingsRaw, {}) };
        const isDarkMode = safeParse<boolean>(darkRaw, false);
        const hasSeenSplash = safeParse<boolean>(seenRaw, false);
        const hasAcceptedTerms = safeParse<boolean>(acceptedRaw, false);

        setState(prev => ({
          ...prev,
          savedPOIs,
          recentSearches,
          settings: loadedSettings,
          isDarkMode,
          hasSeenSplash,
          hasAcceptedTerms,
        }));
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    })();
  }, []);

  // Recompute distances from current GPS
  useEffect(() => {
    if (!state.currentLocation) return;
    const { latitude, longitude } = state.currentLocation;

    const withDistances = mockPOIs
      .map(poi =>
        hasCoords(poi)
          ? { ...poi, distanceMeters: calculateDistanceMeters(latitude, longitude, poi.lat, poi.lng) }
          : { ...poi, distanceMeters: undefined }
      )
      .sort((a, b) => (a.distanceMeters ?? Number.POSITIVE_INFINITY) - (b.distanceMeters ?? Number.POSITIVE_INFINITY));

    setState(prev => ({
      ...prev,
      nearbyPOIs: withDistances.slice(0, 10),
      popularPOIs: withDistances.slice(0, 8),
    }));
  }, [state.currentLocation]);

  // Actions
  const updateLocation = useCallback((location: Location) => {
    setState(prev => ({ ...prev, currentLocation: location }));
  }, []);

  const selectPOI = useCallback((poi: POI) => {
    setState(prev => ({ ...prev, selectedPOI: poi }));
  }, []);

  const findRoute = useCallback((from: Location, to: Location) => {
    const route = findMainRoadRoute(from, to, state.settings);
    setState(prev => ({ ...prev, currentRoute: route }));
  }, [state.settings]);

  const startNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isNavigating: true }));
  }, []);

  const stopNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isNavigating: false, currentRoute: null }));
  }, []);

  const searchPOIs = useCallback(async (query: string): Promise<POI[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const newRecent = [trimmed, ...state.recentSearches.filter(s => s !== trimmed)].slice(0, 10);
    setState(prev => ({ ...prev, recentSearches: newRecent }));
    await AsyncStorage.setItem('baguio_recent_searches', JSON.stringify(newRecent));

    const results = mockPOIs.filter(p =>
      p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      p.type.toLowerCase().includes(trimmed.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(trimmed.toLowerCase()))
    );

    if (state.currentLocation) {
      const { latitude, longitude } = state.currentLocation;
      return results
        .map(p => (hasCoords(p)
          ? { ...p, distanceMeters: calculateDistanceMeters(latitude, longitude, p.lat, p.lng) }
          : { ...p, distanceMeters: undefined }))
        .sort((a, b) => (a.distanceMeters ?? Number.POSITIVE_INFINITY) - (b.distanceMeters ?? Number.POSITIVE_INFINITY));
    }

    return results;
  }, [state.recentSearches, state.currentLocation]);

  const getPOIById = useCallback((id: string): POI | null => {
    return mockPOIs.find(p => p.id === id) ?? null;
  }, []);

  const savePOI = useCallback(async (poi: POI) => {
    const exists = state.savedPOIs.some(p => p.id === poi.id);
    const next = exists ? state.savedPOIs : [...state.savedPOIs, poi];
    setState(prev => ({ ...prev, savedPOIs: next }));
    await AsyncStorage.setItem('baguio_saved_pois', JSON.stringify(next));
  }, [state.savedPOIs]);

  const isSavedPOI = useCallback((poiId: string): boolean => {
    return state.savedPOIs.some(p => p.id === poiId);
  }, [state.savedPOIs]);

  const updateSettings = useCallback(async (patch: Partial<NavigationSettings>) => {
    const next = { ...state.settings, ...patch };
    setState(prev => ({ ...prev, settings: next }));
    await AsyncStorage.setItem('baguio_settings', JSON.stringify(next));
  }, [state.settings]);

  const toggleDarkMode = useCallback(async () => {
    const next = !state.isDarkMode;
    setState(prev => ({ ...prev, isDarkMode: next }));
    await AsyncStorage.setItem('baguio_dark_mode', JSON.stringify(next));
  }, [state.isDarkMode]);

  const setSplashSeen = useCallback(async () => {
    setState(prev => ({ ...prev, hasSeenSplash: true }));
    await AsyncStorage.setItem('baguio_seen_splash', JSON.stringify(true));
  }, []);

  const acceptTerms = useCallback(async () => {
    setState(prev => ({ ...prev, hasAcceptedTerms: true }));
    await AsyncStorage.setItem('baguio_accepted_terms', JSON.stringify(true));
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        'baguio_saved_pois',
        'baguio_recent_searches',
      ]);
      setState(prev => ({ ...prev, savedPOIs: [], recentSearches: [] }));
    } catch (e) {
      console.error('Error clearing cache:', e);
      throw e;
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = {
        savedPOIs: state.savedPOIs,
        settings: state.settings,
        exportDate: new Date().toISOString(),
      };
      console.log('Exporting data:', data);
      return data;
    } catch (e) {
      console.error('Error exporting data:', e);
      throw e;
    }
  }, [state.savedPOIs, state.settings]);

  return {
    currentLocation: state.currentLocation,
    selectedPOI: state.selectedPOI,
    currentRoute: state.currentRoute,
    isNavigating: state.isNavigating,
    nearbyPOIs: state.nearbyPOIs,
    savedPOIs: state.savedPOIs,
    recentSearches: state.recentSearches,
    popularPOIs: state.popularPOIs,
    settings: state.settings,
    isDarkMode: state.isDarkMode,
    hasSeenSplash: state.hasSeenSplash,
    hasAcceptedTerms: state.hasAcceptedTerms,

    updateLocation,
    selectPOI,
    findRoute,
    startNavigation,
    stopNavigation,
    searchPOIs,
    getPOIById,
    savePOI,
    isSavedPOI,
    updateSettings,
    toggleDarkMode,
    setSplashSeen,
    acceptTerms,
    clearCache,
    exportData,
  };
});
