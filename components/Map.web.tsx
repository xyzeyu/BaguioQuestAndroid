// components/Map.web.tsx
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
export type MarkerItem = { id: string; title?: string; lat: number; lng: number; type?: string };

type Props = {
  initialRegion: Region;
  polygon?: { coordinates: { latitude: number; longitude: number }[] };
  polyline?: { coordinates: { latitude: number; longitude: number }[]; color: string };
  markers?: MarkerItem[];
  onRegionChangeComplete?: (r: Region) => void;
  showsUserLocation?: boolean; // ignored on web here
};

export default function MapWeb({
  initialRegion,
  polygon,
  polyline,
  markers = [],
  onRegionChangeComplete,
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const center: [number, number] = [initialRegion.longitude, initialRegion.latitude];
    // Simple zoom from latitudeDelta (rough heuristic)
    const zoom = Math.max(2, Math.min(18, 1 / initialRegion.latitudeDelta * 0.5));

    const map = new maplibregl.Map({
      container: divRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    map.on("moveend", () => {
      if (!onRegionChangeComplete) return;
      const c = map.getCenter();
      const z = map.getZoom();
      const latDelta = Math.max(0.002, 0.5 / Math.pow(2, z - 10));
      onRegionChangeComplete({
        latitude: c.lat,
        longitude: c.lng,
        latitudeDelta: latDelta,
        longitudeDelta: latDelta,
      });
    });

    map.on("load", () => {
      // Markers
      markers.forEach((m) => {
        new maplibregl.Marker()
          .setLngLat([m.lng, m.lat])
          .setPopup(new maplibregl.Popup({ offset: 8 }).setText(m.title || ""))
          .addTo(map);
      });

      // Polygon overlay
      if (polygon?.coordinates?.length) {
        const coords = polygon.coordinates.map((c) => [c.longitude, c.latitude]);
        map.addSource("coding-poly", {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} },
        });
        map.addLayer({
          id: "coding-poly-fill",
          type: "fill",
          source: "coding-poly",
          paint: { "fill-color": "#D97706", "fill-opacity": 0.15 },
        });
        map.addLayer({
          id: "coding-poly-stroke",
          type: "line",
          source: "coding-poly",
          paint: { "line-color": "#D97706", "line-width": 2 },
        });
      }

      // Polyline overlay
      if (polyline?.coordinates?.length) {
        const coords = polyline.coordinates.map((c) => [c.longitude, c.latitude]);
        map.addSource("oneway-line", {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} },
        });
        map.addLayer({
          id: "oneway-line-layer",
          type: "line",
          source: "oneway-line",
          paint: { "line-color": polyline.color, "line-width": 6 },
        });
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={divRef} style={{ width: "100%", height: "100%" }} />;
}
