import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { type PostLocation } from '@/data/posts';
import { CategoryChip } from './category-chip';

type LocationPickerProps = {
  value?: PostLocation;
  onChange: (location: PostLocation) => void;
  error?: string;
};

type MapStyle = Extract<ComponentProps<typeof Map>['mapStyle'], object>;

const openStreetMapStyle: MapStyle = {
  version: 8,
  sources: {
    openstreetmap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'openstreetmap',
      type: 'raster',
      source: 'openstreetmap',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const locations: Array<Omit<PostLocation, 'label'> & { shortLabel: string; label: string }> = [
  {
    shortLabel: 'Neuquén',
    label: 'Neuquén capital · ubicación aproximada',
    locality: 'Neuquén capital',
    latitude: -38.9516,
    longitude: -68.0591,
  },
  {
    shortLabel: 'Plottier',
    label: 'Plottier · ubicación aproximada',
    locality: 'Plottier',
    latitude: -38.9527,
    longitude: -68.2299,
  },
  {
    shortLabel: 'Centenario',
    label: 'Centenario · ubicación aproximada',
    locality: 'Centenario',
    latitude: -38.8296,
    longitude: -68.1318,
  },
  {
    shortLabel: 'Cutral Co',
    label: 'Cutral Co · ubicación aproximada',
    locality: 'Cutral Co',
    latitude: -38.9397,
    longitude: -69.2303,
  },
];

const defaultLocation = locations[0];

function nearestLocation(latitude: number, longitude: number) {
  return locations.reduce((closest, item) => {
    const currentDistance = Math.hypot(item.latitude - latitude, item.longitude - longitude);
    const closestDistance = Math.hypot(closest.latitude - latitude, closest.longitude - longitude);
    return currentDistance < closestDistance ? item : closest;
  });
}

export function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const theme = useTheme();
  const center = value ?? defaultLocation;
  const mapKey = `${center.latitude}-${center.longitude}`;

  const selectPoint: NonNullable<ComponentProps<typeof Map>['onPress']> = event => {
    const [rawLongitude, rawLatitude] = event.nativeEvent.lngLat;
    const latitude = Number(rawLatitude.toFixed(3));
    const longitude = Number(rawLongitude.toFixed(3));
    const nearest = nearestLocation(latitude, longitude);

    onChange({
      locality: nearest.locality,
      label: `${nearest.locality} · punto aproximado`,
      latitude,
      longitude,
    });
  };

  return (
    <View style={styles.root}>
      <Surface
        elevation={0}
        accessibilityLabel="Mapa de OpenStreetMap para elegir un punto aproximado"
        style={[
          styles.mapFrame,
          { borderColor: error ? theme.colors.error : theme.colors.outlineVariant },
        ]}>
        <Map
          key={mapKey}
          style={StyleSheet.absoluteFillObject}
          mapStyle={openStreetMapStyle}
          androidView="texture"
          attribution
          logo={false}
          compass
          onPress={selectPoint}>
          <Camera
            initialViewState={{
              center: [center.longitude, center.latitude],
              zoom: value ? 12.5 : 10.5,
            }}
            minZoom={4}
            maxZoom={19}
          />

          {value ? (
            <Marker id="selected-location" lngLat={[value.longitude, value.latitude]} anchor="bottom">
              <View pointerEvents="none" style={styles.pinWrap}>
                <MaterialCommunityIcons name="map-marker" size={42} color={theme.colors.primary} />
              </View>
            </Marker>
          ) : null}
        </Map>

        <View pointerEvents="none" style={[styles.mapHint, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons name="gesture-tap" size={17} color={theme.colors.primary} />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            Tocá el mapa
          </Text>
        </View>
      </Surface>

      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Elegí un punto en el mapa o usá una localidad como referencia rápida.
      </Text>

      <View style={styles.chips}>
        {locations.map(location => (
          <CategoryChip
            key={location.locality}
            label={location.shortLabel}
            selected={value?.locality === location.locality}
            onPress={() =>
              onChange({
                label: location.label,
                locality: location.locality,
                latitude: location.latitude,
                longitude: location.longitude,
              })
            }
          />
        ))}
      </View>

      {value ? (
        <View style={styles.selectionRow}>
          <MaterialCommunityIcons name="map-marker-check-outline" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
            {value.label} · {value.latitude.toFixed(3)}, {value.longitude.toFixed(3)}
          </Text>
        </View>
      ) : null}

      <Text variant="bodySmall" style={{ color: error ? theme.colors.error : theme.colors.onSurfaceVariant }}>
        {error ?? 'Solo publicamos el punto aproximado. La dirección exacta se comparte por mensaje.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  mapFrame: {
    height: 270,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
  },
  mapHint: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pinWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
