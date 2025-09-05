import { Location, RouteInfo, NavigationSettings } from '@/types/navigation';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d * 1000; // Convert to meters
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const findMainRoadRoute = (
  from: Location,
  to: Location,
  settings: NavigationSettings
): RouteInfo => {
  // Simulate route calculation with main road preference
  const distance = calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
  const distanceKm = (distance / 1000).toFixed(1);
  
  // Estimate duration based on distance and road type
  // Main roads: ~30 km/h average, local roads: ~20 km/h
  const avgSpeed = settings.preferMainRoads ? 30 : 20;
  const durationMinutes = Math.round((distance / 1000) / avgSpeed * 60);
  
  const warnings: string[] = [];
  
  // Check for number coding if enabled
  if (settings.numberCodingEnabled && isNumberCodingActive()) {
    warnings.push('Number coding may be active - check your plate number');
  }
  
  // Add one-way street warnings for certain areas
  if (isInDowntownArea(to)) {
    warnings.push('Destination area has one-way streets');
  }
  
  // Add steep road warnings
  if (isSteepRoute(from, to)) {
    warnings.push('Route includes steep roads');
  }

  return {
    id: `route_${Date.now()}`,
    distance: `${distanceKm} km`,
    duration: `${durationMinutes} min`,
    type: settings.preferMainRoads ? 'main-road' : 'fastest',
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

const isNumberCodingActive = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Simulate coding hours: 7 AM - 7 PM, Monday to Friday
  return day >= 1 && day <= 5 && hour >= 7 && hour < 19;
};

const isInDowntownArea = (location: Location): boolean => {
  // Downtown Baguio approximate bounds
  const downtownBounds = {
    north: 16.415,
    south: 16.400,
    east: 120.600,
    west: 120.590,
  };
  
  return (
    location.latitude >= downtownBounds.south &&
    location.latitude <= downtownBounds.north &&
    location.longitude >= downtownBounds.west &&
    location.longitude <= downtownBounds.east
  );
};

const isSteepRoute = (from: Location, to: Location): boolean => {
  // Simulate steep route detection based on elevation changes
  // In a real app, this would use elevation data
  const latDiff = Math.abs(to.latitude - from.latitude);
  const lngDiff = Math.abs(to.longitude - from.longitude);
  
  // Simple heuristic: routes with significant lat/lng changes in Baguio are likely steep
  return latDiff > 0.01 || lngDiff > 0.01;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

export const isLocationInBaguio = (location: Location): boolean => {
  // Baguio City approximate bounds
  const baguioBounds = {
    north: 16.45,
    south: 16.35,
    east: 120.65,
    west: 120.55,
  };
  
  return (
    location.latitude >= baguioBounds.south &&
    location.latitude <= baguioBounds.north &&
    location.longitude >= baguioBounds.west &&
    location.longitude <= baguioBounds.east
  );
};