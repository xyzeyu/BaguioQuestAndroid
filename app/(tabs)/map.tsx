import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Search,
  Target,
  Clock,
  Route,
  AlertTriangle,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { POI } from '@/types/navigation';

export default function MapScreen() {
  const {
    currentLocation,
    selectedPOI,
    currentRoute,

    nearbyPOIs,
    updateLocation,
    selectPOI,
    startNavigation,

    findRoute,
  } = useBaguioQuest();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLayers, setShowLayers] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        startLocationTracking();
      } else {
        Alert.alert(
          'Location Permission Required',
          'BaguioQuest needs location access to provide navigation guidance.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const useDemoLocation = () => {
    // Use Baguio City center as demo location
    const demoLocation = {
      latitude: 16.4023,
      longitude: 120.5960,
      accuracy: 10,
    };
    
    console.log('Using demo location:', demoLocation);
    updateLocation(demoLocation);
  };

  const startLocationTracking = async () => {
    try {
      console.log('Starting location tracking...');
      
      // First try to get current position with more permissive settings
      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.High,
      });
      
      console.log('Got location:', location.coords);
      
      updateLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      });

      // Start watching position changes (not supported on web)
      if (Platform.OS !== 'web') {
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            console.log('Location updated:', location.coords);
            updateLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || 0,
            });
          }
        );
      }
    } catch (error: any) {
      console.error('Error getting location:', {
        message: error.message,
        code: error.code,
        error: error
      });
      
      // Show user-friendly error message based on error type
      let errorMessage = 'Unable to get your location. ';
      
      if (error.code === 1) {
        errorMessage += 'Location access was denied. Please enable location permissions in your device settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location is currently unavailable. Please check your GPS/network connection.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please check your location settings and try again.';
      }
      
      Alert.alert(
        'Location Error',
        errorMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use Demo Location', onPress: useDemoLocation },
          { text: 'Retry', onPress: startLocationTracking }
        ]
      );
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(tabs)/search' as any,
        params: { query: searchQuery },
      });
    }
  };

  const openInGoogleMaps = (poi?: POI) => {
    const destination = poi ? `${poi.lat},${poi.lng}` : (currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}` : '16.4023,120.5960');
    
    const url = Platform.select({
      ios: `maps://app?daddr=${destination}`,
      android: `google.navigation:q=${destination}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        // Fallback to web version
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
      });
    }
  };

  const handlePOISelect = (poi: POI) => {
    selectPOI(poi);
    if (currentLocation) {
      findRoute(currentLocation, { latitude: poi.lat, longitude: poi.lng });
    }
  };

  const handleStartNavigation = () => {
    if (currentRoute && selectedPOI) {
      startNavigation();
      router.push('/navigation' as any);
    }
  };

  if (locationPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting location permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorText}>
            BaguioQuest needs location access to provide navigation guidance.
            Please enable location permissions in your device settings.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where to? Session Rd, Burnham Park..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity 
          style={styles.layersButton}
          onPress={() => setShowLayers(!showLayers)}
        >
          <Layers size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Location Status */}
      <View style={styles.statusBar}>
        <View style={styles.locationStatus}>
          <Target size={16} color={currentLocation ? "#10b981" : "#ef4444"} />
          <Text style={styles.statusText}>
            {currentLocation 
              ? `GPS: ${currentLocation.accuracy?.toFixed(0)}m accuracy`
              : 'Searching for GPS...'
            }
          </Text>
        </View>
        {Platform.OS !== 'web' && (
          <Text style={styles.offlineIndicator}>📶 Offline Ready</Text>
        )}
      </View>

      {/* Google Maps */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#2563eb" />
            <Text style={styles.mapText}>Interactive Map</Text>
            <Text style={styles.mapSubtext}>
              Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
            
            <TouchableOpacity 
              style={styles.openMapsButton}
              onPress={() => openInGoogleMaps()}
            >
              <Navigation size={20} color="#ffffff" />
              <Text style={styles.openMapsText}>Open in Google Maps</Text>
            </TouchableOpacity>
            
            <View style={styles.webPOIList}>
              {nearbyPOIs.slice(0, 3).map((poi) => (
                <TouchableOpacity
                  key={poi.id}
                  style={styles.webPOIItem}
                  onPress={() => handlePOISelect(poi)}
                >
                  <MapPin size={16} color="#2563eb" />
                  <Text style={styles.webPOIText}>{poi.name}</Text>
                  <TouchableOpacity
                    style={styles.poiMapsButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(poi);
                    }}
                  >
                    <Navigation size={14} color="#2563eb" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#2563eb" />
            <Text style={styles.mapText}>Loading Map...</Text>
            <Text style={styles.mapSubtext}>Waiting for location...</Text>
          </View>
        )}

        {/* My Location Button */}
        <TouchableOpacity 
          style={styles.myLocationButton}
          onPress={startLocationTracking}
        >
          <Navigation size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Route Preview */}
      {currentRoute && selectedPOI && (
        <View style={styles.routePreview}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>
              To: {selectedPOI.name}
            </Text>
            <View style={styles.routeStats}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.routeTime}>{currentRoute.duration} min</Text>
              <Text style={styles.routeDistance}>{currentRoute.distance} km</Text>
              <Text style={styles.routeType}>Main Roads</Text>
            </View>
          </View>
          
          <View style={styles.routeOptions}>
            <TouchableOpacity 
              style={styles.routeOption}
              onPress={handleStartNavigation}
            >
              <Route size={20} color="#2563eb" />
              <View style={styles.routeOptionText}>
                <Text style={styles.routeOptionTitle}>Main-First Route</Text>
                <Text style={styles.routeOptionDesc}>Fewer turns • Avoids alleys</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartNavigation}
          >
            <Navigation size={20} color="#ffffff" />
            <Text style={styles.startButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby POIs */}
      <ScrollView style={styles.poisContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.poisTitle}>Nearby Places</Text>
        {nearbyPOIs.map((poi) => (
          <TouchableOpacity
            key={poi.id}
            style={styles.poiItem}
            onPress={() => handlePOISelect(poi)}
          >
            <View style={styles.poiIcon}>
              <MapPin size={20} color="#2563eb" />
            </View>
            <View style={styles.poiInfo}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiType}>{poi.type}</Text>
              {poi.hours && (
                <Text style={styles.poiHours}>{poi.hours}</Text>
              )}
            </View>
            <View style={styles.poiActions}>
              <Text style={styles.poiDistance}>{poi.distance ? `${poi.distance}m` : 'N/A'}</Text>
              <TouchableOpacity
                style={styles.poiMapsButton}
                onPress={(e) => {
                  e.stopPropagation();
                  openInGoogleMaps(poi);
                }}
              >
                <Navigation size={14} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Layers Panel */}
      {showLayers && (
        <View style={styles.layersPanel}>
          <Text style={styles.layersPanelTitle}>Map Layers</Text>
          <TouchableOpacity style={styles.layerItem}>
            <Text style={styles.layerText}>🛣️ Main Roads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerItem}>
            <Text style={styles.layerText}>↪️ One-Way Streets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerItem}>
            <Text style={styles.layerText}>⛰️ Slope Hints</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerItem}>
            <Text style={styles.layerText}>🅿️ Parking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerItem}>
            <Text style={styles.layerText}>🚻 Restrooms</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#1f2937',
  },
  layersButton: {
    padding: 8,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    margin: 16,
    borderRadius: 12,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routePreview: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeTime: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  routeDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  routeType: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeOptions: {
    marginBottom: 16,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  routeOptionText: {
    marginLeft: 12,
  },
  routeOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  routeOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  poisContainer: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    padding: 16,
    paddingBottom: 8,
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  poiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  poiType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  poiHours: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  poiDistance: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  layersPanel: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  layersPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  layerItem: {
    paddingVertical: 8,
  },
  layerText: {
    fontSize: 14,
    color: '#374151',
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  openMapsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  webPOIList: {
    marginTop: 16,
    gap: 8,
  },
  webPOIItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
  webPOIText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  poiActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poiMapsButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#eff6ff',
  },
});