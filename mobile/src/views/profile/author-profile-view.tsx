import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Dialog, Divider, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, AuthorAvatar, PostCard, RatingStars } from '@/components';
import { currentUserId } from '@/data/authors';
import { formatDate } from '@/utils/date';
import { useAppData } from '@/state/app-data-context';

export function AuthorProfileView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ authorId?: string | string[] }>();
  const authorId = Array.isArray(params.authorId) ? params.authorId[0] : params.authorId;
  const { authors, posts, savedPostIds, toggleSavedPost, addReview, preferences, report } = useAppData();
  const author = authors.find(candidate => candidate.id === authorId);
  const authorPosts = useMemo(() => posts.filter(post => post.authorId === authorId), [authorId, posts]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  if (!author) {
    return (
      <AppScreen contentStyle={styles.missing}>
        <MaterialCommunityIcons name="account-question-outline" size={52} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Perfil no encontrado</Text>
        <Button mode="contained" onPress={() => router.back()}>Volver</Button>
      </AppScreen>
    );
  }

  const submitReview = () => {
    if (rating < 1) {
      setError('Elegí un puntaje de 1 a 5 estrellas.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Contá tu experiencia en al menos 10 caracteres.');
      return;
    }
    addReview(author.id, rating, comment);
    setReviewOpen(false);
    setRating(0);
    setComment('');
    setError('');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Perfil" onBackPress={() => router.back()} />

      <View style={styles.hero}>
        <AuthorAvatar author={author} size={86} />
        <View style={styles.heroCopy}>
          <View style={styles.nameRow}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '800', flexShrink: 1 }}>{author.name}</Text>
            {author.verified ? <MaterialCommunityIcons name="check-decagram" size={22} color={theme.colors.primary} /> : null}
          </View>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {author.accountType === 'organization' ? 'Organización' : 'Persona'} · {author.location}
          </Text>
          <View style={styles.ratingRow}>
            <RatingStars value={author.rating} size={19} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{author.rating.toFixed(1)} ({author.reviewCount} reseñas)</Text>
          </View>
        </View>
      </View>

      <Surface elevation={0} style={[styles.verificationCard, { backgroundColor: author.verified ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={author.verified ? 'shield-check-outline' : 'account-check-outline'} size={26} color={author.verified ? theme.colors.primary : theme.colors.onSurfaceVariant} />
        <View style={styles.cardCopy}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
            {author.verified ? 'Perfil verificado para la demostración' : author.identityConfirmed ? 'Identidad declarada confirmada' : 'Identidad sin confirmar'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
            {author.verified
              ? 'La insignia indica una revisión simulada de identidad y documentación. Las organizaciones de esta demo son ficticias y están identificadas como tales.'
              : 'Esta cuenta no representa una organización verificada. Coordiná en un lugar público y no envíes dinero.'}
          </Text>
        </View>
      </Surface>

      <Surface elevation={0} style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Sobre este perfil</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>{author.bio}</Text>
        <Divider />
        <View style={styles.stats}>
          <View style={styles.stat}><Text variant="headlineSmall" style={styles.statValue}>{author.completedExchanges}</Text><Text variant="bodySmall" style={styles.statLabel}>Intercambios completados</Text></View>
          <View style={styles.stat}><Text variant="headlineSmall" style={styles.statValue}>{authorPosts.length}</Text><Text variant="bodySmall" style={styles.statLabel}>Publicaciones</Text></View>
          <View style={styles.stat}><Text variant="titleSmall" style={styles.statValue}>{formatDate(author.memberSince)}</Text><Text variant="bodySmall" style={styles.statLabel}>En la comunidad desde</Text></View>
        </View>
      </Surface>

      <View style={styles.actionRow}>
        {author.id !== currentUserId && preferences.allowReviews ? (
          <Button mode="contained" icon="star-outline" onPress={() => setReviewOpen(true)}>Escribir reseña</Button>
        ) : null}
        {author.id !== currentUserId ? (
          <Button mode="text" icon="flag-outline" textColor={theme.colors.error} onPress={() => setReportOpen(true)}>Reportar perfil</Button>
        ) : null}
      </View>

      <View style={styles.sectionTitleRow}>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Reseñas recientes</Text>
      </View>
      <View style={styles.reviewList}>
        {author.reviews.map(review => (
          <Surface key={review.id} elevation={0} style={[styles.reviewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.reviewTop}><Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{review.authorName}</Text><RatingStars value={review.rating} size={17} /></View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{review.comment}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatDate(review.createdAt)}</Text>
          </Surface>
        ))}
      </View>

      {authorPosts.length > 0 ? (
        <>
          <View style={styles.sectionTitleRow}><Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Publicaciones</Text></View>
          <View style={styles.posts}>
            {authorPosts.map(post => (
              <PostCard key={post.id} post={post} author={author} saved={savedPostIds.includes(post.id)} onToggleSaved={() => toggleSavedPost(post.id)} onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.id } })} />
            ))}
          </View>
        </>
      ) : null}

      <Portal>
        <Dialog visible={reviewOpen} onDismiss={() => setReviewOpen(false)} style={styles.dialog}>
          <Dialog.Title>Reseñar a {author.name}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium">Calificá únicamente un intercambio que hayas completado.</Text>
            <RatingStars value={rating} onChange={setRating} size={28} />
            <TextInput mode="outlined" label="Contá tu experiencia" value={comment} onChangeText={value => { setComment(value.slice(0, 300)); setError(''); }} multiline />
            <Text variant="bodySmall" style={{ color: error ? theme.colors.error : theme.colors.onSurfaceVariant }}>{error || `${comment.length}/300 caracteres`}</Text>
          </Dialog.Content>
          <Dialog.Actions><Button onPress={() => setReviewOpen(false)}>Cancelar</Button><Button mode="contained" onPress={submitReview}>Publicar reseña</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={reportOpen} onDismiss={() => setReportOpen(false)}>
          <Dialog.Title>Reportar perfil</Dialog.Title>
          <Dialog.Content><Text>El reporte se registra para revisión de moderación.</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReportOpen(false)}>Cancelar</Button>
            <Button textColor={theme.colors.error} onPress={() => { report({ targetType: 'user', targetId: author.id, reason: 'Comportamiento o identidad sospechosa' }); setReportOpen(false); }}>Enviar reporte</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 30 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16 },
  heroCopy: { flex: 1, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  verificationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 18, marginHorizontal: 16, padding: 16 },
  cardCopy: { flex: 1, gap: 4 },
  sectionCard: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 16, gap: 14 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { minWidth: 120, flex: 1, gap: 2 },
  statValue: { color: '#1B1C1C', fontWeight: '800' },
  statLabel: { color: '#40493D' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  sectionTitleRow: { paddingHorizontal: 16 },
  reviewList: { gap: 10, paddingHorizontal: 16 },
  reviewCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 7 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  posts: { gap: 12, paddingHorizontal: 16 },
  missing: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  dialog: { width: '92%', maxWidth: 480, alignSelf: 'center' },
  dialogContent: { gap: 14 },
});
