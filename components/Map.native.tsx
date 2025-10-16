// components/Map.native.tsx
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { View, StyleSheet } from "react-native";

type MarkerItem = { id: string; title?: string; lat: number; lng: number };
type Props = { markers?: MarkerItem[] };

export default function MapNative({ markers = [] }: Props) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 16.4113,
          longitude: 120.5969,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
