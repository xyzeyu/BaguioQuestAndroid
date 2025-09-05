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

} from 'react-native';
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
import * as WebBrowser from 'expo-web-browser';

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

  const openInGoogleMaps = async () => {
    if (!poi) return;

    const query = encodeURIComponent(`${poi.name}, Baguio City`);
    const coordinates = `${poi.lat},${poi.lng}`;
    
    let url: string;
    
    if (Platform.OS === 'ios') {
      // Try to open in Google Maps app first, fallback to Apple Maps
      url = `comgooglemaps://?q=${query}&center=${coordinates}&zoom=15`;
      
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        // Fallback to Apple Maps
        const appleMapsUrl = `http://maps.apple.com/?q=${query}&ll=${coordinates}&z=15`;
        await WebBrowser.openBrowserAsync(appleMapsUrl);
      }
    } else if (Platform.OS === 'android') {
      // Android - try Google Maps app first
      url = `geo:${coordinates}?q=${query}`;
      
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        // Fallback to web version
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}&center=${coordinates}&zoom=15`;
        await WebBrowser.openBrowserAsync(webUrl);
      }
    } else {
      // Web - open Google Maps in browser
      url = `https://www.google.com/maps/search/?api=1&query=${query}&center=${coordinates}&zoom=15`;
      await WebBrowser.openBrowserAsync(url);
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
              <Text style={styles.statText}>{poi.distance ? `${poi.distance}m away` : 'Distance unknown'}</Text>
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
            {Platform.OS === 'web' ? (
              <View style={styles.webMapFallback}>
                <MapPin size={32} color="#2563eb" />
                <Text style={styles.webMapTitle}>Location Preview</Text>
                <Text style={styles.webMapCoords}>
                  {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
                </Text>
                <Text style={styles.webMapNote}>
                  Use mobile app or tap Google Maps below for interactive map
                </Text>
              </View>
            ) : (
              <View style={styles.webMapFallback}>
                <MapPin size={32} color="#2563eb" />
                <Text style={styles.webMapTitle}>Location Preview</Text>
                <Text style={styles.webMapCoords}>
                  {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
                </Text>
                <Text style={styles.webMapNote}>
                  Use mobile app or tap Google Maps below for interactive map
                </Text>
              </View>
            )}
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  webMapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  webMapCoords: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  webMapNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});