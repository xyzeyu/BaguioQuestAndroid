export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface POI {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  rating?: number;
  photos?: string[];
  amenities?: string[];
  distance?: number;
  priceRange?: string;
}

export interface RouteInfo {
  id: string;
  distance: string;
  duration: string;
  type: 'main-road' | 'fastest' | 'shortest';
  warnings?: string[];
  instructions?: NavigationInstruction[];
}

export interface NavigationInstruction {
  id: string;
  type: 'straight' | 'left' | 'right' | 'u-turn' | 'destination';
  instruction: string;
  distance: string;
  street?: string;
  warning?: string;
}

export interface NavigationSettings {
  numberCodingEnabled: boolean;
  offlineMode: boolean;
  notifications: boolean;
  units: 'metric' | 'imperial';
  avoidTolls: boolean;
  preferMainRoads: boolean;
}

export interface NumberCodingRule {
  day: string;
  timeStart: string;
  timeEnd: string;
  plateEndings: string[];
  active: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'local';
  oneWay?: 'forward' | 'backward';
  slope?: number;
  codingRestricted?: boolean;
}