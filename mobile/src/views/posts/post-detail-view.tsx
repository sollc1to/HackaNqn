import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Share, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  Portal,
  RadioButton,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { AppHeader, AppScreen, AuthorAvatar, RatingStars, SmartImage } from '@/components';
import { currentUserId } from '@/data/authors';
import {
  conditionLabel,
  deliveryLabel,
  formatPostQuantity,
  getPostImageSource,
  postKindLabel,
  postStatusLabel,
} from '@/data/posts';
import { useAppData } from '@/state/app-data-context';
import { formatDate, formatRelativeDate } from '@/utils/date';

const reportReasons = [
  'Información engañosa o posible estafa',
  'Producto prohibido o peligroso',
  'Contenido ofensivo o discriminatorio',
  'Dirección o datos personales expuestos',
  'Publicación duplicada o ya resuelta',
];

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons name={icon as never} size={20} color={theme.colors.onSurfaceVariant} />
      <View style={styles.detailCopy}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
        <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

export function PostDetailView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const {
    posts,
    authors,
    isPostSaved,
    toggleSavedPost,
    showInterest,
    ensureThreadForPost,
    report,
    updatePost,
    deletePost,
  } = useAppData();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [interestedOpen, setInterestedOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const post = useMemo(() => posts.find(item => item.id === postId), [postId, posts]);
  const author = authors.find(candidate => candidate.id === post?.authorId);

  if (!post) {
    return (
      <AppScreen contentStyle={styles.missingContent}>
        <MaterialCommunityIcons name="file-question-outline" size={52} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Publicación no encontrada</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          La publicación ya no está disponible o el enlace es incorrecto.
        </Text>
        <Button mode="contained" onPress={() => router.back()}>Volver</Button>
      </AppScreen>
    );
  }

  const mine = post.ownerId === 'current-user';
  const saved = isPostSaved(post.id);
  const alreadyInterested = post.interestedUserIds.includes(currentUserId);
  const contactDisabled = post.status === 'completed' || post.status === 'paused';

  const sharePost = async () => {
    const deepLink = Linking.createURL(`/post/${post.id}`);
    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n${post.description}\n${post.location.label}\n${deepLink}`,
        url: deepLink,
      });
    } catch {
      setFeedback(`No pudimos abrir el menú para compartir. Enlace: ${deepLink}`);
    }
  };

  const openConversation = () => {
    if (contactDisabled) return;
    if (mine) {
      router.push('/messages-by-post');
      return;
    }
    const threadId = ensureThreadForPost(post);
    router.push({ pathname: '/conversation/[threadId]', params: { threadId } });
  };

  const submitReport = () => {
    if (!reportReason) {
      setReportError('Elegí un motivo para que moderación pueda revisar el caso.');
      return;
    }
    report({ targetType: 'post', targetId: post.id, reason: reportReason, details: reportDetails.trim() || undefined });
    setReportOpen(false);
    setReportReason('');
    setReportDetails('');
    setReportError('');
    setFeedback('Reporte recibido. Quedó registrado para revisión.');
  };

  const footer = mine ? (
    <View style={styles.footerActions}>
      <Button mode="outlined" icon="pencil-outline" style={styles.footerAction} onPress={() => router.push({ pathname: '/edit-post/[postId]', params: { postId: post.id } })}>
        Editar
      </Button>
      <Button mode="contained" icon="message-text-outline" style={styles.footerAction} onPress={openConversation}>Ver mensajes</Button>
    </View>
  ) : (
    <View style={styles.footerActions}>
      <Button
        mode="outlined"
        icon={alreadyInterested ? 'check' : 'hand-wave-outline'}
        style={styles.footerAction}
        disabled={contactDisabled || alreadyInterested}
        onPress={() => { showInterest(post.id); setFeedback('Interés registrado. La persona que publicó podrá verlo.'); }}>
        {alreadyInterested ? 'Interés enviado' : 'Mostrar interés'}
      </Button>
      <Button mode="contained" icon="chat-outline" style={styles.footerAction} disabled={contactDisabled} onPress={openConversation}>
        Enviar mensaje
      </Button>
    </View>
  );

  return (
    <AppScreen footer={footer} contentStyle={styles.content}>
      <AppHeader title="Detalle de la publicación" onBackPress={() => router.back()} rightIcon="share-variant-outline" onRightPress={sharePost} />

      <Surface elevation={0} style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
        <TouchableRipple
          onPress={() => setImageOpen(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Ampliar imagen ${selectedImage + 1} de ${post.images.length}`}
          style={styles.heroImageRipple}>
          <View>
            <SmartImage
              source={getPostImageSource(post.images[selectedImage])}
              style={styles.heroImage}
              contentFit="cover"
              transition={160}
              accessibilityLabel={post.images[selectedImage]?.alt ?? `Foto de ${post.title}`}
            />
            <View style={styles.zoomHint}>
              <MaterialCommunityIcons name="magnify-plus-outline" size={18} color="#FFFFFF" />
              <Text variant="labelSmall" style={styles.zoomText}>Ampliar</Text>
            </View>
          </View>
        </TouchableRipple>

        {post.images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {post.images.map((image, index) => (
              <TouchableRipple
                key={image.id}
                borderless
                onPress={() => setSelectedImage(index)}
                accessibilityLabel={`Ver imagen ${index + 1}`}
                accessibilityState={{ selected: selectedImage === index }}
                style={[styles.thumbnailButton, selectedImage === index && { borderColor: theme.colors.primary }]}>
                <SmartImage source={getPostImageSource(image)} style={styles.thumbnail} contentFit="cover" />
              </TouchableRipple>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.heroCopy}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{postKindLabel[post.kind]}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: post.status === 'available' ? theme.colors.primary : theme.colors.outline }]}>
              <Text variant="labelMedium" style={{ color: post.status === 'available' ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: '800' }}>
                {postStatusLabel[post.status]}
              </Text>
            </View>
          </View>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>{post.title}</Text>
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{post.description}</Text>
          <View style={styles.quickMeta}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>{post.location.label}</Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Publicada {formatRelativeDate(post.publishedAt).toLowerCase()} · Actualizada {formatRelativeDate(post.updatedAt).toLowerCase()}
          </Text>
        </View>
      </Surface>

      {contactDisabled ? (
        <Surface elevation={0} style={[styles.closedCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
            Esta publicación está {postStatusLabel[post.status].toLowerCase()} y ya no admite nuevos contactos.
          </Text>
        </Surface>
      ) : null}

      <Surface elevation={0} style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Información de la publicación</Text>
        <View style={styles.detailsGrid}>
          <DetailItem icon="counter" label={post.kind === 'donation' ? 'Cantidad disponible' : 'Cantidad solicitada'} value={formatPostQuantity(post)} />
          {post.condition ? <DetailItem icon="star-check-outline" label="Condición" value={conditionLabel[post.condition]} /> : null}
          <DetailItem icon="truck-delivery-outline" label="Forma de entrega" value={deliveryLabel[post.delivery]} />
          <DetailItem icon="calendar-clock-outline" label="Disponibilidad" value={post.availability} />
          {post.deadline ? <DetailItem icon="calendar-alert" label="Fecha límite" value={formatDate(post.deadline)} /> : null}
          <DetailItem icon="map-marker-radius-outline" label="Punto aproximado" value={post.meetingPoint} />
          <DetailItem icon="account-heart-outline" label="Personas interesadas" value={`${post.interestedUserIds.length}`} />
        </View>
      </Surface>

      <TouchableRipple
        onPress={() => author && router.push({ pathname: '/profile/[authorId]', params: { authorId: author.id } })}
        accessibilityRole="link"
        accessibilityLabel={`Ver perfil de ${author?.name ?? 'quien publica'}`}
        style={styles.authorRipple}>
        <Surface elevation={0} style={[styles.sectionCard, styles.authorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <AuthorAvatar author={author} size={58} />
          <View style={styles.authorCopy}>
            <View style={styles.authorNameRow}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{author?.name ?? 'Perfil de la comunidad'}</Text>
              {author?.verified ? <MaterialCommunityIcons name="check-decagram" size={19} color={theme.colors.primary} /> : null}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {author?.accountType === 'organization' ? 'Organización' : 'Persona'} · {author?.completedExchanges ?? 0} intercambios
            </Text>
            {author ? (
              <View style={styles.ratingRow}><RatingStars value={author.rating} size={16} /><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{author.rating.toFixed(1)} ({author.reviewCount})</Text></View>
            ) : null}
            <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>Ver perfil e historial</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
        </Surface>
      </TouchableRipple>

      <Surface elevation={0} style={[styles.safetyCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.colors.primary} />
        <View style={styles.safetyCopy}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Coordiná de forma segura</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
            Elegí un lugar público, no envíes dinero y compartí la dirección exacta solo cuando sea necesario.
          </Text>
          <Button compact mode="text" onPress={() => router.push('/safety')}>Ver normas y consejos</Button>
        </View>
      </Surface>

      {mine ? (
        <Surface elevation={0} style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Gestionar publicación</Text>
          <View style={styles.ownerActions}>
            <Button mode="outlined" icon="account-heart-outline" onPress={() => setInterestedOpen(true)}>Ver personas interesadas</Button>
            <Button mode="outlined" icon={post.status === 'paused' ? 'play' : 'pause'} onPress={() => updatePost(post.id, { status: post.status === 'paused' ? 'available' : 'paused' })}>{post.status === 'paused' ? 'Reactivar' : 'Pausar'}</Button>
            <Button mode="outlined" icon="bookmark-check-outline" onPress={() => updatePost(post.id, { status: 'reserved' })}>Marcar reservada</Button>
            <Button mode="outlined" icon="check-circle-outline" onPress={() => updatePost(post.id, { status: 'completed' })}>Marcar completada</Button>
            <Button mode="text" icon="delete-outline" textColor={theme.colors.error} onPress={() => setDeleteOpen(true)}>Eliminar publicación</Button>
          </View>
        </Surface>
      ) : (
        <View style={styles.secondaryActions}>
          <Button mode="outlined" icon={saved ? 'bookmark' : 'bookmark-outline'} onPress={() => { toggleSavedPost(post.id); setFeedback(saved ? 'Publicación eliminada de guardadas.' : 'Publicación guardada.'); }}>
            {saved ? 'Guardada' : 'Guardar'}
          </Button>
          <Button mode="text" icon="flag-outline" textColor={theme.colors.error} onPress={() => setReportOpen(true)}>Reportar publicación</Button>
        </View>
      )}

      <Portal>
        <Dialog visible={imageOpen} onDismiss={() => setImageOpen(false)} style={styles.imageDialog}>
          <View style={styles.imageDialogHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800' }}>Imagen {selectedImage + 1} de {post.images.length}</Text>
            <IconButton icon="close" onPress={() => setImageOpen(false)} accessibilityLabel="Cerrar imagen" />
          </View>
          <SmartImage source={getPostImageSource(post.images[selectedImage])} style={styles.fullImage} contentFit="contain" accessibilityLabel={post.images[selectedImage]?.alt} />
        </Dialog>

        <Dialog visible={reportOpen} onDismiss={() => setReportOpen(false)} style={styles.reportDialog}>
          <Dialog.Title>Reportar publicación</Dialog.Title>
          <Dialog.ScrollArea style={styles.reportScrollArea}>
            <ScrollView contentContainerStyle={styles.reportContent}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Elegí el motivo. El reporte queda registrado para revisión.</Text>
              <RadioButton.Group value={reportReason} onValueChange={value => { setReportReason(value); setReportError(''); }}>
                {reportReasons.map(reason => (
                  <TouchableRipple key={reason} onPress={() => { setReportReason(reason); setReportError(''); }} style={styles.reasonRow}>
                    <View style={styles.reasonInner}><RadioButton value={reason} /><Text variant="bodyMedium" style={{ flex: 1 }}>{reason}</Text></View>
                  </TouchableRipple>
                ))}
              </RadioButton.Group>
              <TextInput mode="outlined" label="Detalle adicional (opcional)" value={reportDetails} onChangeText={value => setReportDetails(value.slice(0, 300))} multiline />
              <Text variant="bodySmall" style={{ color: reportError ? theme.colors.error : theme.colors.onSurfaceVariant }}>{reportError || `${reportDetails.length}/300 caracteres`}</Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions><Button onPress={() => setReportOpen(false)}>Cancelar</Button><Button mode="contained" buttonColor={theme.colors.error} onPress={submitReport}>Enviar reporte</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)}>
          <Dialog.Title>Eliminar publicación</Dialog.Title>
          <Dialog.Content><Text>Esta acción la quitará de la aplicación. ¿Querés continuar?</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDeleteOpen(false)}>Cancelar</Button><Button textColor={theme.colors.error} onPress={() => { deletePost(post.id); setDeleteOpen(false); router.replace('/dashboard'); }}>Eliminar</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={interestedOpen} onDismiss={() => setInterestedOpen(false)}>
          <Dialog.Title>Personas interesadas</Dialog.Title>
          <Dialog.Content style={styles.interestedList}>
            {post.interestedUserIds.length ? post.interestedUserIds.map(id => {
              const person = authors.find(candidate => candidate.id === id);
              return <View key={id} style={styles.interestedRow}><AuthorAvatar author={person} size={38} /><Text style={{ flex: 1 }}>{person?.name ?? 'Miembro de la comunidad'}</Text></View>;
            }) : <Text>Todavía no hay personas interesadas.</Text>}
          </Dialog.Content>
          <Dialog.Actions><Button onPress={() => setInterestedOpen(false)}>Cerrar</Button></Dialog.Actions>
        </Dialog>

        <Snackbar visible={feedback.length > 0} onDismiss={() => setFeedback('')} duration={2800}>{feedback}</Snackbar>
      </Portal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 18, gap: 16 },
  heroCard: { overflow: 'hidden', marginHorizontal: 16, borderRadius: 20 },
  heroImageRipple: { borderRadius: 0 },
  heroImage: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#EEF5EC' },
  zoomHint: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, backgroundColor: 'rgba(27,28,28,0.78)', paddingHorizontal: 10, paddingVertical: 7 },
  zoomText: { color: '#FFFFFF', fontWeight: '800' },
  thumbnailRow: { gap: 8, padding: 10 },
  thumbnailButton: { width: 70, height: 54, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', borderRadius: 10 },
  thumbnail: { width: '100%', height: '100%' },
  heroCopy: { gap: 10, padding: 16 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  badge: { minHeight: 28, justifyContent: 'center', borderRadius: 999, paddingHorizontal: 11 },
  statusBadge: { minHeight: 28, justifyContent: 'center', borderWidth: 1, borderRadius: 999, paddingHorizontal: 11 },
  title: { fontWeight: '800' },
  description: { lineHeight: 24 },
  quickMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  closedCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, marginHorizontal: 16, padding: 14 },
  sectionCard: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 16, gap: 14 },
  sectionTitle: { fontWeight: '800' },
  detailsGrid: { gap: 13 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailCopy: { flex: 1, gap: 2 },
  detailValue: { fontWeight: '600' },
  authorRipple: { borderRadius: 18, marginHorizontal: 16 },
  authorCard: { marginHorizontal: 0, flexDirection: 'row', alignItems: 'center' },
  authorCopy: { flex: 1, gap: 3 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  safetyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 18, marginHorizontal: 16, padding: 16 },
  safetyCopy: { flex: 1, gap: 4 },
  secondaryActions: { gap: 8, marginHorizontal: 16 },
  ownerActions: { gap: 9 },
  footerActions: { flexDirection: 'row', gap: 10 },
  footerAction: { flex: 1 },
  missingContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
  imageDialog: { width: '96%', maxWidth: 900, alignSelf: 'center', overflow: 'hidden', backgroundColor: '#111111' },
  imageDialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingLeft: 18 },
  fullImage: { width: '100%', height: 560, maxHeight: '75%' },
  reportDialog: { width: '94%', maxWidth: 560, alignSelf: 'center' },
  reportScrollArea: { paddingHorizontal: 0, maxHeight: 470 },
  reportContent: { gap: 12, paddingHorizontal: 20, paddingBottom: 12 },
  reasonRow: { borderRadius: 10 },
  reasonInner: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  interestedList: { gap: 10 },
  interestedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
