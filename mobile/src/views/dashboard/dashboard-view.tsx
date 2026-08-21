import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav, AuthorAvatar, CategoryChip, PostCard, SkeletonPostCard } from '@/components';
import { type AppAuthor } from '@/data/authors';
import { type AppPost } from '@/data/posts';
import { useCurrentUserProfile } from '@/hooks/use-current-user-profile';
import { backendUserToAuthor, fetchBackendUserById } from '@/lib/backend-api';
import { getStoredAuthToken } from '@/lib/auth-storage';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAppData } from '@/state/app-data-context';

type FilterKey = 'all' | 'donation' | 'request' | 'saved';

const filters: Array<{ key: FilterKey; label: string; icon?: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'donation', label: 'Donaciones' },
  { key: 'request', label: 'Solicitudes' },
  { key: 'saved', label: 'Guardadas', icon: 'bookmark-outline' },
];

function AnimatedPostCard({
  post,
  author,
  index,
  saved,
  onPress,
  onAuthorPress,
  onToggleSaved,
}: {
  post: AppPost;
  author?: AppAuthor;
  index: number;
  saved: boolean;
  onPress: () => void;
  onAuthorPress: () => void;
  onToggleSaved: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 8)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, delay: Math.min(index * 35, 140), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, delay: Math.min(index * 35, 140), useNativeDriver: true }),
    ]).start();
  }, [index, opacity, reducedMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <PostCard
        post={post}
        author={author}
        saved={saved}
        onPress={onPress}
        onAuthorPress={onAuthorPress}
        onToggleSaved={onToggleSaved}
      />
    </Animated.View>
  );
}

function isPlaceholderAuthor(author?: AppAuthor) {
  return Boolean(author && /^Usuario\s+\d+$/i.test(author.name));
}

