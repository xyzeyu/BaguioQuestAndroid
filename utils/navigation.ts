// utils/navigation.ts
import type { Location, NavigationSettings, RouteInfo } from '@/types/navigation';

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Haversine — returns **meters**
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371008.8; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Legacy helper used in some screens — returns **kilometers**
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return calculateDistanceMeters(lat1, lon1, lat2, lon2) / 1000;
}

// Very simple faux route generator (you can swap with a real API later)
export function findMainRoadRoute(
  from: Location,
  to: Location,
  settings: NavigationSettings
): RouteInfo {
  const km = calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
  const roadFactor = settings.preferMainRoads ? 1.05 : 1.0; // pretend main roads are a tad longer
  const distance = +(km * roadFactor).toFixed(1);

  // Assume average 25 km/h across Baguio roads
  const duration = Math.max(3, Math.round((distance / 25) * 60));
  return { distance, duration };
}
