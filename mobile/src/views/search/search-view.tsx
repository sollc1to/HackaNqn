import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { Button, Dialog, IconButton, List, Portal, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip, LocationPicker, PostCard, SkeletonPostCard } from '@/components';
import {
  conditionLabel,
  deliveryLabel,
  postCategoryLabel,
  type AppPost,
  type ArticleCondition,
  type DeliveryMethod,
  type PostCategory,
  type PostKind,
  type PostStatus,
} from '@/data/posts';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { type SearchRadius, useAppData } from '@/state/app-data-context';
import { calculateDistanceKm } from '@/utils/location';
import { fuzzyIncludes } from '@/utils/text';

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

const categories: Array<'all' | PostCategory> = ['all', 'food', 'clothes', 'health', 'home', 'school', 'furniture', 'volunteering'];
const conditions: Array<'all' | ArticleCondition> = ['all', 'new', 'very-good', 'good'];
const deliveries: Array<'all' | DeliveryMethod> = ['all', 'coordinate', 'can-deliver'];
const statuses: Array<'all' | Exclude<PostStatus, 'paused'>> = ['all', 'available', 'reserved', 'completed'];
const radii: SearchRadius[] = [2, 5, 10, 20];
const zoomByRadius: Record<SearchRadius, number> = { 2: 13, 5: 12, 10: 11, 20: 10 };

const statusLabels: Record<(typeof statuses)[number], string> = {
  all: 'Cualquier estado',
  available: 'Disponible',
  reserved: 'Reservada',
  completed: 'Completada',
};

type ResultPost = { post: AppPost; distanceKm: number };
type SearchCenter = { label: string; latitude: number; longitude: number };

