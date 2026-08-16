import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav, CategoryChip, PostCard } from '@/components';
import { type AppPost } from '@/data/posts';
import { currentUser } from '@/data/profile';
import { useAppData } from '@/state/app-data-context';

type FilterKey = 'all' | 'donation' | 'request' | 'urgent';

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'donation', label: 'Donaciones' },
  { key: 'request', label: 'Solicitudes' },
  { key: 'urgent', label: 'Urgentes' },
];

const navItems = [
  { key: 'home', label: 'Inicio', icon: 'home-outline' as const },
  { key: 'publish', label: 'Publicar', icon: 'plus-circle-outline' as const },
  { key: 'messages', label: 'Mensajes', icon: 'chat-outline' as const, badge: true },
];

function AnimatedPostCard({ post, index, onPress }: { post: AppPost; index: number; onPress: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <PostCard post={post} onPress={onPress} />
    </Animated.View>
  );
}

export function DashboardView() {
  const router = useRouter();
  const theme = useTheme();
  const { posts } = useAppData();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const visiblePosts = useMemo(
    () =>
      posts.filter(post => {
        if (post.status !== 'active') return false;
        if (filter === 'donation') return post.kind === 'donation';
        if (filter === 'request') return post.kind === 'request';
        if (filter === 'urgent') return post.urgent;
        return true;
      }),
    [filter, posts],
  );

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Surface style={[styles.brandIcon, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
            <MaterialCommunityIcons name="hand-heart" size={24} color={theme.colors.primary} />
          </Surface>
          <Text variant="titleLarge" style={[styles.brand, { color: theme.colors.onSurface }]}>
            Nexo Solidario
          </Text>
        </View>

        <TouchableRipple borderless onPress={() => router.push('/personal-data')} style={styles.profileButton}>
          <Avatar.Image size={42} source={{ uri: currentUser.imageUri }} />
        </TouchableRipple>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={post => post.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <TouchableRipple onPress={() => router.push('/search')} borderless style={styles.searchRipple}>
              <Surface
                elevation={0}
                style={[
                  styles.searchSurface,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
                ]}>
                <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Buscar donaciones o necesidades
                </Text>
              </Surface>
            </TouchableRipple>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {filters.map(item => (
                <CategoryChip
                  key={item.key}
                  label={item.label}
                  selected={filter === item.key}
                  onPress={() => setFilter(item.key)}
                />
              ))}
            </ScrollView>

            <Surface
              elevation={0}
              style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <View style={styles.summaryIcon}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.summaryCopy}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Comunidad activa hoy
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {visiblePosts.length} publicaciones disponibles en Neuquén y alrededores.
                </Text>
              </View>
            </Surface>

            <View style={styles.listHeading}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Publicaciones recientes
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Deslizá hacia abajo para actualizar
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedPostCard
            post={item}
            index={index}
            onPress={() =>
              router.push({ pathname: '/post/[postId]', params: { postId: item.id } })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-outline" size={42} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              No hay publicaciones en este filtro
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Probá otra categoría o creá una nueva publicación.
            </Text>
          </View>
        }
      />

      <AppBottomNav
        items={navItems}
        activeKey="home"
        onChange={key => {
          if (key === 'publish') router.push('/create-post');
          if (key === 'messages') router.push('/messages-by-post');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: '800',
  },
  profileButton: {
    borderRadius: 999,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  headerContent: {
    gap: 18,
    paddingTop: 4,
    paddingBottom: 16,
  },
  searchRipple: {
    borderRadius: 16,
  },
  searchSurface: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  filterRow: {
    gap: 9,
    paddingRight: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 16,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    gap: 3,
  },
  listHeading: {
    gap: 3,
    paddingTop: 2,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
});
