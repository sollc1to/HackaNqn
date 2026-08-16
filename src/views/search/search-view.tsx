import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip, PostCard } from '@/components';
import { type PostCategory, type PostKind } from '@/data/posts';
import { useAppData } from '@/state/app-data-context';

type CategoryFilter = 'all' | PostCategory;
type KindFilter = 'all' | PostKind;
type SortKey = 'distance' | 'urgent';

const categories: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'food', label: 'Alimentos' },
  { key: 'clothes', label: 'Ropa' },
  { key: 'health', label: 'Salud' },
  { key: 'home', label: 'Hogar' },
];

const kinds: Array<{ key: KindFilter; label: string }> = [
  { key: 'all', label: 'Todo' },
  { key: 'donation', label: 'Donaciones' },
  { key: 'request', label: 'Solicitudes' },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function SearchView() {
  const router = useRouter();
  const theme = useTheme();
  const { posts } = useAppData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [kind, setKind] = useState<KindFilter>('all');
  const [sort, setSort] = useState<SortKey>('distance');
  const fade = useRef(new Animated.Value(1)).current;

  const results = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const filtered = posts.filter(post => {
      if (post.status !== 'active') return false;
      const searchableText = normalize(
        `${post.title} ${post.description} ${post.location} ${post.author} ${post.highlights.join(' ')}`,
      );
      const matchesText = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
      const matchesCategory = category === 'all' || post.category === category;
      const matchesKind = kind === 'all' || post.kind === kind;

      return matchesText && matchesCategory && matchesKind;
    });

    return [...filtered].sort((first, second) => {
      if (sort === 'urgent' && first.urgent !== second.urgent) return first.urgent ? -1 : 1;
      return first.distanceKm - second.distanceKm;
    });
  }, [category, kind, posts, query, sort]);

  useEffect(() => {
    fade.setValue(0.35);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [category, fade, kind, query, sort]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setKind('all');
    setSort('distance');
  };

  const hasActiveFilters = query.trim().length > 0 || category !== 'all' || kind !== 'all' || sort !== 'distance';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} style={styles.backButton} />
        <TextInput
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en Neuquén"
          autoFocus
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="magnify" />}
          right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={post => post.id}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.filters}>
            <View style={styles.filterGroup}>
              <Text variant="labelLarge" style={[styles.filterTitle, { color: theme.colors.onSurface }]}>
                Categoría
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {categories.map(item => (
                  <CategoryChip
                    key={item.key}
                    label={item.label}
                    selected={category === item.key}
                    onPress={() => setCategory(item.key)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text variant="labelLarge" style={[styles.filterTitle, { color: theme.colors.onSurface }]}>
                Tipo
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {kinds.map(item => (
                  <CategoryChip
                    key={item.key}
                    label={item.label}
                    selected={kind === item.key}
                    onPress={() => setKind(item.key)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text variant="labelLarge" style={[styles.filterTitle, { color: theme.colors.onSurface }]}>
                Ordenar por
              </Text>
              <View style={styles.chipRow}>
                <CategoryChip
                  label="Más cercanas"
                  selected={sort === 'distance'}
                  onPress={() => setSort('distance')}
                />
                <CategoryChip
                  label="Urgentes primero"
                  selected={sort === 'urgent'}
                  onPress={() => setSort('urgent')}
                />
              </View>
            </View>

            <View style={styles.resultHeading}>
              <View>
                <Text variant="titleLarge" style={[styles.resultCount, { color: theme.colors.onSurface }]}>
                  {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Información aproximada de distancia
                </Text>
              </View>
              {hasActiveFilters ? (
                <Button mode="text" compact onPress={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Animated.View style={{ opacity: fade }}>
            <PostCard
              post={item}
              onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: item.id } })}
            />
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Animated.View style={[styles.emptyState, { opacity: fade }]}>
            <MaterialCommunityIcons name="magnify-close" size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No encontramos publicaciones
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyCopy, { color: theme.colors.onSurfaceVariant }]}>
              Probá con otra palabra, categoría o tipo de publicación.
            </Text>
            <Button mode="outlined" onPress={clearFilters}>
              Limpiar filtros
            </Button>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backButton: {
    margin: 0,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  filters: {
    gap: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
  filterGroup: {
    gap: 9,
  },
  filterTitle: {
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 9,
    paddingRight: 16,
  },
  resultHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  resultCount: {
    fontWeight: '800',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 26,
    paddingVertical: 52,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '800',
  },
  emptyCopy: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
