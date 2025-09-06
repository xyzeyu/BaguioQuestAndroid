import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Route } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { setSplashSeen, hasAcceptedTerms, updateLocation } = useBaguioQuest();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestLocationPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermissionGranted(granted);
      
      if (granted) {
        // Get initial location
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.High,
          });
          
          updateLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          });
        } catch (error) {
          console.log('Could not get initial location:', error);
          // Use Baguio City center as fallback
          updateLocation({
            latitude: 16.4023,
            longitude: 120.5960,
            accuracy: 10,
          });
        }
      } else {
        Alert.alert(
          'Location Permission Required',
          'BaguioQuest needs location access to provide accurate navigation and distance calculations. You can still use the app with limited functionality.',
          [
            { text: 'Continue Anyway', onPress: handleContinue },
            { text: 'Grant Permission', onPress: requestLocationPermission },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermissionGranted(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleContinue = async () => {
    await setSplashSeen();
    
    if (hasAcceptedTerms) {
      router.replace('/(tabs)/map');
    } else {
      router.replace('/terms');
    }
  };

  const handleGetStarted = () => {
    if (locationPermissionGranted === null) {
      requestLocationPermission();
    } else {
      handleContinue();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        {/* Animated Logo Section */}
        <Animated.View 
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <MapPin size={48} color="#ffffff" />
            </View>
            <Text style={styles.appName}>BaguioQuest</Text>
            <Text style={styles.tagline}>Navigate Baguio with Confidence</Text>
          </View>

          {/* Feature Icons */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Navigation size={24} color="#93c5fd" />
              <Text style={styles.featureText}>GPS Navigation</Text>
            </View>
            <View style={styles.featureItem}>
              <Route size={24} color="#93c5fd" />
              <Text style={styles.featureText}>Main Roads First</Text>
            </View>
            <View style={styles.featureItem}>
              <MapPin size={24} color="#93c5fd" />
              <Text style={styles.featureText}>Local POIs</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View 
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.welcomeText}>
            Welcome to your Baguio City navigation companion
          </Text>
          <Text style={styles.descriptionText}>
            Discover main roads, avoid one-way streets, and navigate with local insights.
          </Text>

          <TouchableOpacity 
            style={[
              styles.continueButton,
              isRequestingPermission && styles.continueButtonDisabled
            ]}
            onPress={handleGetStarted}
            disabled={isRequestingPermission}
          >
            <Text style={styles.continueButtonText}>
              {isRequestingPermission 
                ? 'Requesting Permission...' 
                : locationPermissionGranted === null 
                  ? 'Enable Location Access'
                  : 'Get Started'
              }
            </Text>
          </TouchableOpacity>

          {locationPermissionGranted === false && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleContinue}
            >
              <Text style={styles.skipButtonText}>Continue Without Location</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  background: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#bfdbfe',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  descriptionText: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#1e40af',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  skipButtonText: {
    color: '#93c5fd',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#93c5fd',
    opacity: 0.8,
  },
});