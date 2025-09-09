// utils/geo.ts
// Basic geo helpers for polygons/segments/bearings
const R = 6371000;

export function toRad(d: number) { return d * Math.PI / 180; }
export function toDeg(r: number) { return r * 180 / Math.PI; }

export function pointInPolygon([lng, lat]: [number, number], polygon: number[][][]) {
  // Supports Polygon or MultiPolygon first ring
  const polys = Array.isArray((polygon as any)[0][0][0]) ? (polygon as any) : [polygon as any];
  let inside = false;
  for (const poly of polys) {
    const ring = poly[0];
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

export function bearingBetween(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
  const φ1 = toRad(p1.lat), φ2 = toRad(p2.lat), Δλ = toRad(p2.lng - p1.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ) - Math.sin(φ1) * Math.sin(φ2);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function angularDiff(a: number, b: number) {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dφ = toRad(b.lat - a.lat);
  const dλ = toRad(b.lng - a.lng);
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const h = Math.sin(dφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceToSegmentMeters(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  // Approximate using projection in lat/lng space; good enough for short city segments
  const A = { x: a.lng, y: a.lat }, B = { x: b.lng, y: b.lat }, P = { x: p.lng, y: p.lat };
  const ABx = B.x - A.x, ABy = B.y - A.y;
  const APx = P.x - A.x, APy = P.y - A.y;
  const ab2 = ABx*ABx + ABy*ABy || 1e-9;
  let t = (APx*ABx + APy*ABy) / ab2;
  t = Math.max(0, Math.min(1, t));
  const H = { lat: A.y + ABy*t, lng: A.x + ABx*t };
  return haversineMeters(p, H);
}
