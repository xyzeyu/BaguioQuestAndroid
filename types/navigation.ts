// types/navigation.ts

export interface POI {
  id: string;
  name: string;
  type: string;
  description?: string;
  hours?: string;
  rating?: number;
  priceRange?: string;
  phone?: string;
  website?: string;
  amenities?: string[];

  // coordinates (added when available)
  lat?: number;
  lng?: number;

  // computed at runtime
  distanceMeters?: number;   // from user GPS
  distanceFromMap?: number;  // from map camera center (in km if you use calculateDistance)
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NavigationSettings {
  numberCodingEnabled: boolean;
  offlineMode: boolean;
  notifications: boolean;
  units: 'metric' | 'imperial';
  avoidTolls: boolean;
  preferMainRoads: boolean;
}

export interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
  polyline?: string;
}
