import { useMemo, useState } from 'react';
import { type GestureResponderEvent, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { type PostLocation } from '@/data/posts';
import { CategoryChip } from './category-chip';

type LocationPickerProps = {
  value?: PostLocation;
  onChange: (location: PostLocation) => void;
  error?: string;
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

const bounds = { north: -38.76, south: -39.08, west: -69.34, east: -67.95 };

function pointPosition(latitude: number, longitude: number) {
  return {
    left: `${((longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%` as const,
    top: `${((bounds.north - latitude) / (bounds.north - bounds.south)) * 100}%` as const,
  };
}

function nearestLocation(latitude: number, longitude: number) {
  return locations.reduce((closest, item) => {
    const currentDistance = Math.hypot(item.latitude - latitude, item.longitude - longitude);
    const closestDistance = Math.hypot(closest.latitude - latitude, closest.longitude - longitude);
    return currentDistance < closestDistance ? item : closest;
  });
}

export function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 1, height: 1 });
  const selectedPosition = useMemo(
    () => (value ? pointPosition(value.latitude, value.longitude) : undefined),
    [value],
  );

  const selectPoint = (event: GestureResponderEvent) => {
    const x = Math.max(0, Math.min(size.width, event.nativeEvent.locationX));
    const y = Math.max(0, Math.min(size.height, event.nativeEvent.locationY));
    const longitude = bounds.west + (x / size.width) * (bounds.east - bounds.west);
    const latitude = bounds.north - (y / size.height) * (bounds.north - bounds.south);
    const nearest = nearestLocation(latitude, longitude);
    onChange({
      locality: nearest.locality,
      label: `${nearest.locality} · punto aproximado`,
      latitude: Number(latitude.toFixed(5)),
      longitude: Number(longitude.toFixed(5)),
    });
  };

  return (
    <View style={styles.root}>
      <TouchableRipple
        accessibilityRole="button"
        accessibilityLabel="Mapa aproximado de Neuquén. Tocá para elegir una ubicación"
        accessibilityHint="También podés elegir una localidad debajo del mapa"
        onPress={selectPoint}
        style={styles.mapRipple}>
        <Surface
          onLayout={event => setSize(event.nativeEvent.layout)}
          elevation={0}
          style={[
            styles.map,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: error ? theme.colors.error : theme.colors.outlineVariant,
            },
          ]}>
          <View style={[styles.river, { backgroundColor: '#B8D9E8' }]} />
          <View style={[styles.route, { borderColor: theme.colors.outlineVariant }]} />
          {locations.map(location => {
            const position = pointPosition(location.latitude, location.longitude);
            return (
              <View key={location.locality} pointerEvents="none" style={[styles.place, position]}>
                <View style={[styles.placeDot, { backgroundColor: theme.colors.onSurfaceVariant }]} />
                <Text variant="labelSmall" style={[styles.placeLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {location.shortLabel}
                </Text>
              </View>
            );
          })}
          {selectedPosition ? (
            <View pointerEvents="none" style={[styles.pin, selectedPosition]}>
              <MaterialCommunityIcons name="map-marker" size={32} color={theme.colors.primary} />
            </View>
          ) : null}
          <View pointerEvents="none" style={[styles.mapHint, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons name="gesture-tap" size={17} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
              Tocá un punto
            </Text>
          </View>
        </Surface>
      </TouchableRipple>

      <View style={styles.chips}>
        {locations.map(location => (
          <CategoryChip
            key={location.locality}
            label={location.shortLabel}
            selected={value?.locality === location.locality}
            onPress={() => onChange({
              label: location.label,
              locality: location.locality,
              latitude: location.latitude,
              longitude: location.longitude,
            })}
          />
        ))}
      </View>

      {value ? (
        <View style={styles.selectionRow}>
          <MaterialCommunityIcons name="map-marker-check-outline" size={19} color={theme.colors.primary} />
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
  mapRipple: { borderRadius: 20 },
  map: { height: 218, overflow: 'hidden', borderWidth: 1, borderRadius: 20 },
  river: { position: 'absolute', left: '-8%', right: '-8%', bottom: 24, height: 22, transform: [{ rotate: '-4deg' }] },
  route: { position: 'absolute', left: '5%', right: '4%', top: '53%', borderTopWidth: 2, borderStyle: 'dashed', transform: [{ rotate: '2deg' }] },
  place: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 3, transform: [{ translateX: -4 }, { translateY: -4 }] },
  placeDot: { width: 8, height: 8, borderRadius: 999 },
  placeLabel: { fontWeight: '700' },
  pin: { position: 'absolute', marginLeft: -16, marginTop: -29 },
  mapHint: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
