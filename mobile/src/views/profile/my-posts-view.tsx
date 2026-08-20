import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, CategoryChip, MyPostItem } from '@/components';
import { postStatusLabel, type PostStatus } from '@/data/posts';
import { useAppData } from '@/state/app-data-context';

type PostStateFilter = 'all' | PostStatus;

export function MyPostsView() {
  const router = useRouter();
  const theme = useTheme();
  const { posts, authors, updatePost, currentUserId } = useAppData();
  const [filter, setFilter] = useState<PostStateFilter>('all');
  const profile = authors.find(author => author.id === currentUserId);
  const mine = useMemo(() => posts.filter(post => post.authorId === currentUserId), [currentUserId, posts]);
  const visiblePosts = useMemo(() => mine.filter(post => filter === 'all' || post.status === filter), [filter, mine]);
  const interestedCount = mine.reduce((total, post) => total + post.interestedUserIds.length, 0);

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Mis publicaciones" onBackPress={() => router.back()} rightIcon="plus" onRightPress={() => router.push('/create-post')} />

      <View style={styles.summaryRow}>
        <Surface elevation={0} style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}><MaterialCommunityIcons name="clipboard-text-outline" size={25} color={theme.colors.primary} /><Text variant="headlineSmall" style={styles.summaryValue}>{mine.length}</Text><Text variant="bodySmall" style={styles.summaryLabel}>Publicaciones</Text></Surface>
        <Surface elevation={0} style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}><MaterialCommunityIcons name="account-heart-outline" size={25} color={theme.colors.onSurfaceVariant} /><Text variant="headlineSmall" style={styles.summaryValue}>{interestedCount}</Text><Text variant="bodySmall" style={styles.summaryLabel}>Personas interesadas</Text></Surface>
        <Surface elevation={0} style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}><MaterialCommunityIcons name="star-outline" size={25} color="#9A6700" /><Text variant="headlineSmall" style={styles.summaryValue}>{profile?.rating.toFixed(1) ?? '—'}</Text><Text variant="bodySmall" style={styles.summaryLabel}>Calificación</Text></Surface>
      </View>

      <View style={styles.filterRow}>
        <CategoryChip label="Todas" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {(['available', 'reserved', 'completed', 'paused'] as PostStatus[]).map(status => <CategoryChip key={status} label={postStatusLabel[status]} selected={filter === status} onPress={() => setFilter(status)} />)}
      </View>

      <View style={styles.list}>
        {visiblePosts.map(post => (
          <Surface key={post.id} elevation={0} style={[styles.managedCard, { backgroundColor: theme.colors.background }]}>
            <MyPostItem post={post} onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.id } })} />
            <View style={styles.actions}>
              <Button compact icon="pencil-outline" onPress={() => router.push({ pathname: '/edit-post/[postId]', params: { postId: post.id } })}>Editar</Button>
              <Button compact icon={post.status === 'paused' ? 'play' : 'pause'} onPress={() => updatePost(post.id, { status: post.status === 'paused' ? 'available' : 'paused' })}>{post.status === 'paused' ? 'Reactivar' : 'Pausar'}</Button>
              <Button compact icon="bookmark-check-outline" onPress={() => updatePost(post.id, { status: 'reserved' })}>Reservar</Button>
              <Button compact icon="check-circle-outline" onPress={() => updatePost(post.id, { status: 'completed' })}>Completar</Button>
            </View>
          </Surface>
        ))}
      </View>

      {visiblePosts.length === 0 ? <View style={styles.emptyState}><MaterialCommunityIcons name="clipboard-text-outline" size={44} color={theme.colors.onSurfaceVariant} /><Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>No hay publicaciones en este estado</Text><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>Podés cambiar el filtro o crear una nueva publicación.</Text></View> : null}

      <Surface elevation={0} style={[styles.historyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}><View style={styles.historyCopy}><Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Historial de intercambios</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{profile?.completedExchanges ?? 0} completados · {profile?.reviewCount ?? 0} reseñas recibidas</Text></View><Button compact onPress={() => router.push({ pathname: '/profile/[authorId]', params: { authorId: currentUserId } })}>Ver perfil</Button></Surface>
      <Button mode="contained" icon="plus" contentStyle={styles.buttonContent} style={styles.createButton} onPress={() => router.push('/create-post')}>Crear nueva publicación</Button>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, gap: 18 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  summaryCard: { minWidth: 100, flex: 1, alignItems: 'center', gap: 2, borderRadius: 16, padding: 12 },
  summaryValue: { color: '#1B1C1C', fontWeight: '800' },
  summaryLabel: { color: '#40493D', textAlign: 'center' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 16 },
  list: { gap: 14, paddingHorizontal: 16 },
  managedCard: { gap: 5, borderRadius: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingHorizontal: 4 },
  emptyState: { alignItems: 'center', gap: 10, paddingHorizontal: 28, paddingVertical: 36 },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, marginHorizontal: 16, padding: 14 },
  historyCopy: { flex: 1, gap: 3 },
  buttonContent: { minHeight: 50 },
  createButton: { marginHorizontal: 16, borderRadius: 12 },
});
