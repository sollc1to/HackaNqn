import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, PostCard } from '@/components';
import { useAppData } from '@/state/app-data-context';

export function SavedPostsView() {
  const router = useRouter();
  const theme = useTheme();
  const { savedPosts, savedPostIds, authors, toggleSavedPost } = useAppData();

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Publicaciones guardadas" onBackPress={() => router.back()} />
      <View style={styles.copy}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
          Tus guardadas
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Se actualizan si una publicación cambia a reservada o completada.
        </Text>
      </View>

      <View style={styles.list}>
        {savedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            author={authors.find(author => author.id === post.authorId)}
            saved={savedPostIds.includes(post.id)}
            onToggleSaved={() => toggleSavedPost(post.id)}
            onAuthorPress={() => router.push({ pathname: '/profile/[authorId]', params: { authorId: post.authorId } })}
            onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.id } })}
          />
        ))}
      </View>

      {savedPosts.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bookmark-outline" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
            No hay publicaciones guardadas
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Tocá el marcador de cualquier publicación para encontrarla acá.
          </Text>
          <Button mode="contained" onPress={() => router.replace('/dashboard')}>Explorar publicaciones</Button>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 28 },
  copy: { gap: 5, paddingHorizontal: 16 },
  list: { gap: 12, paddingHorizontal: 16 },
  empty: { alignItems: 'center', gap: 12, paddingHorizontal: 28, paddingVertical: 46 },
});
