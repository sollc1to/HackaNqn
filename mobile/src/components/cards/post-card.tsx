import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { type AppAuthor } from '@/data/authors';
import {
  formatPostQuantity,
  getPostImageSource,
  type AppPost,
  postKindLabel,
  postStatusLabel,
} from '@/data/posts';
import { formatRelativeDate } from '@/utils/date';
import { SmartImage } from '../media/smart-image';

type PostCardProps = {
  post: AppPost;
  author?: AppAuthor;
  distanceKm?: number;
  saved?: boolean;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onToggleSaved?: () => void;
};

export function PostCard({ post, author, distanceKm, saved, onPress, onAuthorPress, onToggleSaved }: PostCardProps) {
  const theme = useTheme();
  const statusColor =
    post.status === 'available'
      ? theme.colors.primary
      : post.status === 'reserved'
        ? '#8A5A00'
        : theme.colors.onSurfaceVariant;

  return (
    <Card
      mode="outlined"
      onPress={onPress}
      accessibilityLabel={`${postKindLabel[post.kind]}: ${post.title}. ${formatPostQuantity(post)}. ${postStatusLabel[post.status]}.`}
      accessibilityHint="Abrir detalle de la publicación"
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.row}>
        <SmartImage
          source={getPostImageSource(post.images[0])}
          style={styles.image}
          contentFit="cover"
          transition={160}
          accessibilityLabel={post.images[0]?.alt ?? `Foto de ${post.title}`}
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.badges}>
              <View style={[styles.kindBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
                  {postKindLabel[post.kind]}
                </Text>
              </View>
              <View style={styles.statusWrap}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text variant="labelSmall" style={{ color: statusColor, fontWeight: '800' }}>
                  {postStatusLabel[post.status]}
                </Text>
              </View>
            </View>
            {onToggleSaved ? (
              <IconButton
                icon={saved ? 'bookmark' : 'bookmark-outline'}
                size={19}
                onPress={onToggleSaved}
                accessibilityLabel={saved ? 'Quitar de publicaciones guardadas' : 'Guardar publicación'}
                style={styles.saveButton}
              />
            ) : null}
          </View>

          <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: theme.colors.onSurface }]}>
            {post.title}
          </Text>

          <View style={styles.quantityRow}>
            <MaterialCommunityIcons name="counter" size={16} color={theme.colors.onSurface} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
              {post.kind === 'donation' ? 'Disponible:' : 'Solicitada:'} {formatPostQuantity(post)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" numberOfLines={1} style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {typeof distanceKm === 'number' ? `${distanceKm.toLocaleString('es-AR', { maximumFractionDigits: 1 })} km · ` : ''}
              {post.location.label}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <TouchableRipple
              disabled={!onAuthorPress}
              onPress={onAuthorPress}
              borderless
              accessibilityRole="link"
              accessibilityLabel={`Ver perfil de ${author?.name ?? 'quien publica'}`}
              style={styles.authorButton}>
              <View style={styles.authorInner}>
                <MaterialCommunityIcons
                  name={author?.accountType === 'organization' ? 'office-building-outline' : 'account-outline'}
                  size={15}
                  color={author?.verified ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text variant="bodySmall" numberOfLines={1} style={[styles.authorText, { color: theme.colors.onSurfaceVariant }]}>
                  {author?.name ?? 'Perfil de la comunidad'}
                </Text>
                {author?.verified ? (
                  <MaterialCommunityIcons name="check-decagram" size={14} color={theme.colors.primary} />
                ) : null}
              </View>
            </TouchableRipple>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatRelativeDate(post.publishedAt)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 18 },
  row: { minHeight: 166, flexDirection: 'row' },
  image: { width: 108, minHeight: 166, backgroundColor: '#EEF5EC' },
  content: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 10, gap: 7 },
  topRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  badges: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  kindBadge: { minHeight: 23, justifyContent: 'center', borderRadius: 999, paddingHorizontal: 8 },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  saveButton: { width: 30, height: 30, margin: -4 },
  title: { fontWeight: '800', lineHeight: 21 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { flex: 1 },
  bottomRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  authorButton: { minWidth: 0, flex: 1, borderRadius: 8 },
  authorInner: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  authorText: { flexShrink: 1 },
});
