import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import zone from "../data/coding_zone.json";
import oneways from "../data/oneway_segments.json";
import { pointInPolygon, bearingBetween, angularDiff, distanceToSegmentMeters } from "@/utils/geo";

export type GeoState = {
  insideCodingZone: boolean;
  heading: number | null;
  nearestOneWay?: { name?: string; ok: boolean; distanceM: number; roadBearing: number };
};

export function useGeofences() {
  const [state, setState] = useState<GeoState>({ insideCodingZone: false, heading: null });
  const lastPos = useRef<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
        (pos) => {
          const { latitude, longitude, heading } = pos.coords;
          const poly = (zone as any).features[0].geometry.coordinates;
          const inside = pointInPolygon([longitude, latitude], poly);
          // Compute heading from last sample if needed
          let userHeading = heading ?? null;
          if ((userHeading == null || userHeading < 0) && lastPos.current) {
            userHeading = bearingBetween(
              { lat: lastPos.current.latitude, lng: lastPos.current.longitude },
              { lat: latitude, lng: longitude }
            );
          }
          lastPos.current = pos.coords;

          // Nearest one-way check
          let nearest: GeoState["nearestOneWay"];
          let bestD = Number.POSITIVE_INFINITY;
          let best: any = null;
          for (const f of (oneways as any).features) {
            const coords = f.geometry.coordinates as [number, number][];
            for (let i = 0; i < coords.length - 1; i++) {
              const a = { lat: coords[i][1], lng: coords[i][0] };
              const b = { lat: coords[i + 1][1], lng: coords[i + 1][0] };
              const d = distanceToSegmentMeters({ lat: latitude, lng: longitude }, a, b);
              if (d < bestD) {
                bestD = d;
                best = { a, b, props: f.properties };
              }
            }
          }
          if (best && userHeading != null) {
            const roadBearing = bearingBetween(best.a, best.b);
            const ok = angularDiff(userHeading, roadBearing) <= 90; // aligned roughly with flow
            nearest = { name: best.props?.name, ok, distanceM: bestD, roadBearing };
          }

          setState({ insideCodingZone: inside, heading: userHeading ?? null, nearestOneWay: nearest });
        }
      );
    })();
    return () => sub?.remove();
  }, []);

  return state;
}
