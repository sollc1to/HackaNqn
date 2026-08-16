import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';

import { type AppPost, postKindLabel } from '@/data/posts';

type PostCardProps = {
  post: AppPost;
  onPress?: () => void;
};

export function PostCard({ post, onPress }: PostCardProps) {
  const theme = useTheme();

  return (
    <Card
      mode="outlined"
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.row}>
        <Image
          source={{ uri: post.imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={180}
          accessibilityLabel={`Foto de ${post.title}`}
        />

        <View style={styles.content}>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    post.kind === 'donation' ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
                },
              ]}>
              <Text
                variant="labelSmall"
                style={[
                  styles.badgeText,
                  {
                    color:
                      post.kind === 'donation'
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSecondaryContainer,
                  },
                ]}>
                {postKindLabel[post.kind]}
              </Text>
            </View>

            {post.urgent ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
                <Text variant="labelSmall" style={[styles.badgeText, { color: theme.colors.error }]}>
                  Urgente
                </Text>
              </View>
            ) : null}
          </View>

          <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: theme.colors.onSurface }]}>
            {post.title}
          </Text>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" numberOfLines={1} style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {post.distanceKm.toLocaleString('es-AR')} km · {post.location}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name={post.verified ? 'check-decagram' : 'account-outline'}
              size={15}
              color={post.verified ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" numberOfLines={1} style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {post.author}
            </Text>
          </View>

          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {post.publishedAt}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 18,
  },
  row: {
    minHeight: 148,
    flexDirection: 'row',
  },
  image: {
    width: 108,
    minHeight: 148,
    backgroundColor: '#EEF5EC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 7,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    minHeight: 24,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 9,
  },
  badgeText: {
    fontWeight: '700',
  },
  title: {
    fontWeight: '800',
    lineHeight: 21,
  },
  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
  },
});