function ResultsMap({
  results,
  center,
  radiusKm,
  onSelect,
}: {
  results: ResultPost[];
  center: SearchCenter;
  radiusKm: SearchRadius;
  onSelect: (post: AppPost) => void;
}) {
  const theme = useTheme();
  const mapKey = `${center.latitude}-${center.longitude}-${radiusKm}`;

  return (
    <Surface
      elevation={0}
      accessibilityLabel={`Mapa real con ${results.length} resultados aproximados en un radio de ${radiusKm} kilómetros`}
      style={[styles.resultsMap, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant }]}>
      <Map
        key={mapKey}
        style={StyleSheet.absoluteFillObject}
        mapStyle={openStreetMapStyle}
        androidView="texture"
        attribution
        logo={false}
        compass>
        <Camera
          initialViewState={{
            center: [center.longitude, center.latitude],
            zoom: zoomByRadius[radiusKm],
          }}
          minZoom={3}
          maxZoom={19}
        />

        <Marker id="search-center" lngLat={[center.longitude, center.latitude]} anchor="center">
          <View
            pointerEvents="none"
            style={[
              styles.searchCenterMarker,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
            ]}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={theme.colors.primary} />
          </View>
        </Marker>

        {results.map(({ post }, index) => (
          <Marker
            key={post.id}
            id={`result-${post.id}`}
            lngLat={[post.location.longitude, post.location.latitude]}
            anchor="bottom">
            <TouchableRipple
              borderless
              onPress={() => onSelect(post)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${post.title} en ${post.location.label}`}
              style={[styles.resultPin, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={styles.resultPinText}>{index + 1}</Text>
            </TouchableRipple>
          </Marker>
        ))}
      </Map>

      {results.length === 0 ? (
        <View pointerEvents="none" style={[styles.mapEmpty, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={22} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            No hay publicaciones dentro de este radio con los filtros actuales.
          </Text>
        </View>
      ) : null}

      <View pointerEvents="none" style={[styles.mapLegend, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.mapLegendRow}>
          <MaterialCommunityIcons name="crosshairs-gps" size={17} color={theme.colors.primary} />
          <Text variant="labelMedium" numberOfLines={1} style={{ color: theme.colors.onSurface, flex: 1, fontWeight: '700' }}>
            {center.label} · radio {radiusKm} km
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Ubicaciones aproximadas · tocá un número para abrir la publicación
        </Text>
      </View>
    </Surface>
  );
}

export function SearchView() {
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const {
    posts,
    authors,
    savedPostIds,
    toggleSavedPost,
    searchFilters,
    updateSearchFilters,
    clearSearchFilters,
    searchHistory,
    rememberSearch,
    clearSearchHistory,
    isHydrating,
  } = useAppData();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  const results = useMemo<ResultPost[]>(() => {
    const filtered = posts
      .map(post => ({ post, distanceKm: calculateDistanceKm(searchFilters.center, post.location) }))
      .filter(({ post, distanceKm }) => {
        const author = authors.find(candidate => candidate.id === post.authorId);
        const searchable = `${post.title} ${post.description} ${post.location.label} ${author?.name ?? ''} ${postCategoryLabel[post.category]}`;
        return (
          fuzzyIncludes(searchable, searchFilters.query) &&
          (searchFilters.category === 'all' || post.category === searchFilters.category) &&
          (searchFilters.kind === 'all' || post.kind === searchFilters.kind) &&
          (searchFilters.status === 'all' || post.status === searchFilters.status) &&
          (searchFilters.condition === 'all' || post.condition === searchFilters.condition) &&
          (searchFilters.delivery === 'all' || post.delivery === searchFilters.delivery) &&
          distanceKm <= searchFilters.radiusKm
        );
      });

    return filtered.sort((first, second) =>
      searchFilters.sort === 'distance'
        ? first.distanceKm - second.distanceKm
        : new Date(second.post.publishedAt).getTime() - new Date(first.post.publishedAt).getTime(),
    );
  }, [authors, posts, searchFilters]);

  useEffect(() => {
    if (reducedMotion) return;
    fade.setValue(0.45);
    Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }, [fade, reducedMotion, searchFilters]);

  const activeFilterCount = [
    searchFilters.category !== 'all',
    searchFilters.kind !== 'all',
    searchFilters.status !== 'available',
    searchFilters.condition !== 'all',
    searchFilters.delivery !== 'all',
    searchFilters.radiusKm !== 20,
  ].filter(Boolean).length;

  const openPost = (post: AppPost) => {
    rememberSearch(searchFilters.query);
    router.push({ pathname: '/post/[postId]', params: { postId: post.id } });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerFrame}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Volver" style={styles.backButton} />
          <TextInput
            mode="outlined"
            value={searchFilters.query}
            onChangeText={query => updateSearchFilters({ query })}
            onSubmitEditing={() => rememberSearch(searchFilters.query)}
            placeholder="Buscar en Neuquén"
            returnKeyType="search"
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="magnify" />}
            right={searchFilters.query ? <TextInput.Icon icon="close" onPress={() => updateSearchFilters({ query: '' })} /> : undefined}
            style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
            accessibilityLabel="Buscar publicaciones"
          />
        </View>
      </View>

      <FlatList
        data={isHydrating || searchFilters.viewMode === 'map' ? [] : results}
        keyExtractor={({ post }) => post.id}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.filters}>
            {!searchFilters.query && searchHistory.length > 0 ? (
              <View style={styles.historySection}>
                <View style={styles.sectionHeading}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Búsquedas recientes</Text>
                  <Button compact onPress={clearSearchHistory}>Borrar</Button>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {searchHistory.map(item => (
                    <CategoryChip key={item} label={item} selected={false} onPress={() => updateSearchFilters({ query: item })} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Surface elevation={0} style={[styles.filterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <List.Accordion
                title={`Filtros${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
                description={`${searchFilters.radiusKm} km desde ${searchFilters.center.label}`}
                left={props => <List.Icon {...props} icon="tune-variant" />}
                expanded={filtersExpanded}
                onPress={() => setFiltersExpanded(current => !current)}>
                <View style={styles.filterBody}>
                  <FilterGroup title="Tipo">
                    {(['all', 'donation', 'request'] as Array<'all' | PostKind>).map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Todo' : item === 'donation' ? 'Donaciones' : 'Solicitudes'} selected={searchFilters.kind === item} onPress={() => updateSearchFilters({ kind: item })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Categoría">
                    {categories.map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Todas' : postCategoryLabel[item]} selected={searchFilters.category === item} onPress={() => updateSearchFilters({ category: item })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Ubicación aproximada">
                    <Button mode="outlined" icon="map-marker-radius-outline" onPress={() => setLocationDialog(true)}>
                      Seleccionar en el mapa
                    </Button>
                  </FilterGroup>
                  <FilterGroup title="Radio de búsqueda">
                    {radii.map(radius => (
                      <CategoryChip key={radius} label={`${radius} km`} selected={searchFilters.radiusKm === radius} onPress={() => updateSearchFilters({ radiusKm: radius })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Disponibilidad">
                    {statuses.map(item => (
                      <CategoryChip key={item} label={statusLabels[item]} selected={searchFilters.status === item} onPress={() => updateSearchFilters({ status: item })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Condición del artículo">
                    {conditions.map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Cualquiera' : conditionLabel[item]} selected={searchFilters.condition === item} onPress={() => updateSearchFilters({ condition: item })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Forma de entrega">
                    {deliveries.map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Cualquiera' : deliveryLabel[item]} selected={searchFilters.delivery === item} onPress={() => updateSearchFilters({ delivery: item })} />
                    ))}
                  </FilterGroup>
                  <Button mode="text" onPress={clearSearchFilters}>Restablecer filtros</Button>
                </View>
              </List.Accordion>
            </Surface>

            <View style={styles.resultHeading}>
              <View style={styles.resultCopy}>
                <Text variant="titleLarge" style={[styles.resultCount, { color: theme.colors.onSurface }]}>
                  {isHydrating ? 'Buscando…' : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Distancia calculada desde un punto aproximado elegido por vos
                </Text>
              </View>
              <View style={styles.viewButtons}>
                <IconButton icon="format-list-bulleted" mode={searchFilters.viewMode === 'list' ? 'contained' : undefined} onPress={() => updateSearchFilters({ viewMode: 'list' })} accessibilityLabel="Ver como lista" />
                <IconButton icon="map-outline" mode={searchFilters.viewMode === 'map' ? 'contained' : undefined} onPress={() => updateSearchFilters({ viewMode: 'map' })} accessibilityLabel="Ver en mapa" />
              </View>
            </View>
            <View style={styles.sortRow}>
              <CategoryChip label="Más recientes" selected={searchFilters.sort === 'recent'} onPress={() => updateSearchFilters({ sort: 'recent' })} />
              <CategoryChip label="Más cercanas" selected={searchFilters.sort === 'distance'} onPress={() => updateSearchFilters({ sort: 'distance' })} />
            </View>

            {isHydrating ? <><SkeletonPostCard /><SkeletonPostCard /></> : null}
            {!isHydrating && searchFilters.viewMode === 'map' ? (
              <ResultsMap
                results={results}
                center={searchFilters.center}
                radiusKm={searchFilters.radiusKm}
                onSelect={openPost}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const author = authors.find(candidate => candidate.id === item.post.authorId);
          return (
            <Animated.View style={{ opacity: fade }}>
              <PostCard
                post={item.post}
                author={author}
                distanceKm={item.distanceKm}
                saved={savedPostIds.includes(item.post.id)}
                onToggleSaved={() => toggleSavedPost(item.post.id)}
                onAuthorPress={() => router.push({ pathname: '/profile/[authorId]', params: { authorId: item.post.authorId } })}
                onPress={() => openPost(item.post)}
              />
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isHydrating && searchFilters.viewMode === 'list' ? (
            <Animated.View style={[styles.emptyState, { opacity: fade }]}> 
              <MaterialCommunityIcons name="magnify-close" size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No encontramos publicaciones</Text>
              <Text variant="bodyMedium" style={[styles.emptyCopy, { color: theme.colors.onSurfaceVariant }]}>Probá ampliar el radio o limpiar alguno de los filtros.</Text>
              <Button mode="outlined" onPress={clearSearchFilters}>Limpiar filtros</Button>
            </Animated.View>
          ) : null
        }
      />

      <Portal>
        <Dialog visible={locationDialog} onDismiss={() => setLocationDialog(false)} style={styles.locationDialog}>
          <Dialog.Title>Ubicación aproximada</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <LocationPicker
                value={{ ...searchFilters.center, locality: 'Neuquén capital' }}
                onChange={location => {
                  updateSearchFilters({ center: { label: 'Ubicación aproximada', latitude: location.latitude, longitude: location.longitude } });
                  setLocationDialog(false);
                }}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions><Button onPress={() => setLocationDialog(false)}>Cerrar</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.filterGroup}>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerFrame: { paddingHorizontal: 10 },
  header: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  backButton: { margin: 0 },
  searchInput: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 28 },
  filters: { gap: 16, paddingTop: 10, paddingBottom: 16 },
  historySection: { gap: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterCard: { overflow: 'hidden', borderWidth: 1, borderRadius: 18 },
  filterBody: { gap: 18, paddingHorizontal: 16, paddingBottom: 16 },
  filterGroup: { gap: 9 },
  chipRow: { flexDirection: 'row', gap: 9, paddingRight: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultCopy: { flex: 1, gap: 2 },
  resultCount: { fontWeight: '800' },
  viewButtons: { flexDirection: 'row' },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  separator: { height: 12 },
  emptyState: { alignItems: 'center', gap: 12, paddingHorizontal: 26, paddingVertical: 52 },
  emptyTitle: { textAlign: 'center', fontWeight: '800' },
  emptyCopy: { textAlign: 'center', lineHeight: 22 },
  resultsMap: { height: 360, overflow: 'hidden', borderWidth: 1, borderRadius: 22 },
  resultPin: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 2, borderColor: '#FFFFFF' },
  resultPinText: { color: '#FFFFFF', fontWeight: '800' },
  searchCenterMarker: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 2 },
  mapLegend: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 3, borderRadius: 12, padding: 10 },
  mapLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapEmpty: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 12 },
  locationDialog: { width: '94%', maxWidth: 620, alignSelf: 'center' },
  dialogScrollArea: { paddingHorizontal: 0 },
  dialogContent: { padding: 18 },
});