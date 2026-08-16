import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, CategoryChip, MyPostItem, SegmentedControl } from '@/components';
import { type PostStatus } from '@/data/posts';
import { useAppData } from '@/state/app-data-context';

type PostStateFilter = 'all' | PostStatus;

export function MyPostsView() {
  const router = useRouter();
  const theme = useTheme();
  const { posts } = useAppData();
  const [filter, setFilter] = useState<PostStateFilter>('all');

  const visiblePosts = useMemo(
    () => posts.filter(post => post.ownerId === 'current-user' && (filter === 'all' || post.status === filter)),
    [filter, posts],
  );

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Mis publicaciones" onBackPress={() => router.back()} />

      <View style={styles.horizontalPadding}>
        <SegmentedControl
          value="my-posts"
          onValueChange={value => {
            if (value === 'personal-data') router.push('/personal-data');
          }}
          options={[
            { value: 'my-posts', label: 'Mis publicaciones' },
            { value: 'personal-data', label: 'Datos personales' },
          ]}
        />
      </View>

      <View style={styles.filterRow}>
        <CategoryChip label="Todas" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <CategoryChip label="Activas" selected={filter === 'active'} onPress={() => setFilter('active')} />
        <CategoryChip label="Completadas" selected={filter === 'completed'} onPress={() => setFilter('completed')} />
        <CategoryChip label="Inactivas" selected={filter === 'inactive'} onPress={() => setFilter('inactive')} />
      </View>

      <View style={styles.list}>
        {visiblePosts.map(post => (
          <MyPostItem
            key={post.id}
            post={post}
            onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.id } })}
          />
        ))}
      </View>

      {visiblePosts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={44} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            No hay publicaciones en este estado
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Podés cambiar el filtro o crear una nueva publicación.
          </Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        icon="plus"
        contentStyle={styles.buttonContent}
        style={styles.createButton}
        onPress={() => router.push('/create-post')}>
        Crear nueva publicación
      </Button>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    gap: 18,
  },
  horizontalPadding: {
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingHorizontal: 16,
  },
  list: {
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  buttonContent: {
    minHeight: 50,
  },
  createButton: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
});
