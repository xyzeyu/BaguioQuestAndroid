import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Phone,
  Globe,
  Navigation,
  Bookmark,
  Share,
  Car,
  Wifi,
  CreditCard,
  ExternalLink,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { POI } from '@/types/navigation';

export default function POIDetailsScreen() {
  const { poiId } = useLocalSearchParams<{ poiId: string }>();
  const { 
    getPOIById, 
    currentLocation, 
    findRoute, 
    selectPOI,
    savePOI,
    isSavedPOI,
  } = useBaguioQuest();

  const [poi, setPOI] = useState<POI | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (poiId) {
      const poiData = getPOIById(poiId);
      setPOI(poiData);
      setIsSaved(isSavedPOI(poiId));
    }
  }, [poiId, getPOIById, isSavedPOI]);

  const handleNavigate = () => {
    if (!poi || !currentLocation) {
      Alert.alert('Error', 'Unable to start navigation. Please check your location.');
      return;
    }

    selectPOI(poi);
    findRoute(currentLocation, { latitude: poi.lat, longitude: poi.lng });
    router.push('/');
  };

  const handleSave = () => {
    if (!poi) return;

    if (isSaved) {
      // Remove from saved
      setIsSaved(false);
      Alert.alert('Removed', `${poi.name} removed from saved places.`);
    } else {
      // Add to saved
      savePOI(poi);
      setIsSaved(true);
      Alert.alert('Saved', `${poi.name} added to saved places.`);
    }
  };

  const handleShare = () => {
    if (!poi) return;
    
    Alert.alert(
      'Share Location',
      `Share ${poi.name} with others?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            console.log(`Sharing ${poi.name}`);
            // Implement sharing functionality
          }
        },
      ]
    );
  };

  const openInGoogleMaps = () => {
    if (!poi) return;

    const destination = `${poi.lat},${poi.lng}`;
    
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

  if (!poi) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Place not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSave}
          >
            <Bookmark 
              size={24} 
              color={isSaved ? "#2563eb" : "#6b7280"}
              fill={isSaved ? "#2563eb" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Share size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {poi.photos && poi.photos.length > 0 && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: poi.photos[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{poi.name}</Text>
              <Text style={styles.type}>{poi.type}</Text>
            </View>
            {poi.rating && (
              <View style={styles.ratingContainer}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.rating}>{poi.rating}</Text>
              </View>
            )}
          </View>

          {poi.description && (
            <Text style={styles.description}>{poi.description}</Text>
          )}

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.statText}>
              {poi.distance 
                ? poi.distance < 1000 
                  ? `${Math.round(poi.distance)}m away`
                  : `${(poi.distance / 1000).toFixed(1)}km away`
                : 'Distance unknown'
              }
            </Text>
            </View>
            {poi.hours && (
              <View style={styles.statItem}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.statText}>{poi.hours}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        {(poi.phone || poi.website) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {poi.phone && (
              <TouchableOpacity style={styles.contactItem}>
                <Phone size={20} color="#2563eb" />
                <Text style={styles.contactText}>{poi.phone}</Text>
              </TouchableOpacity>
            )}
            {poi.website && (
              <TouchableOpacity style={styles.contactItem}>
                <Globe size={20} color="#2563eb" />
                <Text style={styles.contactText}>{poi.website}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Amenities */}
        {poi.amenities && poi.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {poi.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  {getAmenityIcon(amenity)}
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Parking Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parking & Access</Text>
          <View style={styles.parkingInfo}>
            <Car size={20} color="#6b7280" />
            <View style={styles.parkingText}>
              <Text style={styles.parkingTitle}>Parking Available</Text>
              <Text style={styles.parkingDescription}>
                Street parking and nearby lots. Check for number coding restrictions.
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              source={{
                html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 200px; width: 100%; }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-family: Arial, sans-serif;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div id="loading" class="loading">Loading map...</div>
  <div id="map" style="display: none;"></div>
  <script>
    function initMap() {
      const location = { lat: ${poi.lat}, lng: ${poi.lng} };
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: location,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });
      
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: '${poi.name.replace(/'/g, "\\'").replace(/"/g, '\\"')}',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ef4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: '<div style="padding: 8px; max-width: 200px;"><h3 style="margin: 0 0 4px 0; font-size: 14px; color: #1f2937;">' + '${poi.name.replace(/'/g, "\\'").replace(/"/g, '\\"')}' + '</h3><p style="margin: 0; font-size: 12px; color: #6b7280;">' + '${poi.type}' + '</p>' + ${poi.rating ? `'<p style="margin: 4px 0 0 0; font-size: 12px; color: #f59e0b;">⭐ ${poi.rating}</p>'` : `''`} + '</div>'
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      document.getElementById('loading').style.display = 'none';
      document.getElementById('map').style.display = 'block';
    }
    
    function onError() {
      document.getElementById('loading').innerHTML = 'Map failed to load';
    }
  </script>
  <script async defer 
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqCGUOdFZE&callback=initMap"
    onerror="onError()">
  </script>
</body>
</html>`
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          {/* Coordinates Info */}
          <View style={styles.coordinatesInfo}>
            <Text style={styles.coordinatesLabel}>Coordinates:</Text>
            <Text style={styles.coordinatesText}>
              {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Navigation Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>
              🛣️ Main road access via Session Road
            </Text>
            <Text style={styles.tip}>
              ⚠️ Watch for one-way streets in the area
            </Text>
            <Text style={styles.tip}>
              🅿️ Limited parking during peak hours
            </Text>
            {poi.type === 'Tourist Attraction' && (
              <Text style={styles.tip}>
                📸 Popular photo spot - expect crowds on weekends
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={handleNavigate}
          >
            <Navigation size={20} color="#ffffff" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapsButton}
            onPress={openInGoogleMaps}
          >
            <ExternalLink size={20} color="#2563eb" />
            <Text style={styles.mapsButtonText}>Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi size={16} color="#10b981" />;
    case 'parking':
      return <Car size={16} color="#10b981" />;
    case 'credit cards':
      return <CreditCard size={16} color="#10b981" />;
    default:
      return <MapPin size={16} color="#10b981" />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#2563eb',
    marginLeft: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  amenityText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '500',
  },
  parkingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  parkingText: {
    marginLeft: 12,
    flex: 1,
  },
  parkingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  parkingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bottomActions: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    gap: 8,
  },
  mapsButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  coordinatesLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginRight: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});