import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Share, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Portal,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

import { AppHeader, AppScreen } from '@/components';
import { getMessageThread } from '@/data/messages';
import { postKindLabel } from '@/data/posts';
import { currentUser } from '@/data/profile';
import { useAppData } from '@/state/app-data-context';

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons name={icon as never} size={20} color={theme.colors.onSurfaceVariant} />
      <View style={styles.detailCopy}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function PostDetailView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const { posts } = useAppData();
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const post = useMemo(() => {
    const id = Array.isArray(params.postId) ? params.postId[0] : params.postId;
    return posts.find(item => item.id === id);
  }, [params.postId, posts]);

  if (!post) {
    return (
      <AppScreen contentStyle={styles.missingContent}>
        <MaterialCommunityIcons name="file-question-outline" size={52} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Publicación no encontrada
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          La publicación ya no está disponible o el enlace es incorrecto.
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Volver
        </Button>
      </AppScreen>
    );
  }

  const thread = getMessageThread(post.id);
  const authorImageUri =
    post.ownerId === 'current-user' ? currentUser.imageUri : post.authorImageUri ?? thread?.participantImageUri;

  const sharePost = async () => {
    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n${post.description}\n${post.location}\nCompartido desde Nexo Solidario.`,
      });
    } catch {
      setFeedback('No pudimos abrir las opciones para compartir.');
    }
  };

  const contact = () => {
    if (post.ownerId === 'current-user') {
      router.push('/messages-by-post');
      return;
    }

    router.push({ pathname: '/conversation/[threadId]', params: { threadId: post.id } });
  };

  return (
    <AppScreen
      footer={
        <Button mode="contained" icon="chat-outline" contentStyle={styles.footerButton} onPress={contact}>
          {post.ownerId === 'current-user' ? 'Ver mensajes' : 'Contactar'}
        </Button>
      }
      contentStyle={styles.content}>
      <AppHeader title="Detalle de la publicación" onBackPress={() => router.back()} rightIcon="share-variant-outline" onRightPress={sharePost} />

      <Surface elevation={0} style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={{ uri: post.imageUri }}
          style={styles.heroImage}
          contentFit="cover"
          transition={180}
          accessibilityLabel={`Foto de ${post.title}`}
        />
        <View style={styles.heroCopy}>
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
                variant="labelMedium"
                style={{
                  color:
                    post.kind === 'donation'
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSecondaryContainer,
                  fontWeight: '700',
                }}>
                {postKindLabel[post.kind]}
              </Text>
            </View>
            {post.urgent ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
                <Text variant="labelMedium" style={{ color: theme.colors.error, fontWeight: '800' }}>
                  Urgente
                </Text>
              </View>
            ) : null}
          </View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {post.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {post.description}
          </Text>

          <View style={styles.quickMeta}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
              {post.location} · {post.distanceKm.toLocaleString('es-AR')} km
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Publicada {post.publishedAt.toLowerCase()} · Última actividad: {post.lastActivity.toLowerCase()}
          </Text>
        </View>
      </Surface>

      <Surface
        elevation={0}
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Información de la publicación
        </Text>
        <View style={styles.detailsGrid}>
          <DetailItem icon="counter" label="Cantidad" value={post.quantity} />
          <DetailItem icon="star-check-outline" label="Condición" value={post.condition} />
          <DetailItem icon="truck-delivery-outline" label="Forma de entrega" value={post.delivery} />
          <DetailItem icon="calendar-clock-outline" label="Disponibilidad" value={post.availability} />
          <DetailItem icon="map-marker-radius-outline" label="Punto aproximado" value={post.meetingPoint} />
          <DetailItem
            icon="information-outline"
            label="Estado"
            value={post.status === 'active' ? 'Activa' : post.status === 'completed' ? 'Completada' : 'Inactiva'}
          />
        </View>

        <Divider />
        <View style={styles.highlights}>
          {post.highlights.map(item => (
            <View key={item} style={[styles.highlight, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </Surface>

      <Surface
        elevation={0}
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Perfil de quien publica
        </Text>
        <View style={styles.authorRow}>
          {authorImageUri ? (
            <Avatar.Image size={58} source={{ uri: authorImageUri }} />
          ) : (
            <Avatar.Text size={58} label={post.authorInitials} />
          )}
          <View style={styles.authorCopy}>
            <View style={styles.authorNameRow}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
                {post.author}
              </Text>
              {post.verified ? (
                <MaterialCommunityIcons name="check-decagram" size={19} color={theme.colors.primary} />
              ) : null}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {post.verified ? 'Organización verificada' : 'Perfil de la comunidad'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {post.completedExchanges} intercambios completados
            </Text>
          </View>
        </View>
      </Surface>

      <Surface elevation={0} style={[styles.safetyCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.colors.primary} />
        <View style={styles.safetyCopy}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
            Coordiná de forma segura
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
            Acordá el punto exacto por mensaje y evitá compartir datos sensibles en la publicación.
          </Text>
        </View>
      </Surface>

      <View style={styles.secondaryActions}>
        <Button
          mode="outlined"
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          onPress={() => {
            setSaved(current => !current);
            setFeedback(saved ? 'Publicación eliminada de guardadas.' : 'Publicación guardada.');
          }}>
          {saved ? 'Guardada' : 'Guardar'}
        </Button>
        <Button mode="text" icon="flag-outline" textColor={theme.colors.error} onPress={() => setReportOpen(true)}>
          Reportar publicación
        </Button>
      </View>

      <Portal>
        <Dialog visible={reportOpen} onDismiss={() => setReportOpen(false)}>
          <Dialog.Title>Reportar publicación</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              El equipo revisará el contenido y la actividad de esta publicación.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReportOpen(false)}>Cancelar</Button>
            <Button
              textColor={theme.colors.error}
              onPress={() => {
                setReportOpen(false);
                setFeedback('Recibimos tu reporte. Gracias por cuidar la comunidad.');
              }}>
              Enviar reporte
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar visible={feedback.length > 0} onDismiss={() => setFeedback('')} duration={2600}>
          {feedback}
        </Snackbar>
      </Portal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 18,
    gap: 16,
  },
  heroCard: {
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 20,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#EEF5EC',
  },
  heroCopy: {
    gap: 10,
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  badge: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 11,
  },
  title: {
    fontWeight: '800',
  },
  description: {
    lineHeight: 24,
  },
  quickMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  detailsGrid: {
    gap: 13,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailValue: {
    fontWeight: '600',
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlight: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorCopy: {
    flex: 1,
    gap: 3,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
  },
  safetyCopy: {
    flex: 1,
    gap: 4,
  },
  secondaryActions: {
    gap: 8,
    marginHorizontal: 16,
  },
  footerButton: {
    minHeight: 50,
  },
  missingContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
});
