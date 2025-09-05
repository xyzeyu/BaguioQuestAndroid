import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Navigation as NavigationIcon,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  MapPin,
  Clock,
  Route,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import * as Haptics from 'expo-haptics';

interface NavigationInstruction {
  id: string;
  type: 'straight' | 'left' | 'right' | 'u-turn' | 'destination';
  instruction: string;
  distance: string;
  street?: string;
  warning?: string;
}

export default function NavigationScreen() {
  const {
    currentRoute,
    selectedPOI,
    currentLocation,
    isNavigating,
    stopNavigation,
  } = useBaguioQuest();

  const [currentInstruction, setCurrentInstruction] = useState<NavigationInstruction>({
    id: '1',
    type: 'straight',
    instruction: 'Head north on Session Road',
    distance: '200m',
    street: 'Session Road',
  });

  const [nextInstruction, setNextInstruction] = useState<NavigationInstruction>({
    id: '2',
    type: 'right',
    instruction: 'Turn right onto Burnham Park Road',
    distance: '500m',
    street: 'Burnham Park Road',
  });

  const [navigationStats] = useState({
    remainingTime: '12 min',
    remainingDistance: '3.2 km',
    estimatedArrival: '2:45 PM',
  });

  useEffect(() => {
    if (!isNavigating || !currentRoute || !selectedPOI) {
      router.back();
      return;
    }

    // Simulate navigation updates
    const interval = setInterval(() => {
      // Update instructions based on location
      updateNavigationInstructions();
    }, 5000);

    return () => clearInterval(interval);
  }, [isNavigating, currentRoute, selectedPOI]);

  const updateNavigationInstructions = () => {
    // Simulate instruction updates
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    // This would normally be based on GPS location and route progress
    console.log('Updating navigation instructions...');
  };

  const handleStopNavigation = () => {
    Alert.alert(
      'Stop Navigation',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => {
            stopNavigation();
            router.back();
          }
        },
      ]
    );
  };

  const getInstructionIcon = (type: string) => {
    switch (type) {
      case 'left':
        return <ArrowLeft size={32} color="#ffffff" />;
      case 'right':
        return <ArrowRight size={32} color="#ffffff" />;
      case 'u-turn':
        return <RotateCcw size={32} color="#ffffff" />;
      case 'destination':
        return <MapPin size={32} color="#ffffff" />;
      default:
        return <ArrowUp size={32} color="#ffffff" />;
    }
  };

  if (!isNavigating || !currentRoute || !selectedPOI) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Navigation not active</Text>
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
        <View style={styles.destination}>
          <Text style={styles.destinationText}>To: {selectedPOI.name}</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>{navigationStats.remainingTime}</Text>
            <Text style={styles.statSeparator}>•</Text>
            <Text style={styles.statText}>{navigationStats.remainingDistance}</Text>
            <Text style={styles.statSeparator}>•</Text>
            <Text style={styles.statText}>ETA {navigationStats.estimatedArrival}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleStopNavigation}
        >
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Main Navigation Display */}
      <View style={styles.navigationDisplay}>
        {/* Current Instruction */}
        <View style={styles.currentInstruction}>
          <View style={styles.instructionIcon}>
            {getInstructionIcon(currentInstruction.type)}
          </View>
          <View style={styles.instructionDetails}>
            <Text style={styles.distance}>{currentInstruction.distance}</Text>
            <Text style={styles.instruction}>{currentInstruction.instruction}</Text>
            {currentInstruction.street && (
              <Text style={styles.street}>{currentInstruction.street}</Text>
            )}
            {currentInstruction.warning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warning}>⚠️ {currentInstruction.warning}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Next Instruction Preview */}
        <View style={styles.nextInstruction}>
          <View style={styles.nextIcon}>
            {getInstructionIcon(nextInstruction.type)}
          </View>
          <View style={styles.nextDetails}>
            <Text style={styles.nextLabel}>Then in {nextInstruction.distance}</Text>
            <Text style={styles.nextText}>{nextInstruction.instruction}</Text>
          </View>
        </View>
      </View>

      {/* Map Area (Simulated) */}
      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          <NavigationIcon size={48} color="#2563eb" />
          <Text style={styles.mapText}>Navigation Map</Text>
          <Text style={styles.mapSubtext}>
            Following main roads • Avoiding one-way conflicts
          </Text>
          
          {/* Simulated Route Features */}
          <View style={styles.routeFeatures}>
            <View style={styles.routeSegment}>
              <Text style={styles.routeText}>🛣️ Main Road Route</Text>
            </View>
            <View style={styles.codingAlert}>
              <Text style={styles.codingText}>✅ No coding restrictions</Text>
            </View>
          </View>
        </View>

        {/* GPS Status */}
        <View style={styles.gpsStatus}>
          <Text style={styles.gpsText}>
            GPS: {currentLocation?.accuracy?.toFixed(0)}m accuracy
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Route size={20} color="#2563eb" />
          <Text style={styles.actionText}>Route</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MapPin size={20} color="#2563eb" />
          <Text style={styles.actionText}>POIs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStopNavigation}
        >
          <X size={20} color="#ffffff" />
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
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
    backgroundColor: '#374151',
  },
  destination: {
    flex: 1,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  statSeparator: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  closeButton: {
    padding: 8,
  },
  navigationDisplay: {
    backgroundColor: '#374151',
    paddingVertical: 20,
  },
  currentInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  instructionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  instructionDetails: {
    flex: 1,
  },
  distance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  street: {
    fontSize: 14,
    color: '#d1d5db',
  },
  warningContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 6,
  },
  warning: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  nextInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4b5563',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextDetails: {
    flex: 1,
  },
  nextLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  nextText: {
    fontSize: 14,
    color: '#ffffff',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4b5563',
    margin: 16,
    borderRadius: 12,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
    textAlign: 'center',
  },
  routeFeatures: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  routeSegment: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  routeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  codingAlert: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  gpsStatus: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  gpsText: {
    fontSize: 12,
    color: '#ffffff',
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b5563',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  stopButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});