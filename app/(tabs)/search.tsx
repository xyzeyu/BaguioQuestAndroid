import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Clock, Star, ArrowLeft, Navigation } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { POI } from '@/types/navigation';

export default function SearchScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { searchPOIs, recentSearches, popularPOIs, currentLocation, settings } = useBaguioQuest();
  
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const performSearch = React.useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchPOIs(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchPOIs]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, performSearch]);

  useFocusEffect(
    React.useCallback(() => {
      if (query) {
        setSearchQuery(query);
        setShowSearchResults(true);
      }
    }, [query])
  );



  const handlePOISelect = (poi: POI) => {
    router.push({
      pathname: '/poi-details' as any,
      params: { poiId: poi.id },
    });
  };

  const openInGoogleMaps = (poi: POI) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${poi.lat},${poi.lng}`,
      android: `google.navigation:q=${poi.lat},${poi.lng}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        // Fallback to web version
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`);
      });
    }
  };

  const getDistanceText = (poi: POI) => {
    if (!currentLocation || !poi.distance) return 'N/A';
    
    if (settings.units === 'imperial') {
      const miles = poi.distance * 0.000621371;
      return miles < 1 ? `${Math.round(poi.distance * 3.28084)} ft` : `${miles.toFixed(1)} mi`;
    }
    
    // Always show in kilometers for better readability
    return `${(poi.distance / 1000).toFixed(1)}km`;
  };

  const renderPOI = ({ item }: { item: POI }) => (
    <TouchableOpacity
      style={styles.poiItem}
      onPress={() => handlePOISelect(item)}
    >
      <View style={styles.poiIcon}>
        <MapPin size={20} color="#2563eb" />
      </View>
      <View style={styles.poiInfo}>
        <Text style={styles.poiName}>{item.name}</Text>
        <Text style={styles.poiType}>{item.type}</Text>
        {item.hours && (
          <Text style={styles.poiHours}>{item.hours}</Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.poiActions}>
        <Text style={styles.poiDistance}>{getDistanceText(item)}</Text>
        {currentLocation && settings.offlineMode === false && (
          <TouchableOpacity
            style={styles.mapsButton}
            onPress={() => openInGoogleMaps(item)}
          >
            <Navigation size={16} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        {showSearchResults && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSearchQuery('');
              setShowSearchResults(false);
              setSearchResults([]);
            }}
          >
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
        )}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places in Baguio..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={!!query}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {showSearchResults && searchQuery.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
            </Text>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderPOI}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : !isSearching && (
              <Text style={styles.noResults}>No places found</Text>
            )}
          </View>
        )}

        {/* Recent Searches */}
        {!showSearchResults && recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => setSearchQuery(search)}
              >
                <Clock size={16} color="#6b7280" />
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Popular Places */}
        {!showSearchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Places</Text>
            <FlatList
              data={popularPOIs}
              renderItem={renderPOI}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Quick Categories */}
        {!showSearchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {[
                { name: 'Tourist Spots', icon: '🏛️', query: 'tourist' },
                { name: 'Restaurants', icon: '🍽️', query: 'restaurant' },
                { name: 'Hotels', icon: '🏨', query: 'hotel' },
                { name: 'Shopping', icon: '🛍️', query: 'shopping' },
                { name: 'Parks', icon: '🌳', query: 'park' },
                { name: 'Gas Stations', icon: '⛽', query: 'gas' },
              ].map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={styles.categoryItem}
                  onPress={() => setSearchQuery(category.query)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#1f2937',
  },
  content: {
    flex: 1,
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
    marginBottom: 12,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 4,
    fontWeight: '500',
  },
  poiActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  poiDistance: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  mapsButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#eff6ff',
  },
  noResults: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recentText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
});