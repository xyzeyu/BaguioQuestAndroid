import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { POI, RouteInfo, Location, NavigationSettings } from '@/types/navigation';
import { mockPOIs } from '@/mocks/pois';
import { calculateDistance, findMainRoadRoute } from '@/utils/navigation';

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

export const [BaguioQuestProvider, useBaguioQuest] = createContextHook(() => {
  const [state, setState] = useState<BaguioQuestState>({
    currentLocation: null,
    selectedPOI: null,
    currentRoute: null,
    isNavigating: false,
    nearbyPOIs: [],
    savedPOIs: [],
    recentSearches: [],
    popularPOIs: mockPOIs.slice(0, 5),
    settings: defaultSettings,
    isDarkMode: false,
    hasSeenSplash: false,
    hasAcceptedTerms: false,
  });

  // Load saved data on initialization
  useEffect(() => {
    loadSavedData();
  }, []);

  // Update nearby POIs when location changes
  useEffect(() => {
    if (state.currentLocation) {
      updateNearbyPOIs(state.currentLocation);
    }
  }, [state.currentLocation]);

  const loadSavedData = async () => {
    try {
      const [savedPOIs, recentSearches, settings, isDarkMode, hasSeenSplash, hasAcceptedTerms] = await Promise.all([
        AsyncStorage.getItem('baguio_saved_pois'),
        AsyncStorage.getItem('baguio_recent_searches'),
        AsyncStorage.getItem('baguio_settings'),
        AsyncStorage.getItem('baguio_dark_mode'),
        AsyncStorage.getItem('baguio_seen_splash'),
        AsyncStorage.getItem('baguio_accepted_terms'),
      ]);

      setState(prev => ({
        ...prev,
        savedPOIs: savedPOIs ? JSON.parse(savedPOIs) : [],
        recentSearches: recentSearches ? JSON.parse(recentSearches) : [],
        settings: settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings,
        isDarkMode: isDarkMode ? JSON.parse(isDarkMode) : false,
        hasSeenSplash: hasSeenSplash ? JSON.parse(hasSeenSplash) : false,
        hasAcceptedTerms: hasAcceptedTerms ? JSON.parse(hasAcceptedTerms) : false,
      }));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const updateLocation = useCallback((location: Location) => {
    setState(prev => ({
      ...prev,
      currentLocation: location,
    }));
  }, []);

  const updateNearbyPOIs = (location: Location) => {
    const poisWithDistance = mockPOIs.map(poi => ({
      ...poi,
      distance: Math.round(calculateDistance(
        location.latitude,
        location.longitude,
        poi.lat,
        poi.lng
      )),
    })).sort((a, b) => a.distance - b.distance);

    setState(prev => ({
      ...prev,
      nearbyPOIs: poisWithDistance.slice(0, 10),
    }));
  };

  const selectPOI = useCallback((poi: POI) => {
    setState(prev => ({
      ...prev,
      selectedPOI: poi,
    }));
  }, []);

  const findRoute = useCallback((from: Location, to: Location) => {
    const route = findMainRoadRoute(from, to, state.settings);
    setState(prev => ({
      ...prev,
      currentRoute: route,
    }));
  }, [state.settings]);

  const startNavigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isNavigating: true,
    }));
  }, []);

  const stopNavigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isNavigating: false,
      currentRoute: null,
    }));
  }, []);

  const searchPOIs = useCallback(async (query: string): Promise<POI[]> => {
    // Add to recent searches
    const newRecentSearches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10);
    setState(prev => ({
      ...prev,
      recentSearches: newRecentSearches,
    }));
    
    // Save to storage
    await AsyncStorage.setItem('baguio_recent_searches', JSON.stringify(newRecentSearches));

    // Filter POIs based on query
    const results = mockPOIs.filter(poi =>
      poi.name.toLowerCase().includes(query.toLowerCase()) ||
      poi.type.toLowerCase().includes(query.toLowerCase()) ||
      (poi.description && poi.description.toLowerCase().includes(query.toLowerCase()))
    );

    // Add distance if location is available
    if (state.currentLocation) {
      return results.map(poi => ({
        ...poi,
        distance: Math.round(calculateDistance(
          state.currentLocation!.latitude,
          state.currentLocation!.longitude,
          poi.lat,
          poi.lng
        )),
      }));
    }

    return results;
  }, [state.recentSearches, state.currentLocation]);

  const getPOIById = useCallback((id: string): POI | null => {
    return mockPOIs.find(poi => poi.id === id) || null;
  }, []);

  const savePOI = useCallback(async (poi: POI) => {
    const newSavedPOIs = [...state.savedPOIs, poi];
    setState(prev => ({
      ...prev,
      savedPOIs: newSavedPOIs,
    }));
    
    await AsyncStorage.setItem('baguio_saved_pois', JSON.stringify(newSavedPOIs));
  }, [state.savedPOIs]);

  const isSavedPOI = useCallback((poiId: string): boolean => {
    return state.savedPOIs.some(poi => poi.id === poiId);
  }, [state.savedPOIs]);

  const updateSettings = useCallback(async (newSettings: Partial<NavigationSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    setState(prev => ({
      ...prev,
      settings: updatedSettings,
    }));
    
    await AsyncStorage.setItem('baguio_settings', JSON.stringify(updatedSettings));
  }, [state.settings]);

  const toggleDarkMode = useCallback(async () => {
    const newDarkMode = !state.isDarkMode;
    setState(prev => ({
      ...prev,
      isDarkMode: newDarkMode,
    }));
    await AsyncStorage.setItem('baguio_dark_mode', JSON.stringify(newDarkMode));
  }, [state.isDarkMode]);

  const setSplashSeen = useCallback(async () => {
    setState(prev => ({
      ...prev,
      hasSeenSplash: true,
    }));
    await AsyncStorage.setItem('baguio_seen_splash', JSON.stringify(true));
  }, []);

  const acceptTerms = useCallback(async () => {
    setState(prev => ({
      ...prev,
      hasAcceptedTerms: true,
    }));
    await AsyncStorage.setItem('baguio_accepted_terms', JSON.stringify(true));
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        'baguio_saved_pois',
        'baguio_recent_searches',
        'baguio_offline_maps',
      ]);
      
      setState(prev => ({
        ...prev,
        savedPOIs: [],
        recentSearches: [],
      }));
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = {
        savedPOIs: state.savedPOIs,
        settings: state.settings,
        exportDate: new Date().toISOString(),
      };
      
      // In a real app, this would trigger a file download or share
      console.log('Exporting data:', data);
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }, [state.savedPOIs, state.settings]);

  return {
    // State
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

    // Actions
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