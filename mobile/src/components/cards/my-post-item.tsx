import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { formatPostQuantity, getPostImageSource, type AppPost, postKindLabel, postStatusLabel } from '@/data/posts';
import { formatRelativeDate } from '@/utils/date';
import { SmartImage } from '../media/smart-image';

type MyPostItemProps = {
  post: AppPost;
  onPress?: () => void;
};

export function MyPostItem({ post, onPress }: MyPostItemProps) {
  const theme = useTheme();
  const statusColor = post.status === 'available' ? theme.colors.primary : theme.colors.onSurfaceVariant;

  return (
    <TouchableRipple onPress={onPress} borderless style={styles.ripple}>
      <Surface
        elevation={0}
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
        ]}>
        <SmartImage
          source={getPostImageSource(post.images[0])}
          style={styles.image}
          contentFit="cover"
          transition={160}
          accessibilityLabel={post.images[0]?.alt ?? `Foto de ${post.title}`}
        />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text variant="labelMedium" style={[styles.kind, { color: theme.colors.onSurfaceVariant }]}>
              {postKindLabel[post.kind]}
            </Text>
            <View style={styles.statusWrap}>
              <View style={[styles.dot, { backgroundColor: statusColor }]} />
              <Text variant="labelSmall" style={[styles.status, { color: statusColor }]}>
                {postStatusLabel[post.status]}
              </Text>
            </View>
          </View>

          <Text variant="titleSmall" numberOfLines={2} style={[styles.title, { color: theme.colors.onSurface }]}>
            {post.title}
          </Text>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" numberOfLines={1} style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {post.location.label}
            </Text>
          </View>

          <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
            {formatPostQuantity(post)} · {post.interestedUserIds.length} personas interesadas
          </Text>

          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatRelativeDate(post.publishedAt)}
          </Text>
        </View>
      </Surface>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  ripple: {
    borderRadius: 16,
  },
  card: {
    minHeight: 112,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
  },
  image: {
    width: 96,
    backgroundColor: '#EEF5EC',
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kind: {
    fontWeight: '700',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  status: {
    fontWeight: '700',
  },
  title: {
    fontWeight: '800',
  },
  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    flex: 1,
  },
});