export function DashboardView() {
  const router = useRouter();
  const theme = useTheme();
  const {
    posts,
    authors,
    threads,
    savedPostIds,
    isHydrating,
    dataError,
    retryData,
    toggleSavedPost,
  } = useAppData();
  const { profile: currentAuthor } = useCurrentUserProfile();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [resolvedAuthors, setResolvedAuthors] = useState<Record<string, AppAuthor>>({});
  const unreadCount = threads.reduce((total, thread) => total + thread.unreadCount, 0);

  const visiblePosts = useMemo(
    () =>
      posts.filter(post => {
        if (filter === 'saved') return savedPostIds.includes(post.id);
        if (post.status === 'completed' || post.status === 'paused') return false;
        if (filter === 'donation') return post.kind === 'donation';
        if (filter === 'request') return post.kind === 'request';
        return true;
      }),
    [filter, posts, savedPostIds],
  );

  const navItems = [
    { key: 'home', label: 'Inicio', icon: 'home-outline' as const },
    { key: 'publish', label: 'Publicar', icon: 'plus-circle-outline' as const },
    { key: 'messages', label: 'Mensajes', icon: 'chat-outline' as const, badge: unreadCount > 0 },
  ];

  useEffect(() => {
    let active = true;

    const loadAuthors = async () => {
      const token = await getStoredAuthToken();
      if (!token) return;

      const missingIds = visiblePosts
        .map(post => post.authorId)
        .filter((authorId, index, items) => items.indexOf(authorId) === index)
        .filter(authorId => {
          const existing = resolvedAuthors[authorId] ?? authors.find(candidate => candidate.id === authorId);
          return !existing || isPlaceholderAuthor(existing);
        });

      if (!missingIds.length) return;

      const results = await Promise.allSettled(
        missingIds.map(async authorId => {
          const backendUser = await fetchBackendUserById(authorId, token);
          return [authorId, backendUserToAuthor(backendUser)] as const;
        }),
      );

      if (!active) return;

      setResolvedAuthors(current => {
        const next = { ...current };
        for (const result of results) {
          if (result.status !== 'fulfilled') continue;
          const [authorId, author] = result.value;
          next[authorId] = author;
        }
        return next;
      });
    };

    void loadAuthors();

    return () => {
      active = false;
    };
  }, [authors, resolvedAuthors, visiblePosts]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBarFrame}>
        <View style={styles.topBar}>
          <View style={styles.brandWrap}>
            <Surface style={[styles.brandIcon, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
              <MaterialCommunityIcons name="hand-heart" size={24} color={theme.colors.primary} />
            </Surface>
            <Text variant="titleLarge" style={[styles.brand, { color: theme.colors.onSurface }]}>
              Nexo Solidario
            </Text>
          </View>

          <TouchableRipple
            borderless
            onPress={() => router.push('/personal-data')}
            accessibilityRole="button"
            accessibilityLabel="Abrir mi perfil"
            style={styles.profileButton}>
            <AuthorAvatar author={currentAuthor} size={42} fallbackLabel="MG" />
          </TouchableRipple>
        </View>
      </View>

      <FlatList
        data={isHydrating ? [] : visiblePosts}
        keyExtractor={post => post.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <TouchableRipple
              onPress={() => router.push('/search')}
              accessibilityRole="search"
              accessibilityLabel="Buscar donaciones o solicitudes"
              borderless
              style={styles.searchRipple}>
              <Surface
                elevation={0}
                style={[styles.searchSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Buscar donaciones o solicitudes
                </Text>
              </Surface>
            </TouchableRipple>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map(item => (
                <CategoryChip key={item.key} label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
              ))}
            </ScrollView>

            {dataError ? (
              <Surface elevation={0} style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
                <MaterialCommunityIcons name="cloud-alert-outline" size={24} color={theme.colors.error} />
                <View style={styles.summaryCopy}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onErrorContainer, fontWeight: '800' }}>
                    No pudimos recuperar todos tus datos
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                    {dataError}
                  </Text>
                </View>
                <Button compact onPress={retryData}>Reintentar</Button>
              </Surface>
            ) : (
              <Surface elevation={0} style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="sync-circle" size={30} color={theme.colors.primary} />
                <View style={styles.summaryCopy}>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Comunidad activa
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Las publicaciones nuevas aparecen automáticamente, sin recargar.
                  </Text>
                </View>
              </Surface>
            )}

            <View style={styles.listHeading}>
              <View style={styles.headingCopy}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {filter === 'saved' ? 'Publicaciones guardadas' : 'Publicaciones recientes'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {isHydrating ? 'Cargando…' : `${visiblePosts.length} ${visiblePosts.length === 1 ? 'publicación' : 'publicaciones'}`}
                </Text>
              </View>
              {filter !== 'saved' && savedPostIds.length > 0 ? (
                <Button compact icon="bookmark-outline" onPress={() => router.push('/saved-posts')}>
                  Ver guardadas
                </Button>
              ) : null}
            </View>

            {isHydrating ? (
              <View style={styles.skeletons}>
                <SkeletonPostCard />
                <SkeletonPostCard />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const localAuthor = authors.find(candidate => candidate.id === item.authorId);
          const author = resolvedAuthors[item.authorId] ?? localAuthor;
          return (
            <AnimatedPostCard
              post={item}
              author={author}
              index={index}
              saved={savedPostIds.includes(item.id)}
              onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: item.id } })}
              onAuthorPress={() => router.push({ pathname: '/profile/[authorId]', params: { authorId: item.authorId } })}
              onToggleSaved={() => toggleSavedPost(item.id)}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isHydrating ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={filter === 'saved' ? 'bookmark-outline' : 'inbox-outline'}
                size={42}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
                {filter === 'saved' ? 'Todavía no guardaste publicaciones' : 'No hay publicaciones en este filtro'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {filter === 'saved'
                  ? 'Usá el marcador de una tarjeta para encontrarla después.'
                  : 'Probá otro tipo o creá una nueva publicación.'}
              </Text>
            </View>
          ) : null
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
  root: { flex: 1 },
  topBarFrame: { paddingHorizontal: 16 },
  topBar: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  brand: { fontWeight: '800' },
  profileButton: { borderRadius: 999 },
  listContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 22 },
  headerContent: { gap: 18, paddingTop: 4, paddingBottom: 16 },
  searchRipple: { borderRadius: 16 },
  searchSurface: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  filterRow: { gap: 9, paddingRight: 16 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 16 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 14 },
  summaryCopy: { flex: 1, gap: 3 },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 2 },
  headingCopy: { flex: 1, gap: 3 },
  sectionTitle: { fontWeight: '800' },
  skeletons: { gap: 12 },
  separator: { height: 12 },
  emptyState: { alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 42 },
});
