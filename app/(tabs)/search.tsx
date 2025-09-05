import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Clock, Star, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { POI } from '@/types/navigation';

export default function SearchScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { searchPOIs, recentSearches, popularPOIs } = useBaguioQuest();
  
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchPOIs(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePOISelect = (poi: POI) => {
    router.push({
      pathname: '/poi-details' as any,
      params: { poiId: poi.id },
    });
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
      <Text style={styles.poiDistance}>{item.distance ? `${item.distance}m` : 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/map' as any)}
        >
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places in Baguio..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {searchQuery.trim() && (
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
        {!searchQuery.trim() && recentSearches.length > 0 && (
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
        {!searchQuery.trim() && (
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
        {!searchQuery.trim() && (
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
  poiDistance: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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