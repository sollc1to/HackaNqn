import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const categories: Array<'all' | PostCategory> = ['all', 'food', 'clothes', 'health', 'home', 'school', 'furniture', 'volunteering'];
const localities: Array<'all' | AppPost['location']['locality']> = ['all', 'Neuquén capital', 'Plottier', 'Centenario', 'Cutral Co'];
const conditions: Array<'all' | ArticleCondition> = ['all', 'new', 'very-good', 'good'];
const deliveries: Array<'all' | DeliveryMethod> = ['all', 'coordinate', 'can-deliver'];
const statuses: Array<'all' | Exclude<PostStatus, 'paused'>> = ['all', 'available', 'reserved', 'completed'];
const radii: SearchRadius[] = [2, 5, 10, 20];

const statusLabels: Record<(typeof statuses)[number], string> = {
  all: 'Cualquier estado',
  available: 'Disponible',
  reserved: 'Reservada',
  completed: 'Completada',
};

type ResultPost = { post: AppPost; distanceKm: number };

function ResultsMap({ results, onSelect }: { results: ResultPost[]; onSelect: (post: AppPost) => void }) {
  const theme = useTheme();
  const bounds = { north: -38.76, south: -39.08, west: -69.34, east: -67.95 };
  return (
    <Surface
      elevation={0}
      accessibilityLabel={`Mapa con ${results.length} resultados aproximados`}
      style={[styles.resultsMap, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant }]}>
      <View style={[styles.mapRiver, { backgroundColor: '#B8D9E8' }]} />
      {results.map(({ post }, index) => {
        const left = `${((post.location.longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%`;
        const top = `${((bounds.north - post.location.latitude) / (bounds.north - bounds.south)) * 100}%`;
        return (
          <TouchableRipple
            key={post.id}
            borderless
            onPress={() => onSelect(post)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${post.title} en ${post.location.label}`}
            style={[styles.resultPin, { left: left as never, top: top as never, backgroundColor: theme.colors.primary }]}>
            <Text variant="labelSmall" style={styles.resultPinText}>{index + 1}</Text>
          </TouchableRipple>
        );
      })}
      <View style={[styles.mapLegend, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Ubicaciones aproximadas · tocá un número
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

  const neighborhoods = useMemo(
    () => ['all', ...new Set(posts.map(post => post.location.neighborhood).filter((value): value is string => Boolean(value)))],
    [posts],
  );

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
          (searchFilters.locality === 'all' || post.location.locality === searchFilters.locality) &&
          (searchFilters.neighborhood === 'all' || post.location.neighborhood === searchFilters.neighborhood) &&
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
    searchFilters.locality !== 'all',
    searchFilters.neighborhood !== 'all',
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
                  <FilterGroup title="Radio de búsqueda">
                    {radii.map(radius => (
                      <CategoryChip key={radius} label={`${radius} km`} selected={searchFilters.radiusKm === radius} onPress={() => updateSearchFilters({ radiusKm: radius })} />
                    ))}
                  </FilterGroup>
                  <Button mode="outlined" icon="map-marker-radius-outline" onPress={() => setLocationDialog(true)}>
                    Cambiar punto de búsqueda
                  </Button>
                  <FilterGroup title="Localidad">
                    {localities.map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Todas' : item} selected={searchFilters.locality === item} onPress={() => updateSearchFilters({ locality: item })} />
                    ))}
                  </FilterGroup>
                  <FilterGroup title="Barrio">
                    {neighborhoods.map(item => (
                      <CategoryChip key={item} label={item === 'all' ? 'Todos' : item} selected={searchFilters.neighborhood === item} onPress={() => updateSearchFilters({ neighborhood: item })} />
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
            {!isHydrating && searchFilters.viewMode === 'map' ? <ResultsMap results={results} onSelect={openPost} /> : null}
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
          <Dialog.Title>Punto de búsqueda</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <LocationPicker
                value={{ ...searchFilters.center, locality: searchFilters.locality === 'all' ? 'Neuquén capital' : searchFilters.locality }}
                onChange={location => {
                  updateSearchFilters({ center: { label: location.locality, latitude: location.latitude, longitude: location.longitude } });
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
  mapRiver: { position: 'absolute', left: '-8%', right: '-8%', bottom: 42, height: 28, transform: [{ rotate: '-4deg' }] },
  resultPin: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  resultPinText: { color: '#FFFFFF', fontWeight: '800' },
  mapLegend: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 12, padding: 10 },
  locationDialog: { width: '94%', maxWidth: 620, alignSelf: 'center' },
  dialogScrollArea: { paddingHorizontal: 0 },
  dialogContent: { padding: 18 },
});
