import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Dialog,
  IconButton,
  Menu,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthorAvatar, LocationPicker, SmartImage } from '@/components';
import { type ChatMessage, type MessageAttachment } from '@/data/messages';
import { getPostImageSource, postStatusLabel, type PostLocation } from '@/data/posts';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAppData } from '@/state/app-data-context';
import { formatConversationDay, formatTime, sameCalendarDay } from '@/utils/date';
import { getPickImageErrorMessage, pickImages } from '@/utils/pick-image';

const statusIcon = { sent: 'check', delivered: 'check-all', read: 'check-all' } as const;

export function ConversationView() {
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const params = useLocalSearchParams<{ threadId?: string | string[] }>();
  const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId;
  const {
    threads,
    posts,
    authors,
    markThreadRead,
    sendMessage,
    archiveThread,
    blockThread,
    report,
  } = useAppData();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const thread = threads.find(candidate => candidate.id === threadId);
  const post = posts.find(item => item.id === thread?.postId);
  const participant = authors.find(author => author.id === thread?.participantId);
  const [draft, setDraft] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (threadId) markThreadRead(threadId);
  }, [markThreadRead, threadId]);

  const closed = !post || post.status === 'completed' || post.status === 'paused' || thread?.blocked;
  const messages = thread?.messages ?? [];

  const headerStatus = useMemo(() => {
    if (thread?.blocked) return 'Contacto bloqueado';
    if (post?.status === 'completed') return 'Publicación completada';
    if (thread?.exchangeStatus === 'reserved') return 'Intercambio reservado';
    return 'Coordinando intercambio';
  }, [post?.status, thread?.blocked, thread?.exchangeStatus]);

  const submitMessage = () => {
    const text = draft.trim();
    if ((!text && !pendingAttachment) || !threadId || closed) return;
    sendMessage(threadId, text || (pendingAttachment?.type === 'image' ? 'Imagen adjunta' : 'Ubicación aproximada adjunta'), pendingAttachment);
    setDraft('');
    setPendingAttachment(undefined);
    setFeedback('Mensaje enviado.');
  };

  const attachImage = async (source: 'camera' | 'library') => {
    setAttachOpen(false);
    try {
      const images = await pickImages(source, false);
      if (images[0]) setPendingAttachment({ type: 'image', uri: images[0].uri });
    } catch (error) {
      setFeedback(getPickImageErrorMessage(error));
    }
  };

  if (!threadId || !thread || !post) {
    return (
      <SafeAreaView style={[styles.missingRoot, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="message-alert-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Conversación no disponible</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>La publicación pudo haber sido eliminada o el enlace no es válido.</Text>
        <Button mode="contained" icon="arrow-left" onPress={() => router.back()}>Volver</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <Surface elevation={0} style={[styles.headerFrame, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Volver" />
            <AuthorAvatar author={participant} size={42} />
            <View style={styles.headerCopy}>
              <View style={styles.nameRow}>
                <Text variant="titleSmall" numberOfLines={1} style={[styles.name, { color: theme.colors.onSurface }]}>{participant?.name ?? 'Contacto'}</Text>
                {participant?.verified ? <MaterialCommunityIcons name="check-decagram" size={17} color={theme.colors.primary} /> : null}
              </View>
              <Text variant="bodySmall" style={{ color: closed ? theme.colors.error : theme.colors.onSurfaceVariant }}>{headerStatus}</Text>
            </View>
            <Menu
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={<IconButton icon="dots-vertical" onPress={() => setMenuOpen(true)} accessibilityLabel="Opciones de conversación" />}>
              <Menu.Item leadingIcon="account-outline" title="Ver perfil" onPress={() => { setMenuOpen(false); router.push({ pathname: '/profile/[authorId]', params: { authorId: participant?.id ?? thread.participantId } }); }} />
              <Menu.Item leadingIcon="archive-outline" title={thread.archived ? 'Desarchivar' : 'Archivar'} onPress={() => { archiveThread(thread.id); setMenuOpen(false); setFeedback(thread.archived ? 'Conversación desarchivada.' : 'Conversación archivada.'); }} />
              <Menu.Item leadingIcon={thread.blocked ? 'account-check-outline' : 'account-cancel-outline'} title={thread.blocked ? 'Desbloquear' : 'Bloquear contacto'} onPress={() => { blockThread(thread.id); setMenuOpen(false); }} />
              <Menu.Item leadingIcon="flag-outline" title="Reportar contacto" onPress={() => { setMenuOpen(false); setReportOpen(true); }} />
            </Menu>
          </View>
        </Surface>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={message => message.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: !reducedMotion })}
          ListHeaderComponent={
            <View style={styles.conversationHeader}>
              <Surface elevation={0} style={[styles.postContext, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <SmartImage source={getPostImageSource(post.images[0])} style={styles.postImage} contentFit="cover" accessibilityLabel={post.images[0]?.alt} />
                <View style={styles.postCopy}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Conversación sobre</Text>
                  <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface, fontWeight: '700' }}>{post.title}</Text>
                  <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{postStatusLabel[post.status]} · {post.location.label}</Text>
                </View>
              </Surface>
            </View>
          }
          renderItem={({ item, index }) => {
            const mine = item.sender === 'me';
            const showDay = index === 0 || !sameCalendarDay(messages[index - 1].createdAt, item.createdAt);
            return (
              <View>
                {showDay ? <View style={styles.dayRow}><Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{formatConversationDay(item.createdAt)}</Text></View> : null}
                <View style={[styles.messageRow, mine ? styles.myMessageRow : styles.theirMessageRow]}>
                  <View style={[styles.bubble, mine ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                    {item.attachment?.type === 'image' ? <SmartImage source={{ uri: item.attachment.uri }} style={styles.messageImage} contentFit="cover" accessibilityLabel="Imagen adjunta" /> : null}
                    {item.attachment?.type === 'location' ? <Surface elevation={0} style={[styles.locationAttachment, { backgroundColor: mine ? 'rgba(255,255,255,0.15)' : theme.colors.surfaceVariant }]}><MaterialCommunityIcons name="map-marker-outline" size={22} color={mine ? theme.colors.onPrimary : theme.colors.primary} /><Text variant="bodySmall" style={{ color: mine ? theme.colors.onPrimary : theme.colors.onSurface, flex: 1 }}>{item.attachment.label}</Text></Surface> : null}
                    {item.text ? <Text variant="bodyMedium" style={{ color: mine ? theme.colors.onPrimary : theme.colors.onSurface }}>{item.text}</Text> : null}
                    <View style={styles.messageMeta}>
                      <Text variant="labelSmall" style={{ color: mine ? '#EAF4E8' : theme.colors.onSurfaceVariant }}>{formatTime(item.createdAt)}</Text>
                      {mine ? <MaterialCommunityIcons name={statusIcon[item.status]} size={15} color={item.status === 'read' ? '#CDEBFF' : '#EAF4E8'} accessibilityLabel={item.status === 'sent' ? 'Enviado' : item.status === 'delivered' ? 'Entregado' : 'Leído'} /> : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
          ListEmptyComponent={<View style={styles.emptyMessages}><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>Todavía no hay mensajes. Escribí para empezar a coordinar.</Text></View>}
        />

        {closed ? (
          <Surface elevation={2} style={[styles.closedComposer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name={thread.blocked ? 'account-cancel-outline' : 'message-lock-outline'} size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>{thread.blocked ? 'Desbloqueá el contacto para volver a escribir.' : 'No se puede contactar una publicación completada o pausada.'}</Text>
          </Surface>
        ) : (
          <Surface elevation={2} style={[styles.composerFrame, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.composer}>
              {pendingAttachment ? (
                <Surface elevation={0} style={[styles.pendingAttachment, { backgroundColor: theme.colors.surfaceVariant }]}>
                  {pendingAttachment.type === 'image' ? <SmartImage source={{ uri: pendingAttachment.uri }} style={styles.pendingImage} contentFit="cover" /> : <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />}
                  <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>{pendingAttachment.type === 'image' ? 'Imagen lista para enviar' : pendingAttachment.label}</Text>
                  <IconButton icon="close" size={17} onPress={() => setPendingAttachment(undefined)} accessibilityLabel="Quitar adjunto" />
                </Surface>
              ) : null}
              <View style={styles.composerRow}>
                <IconButton icon="plus" onPress={() => setAttachOpen(true)} accessibilityLabel="Adjuntar imagen o ubicación" />
                <TextInput
                  mode="outlined"
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Escribí un mensaje"
                  multiline
                  outlineColor={theme.colors.outlineVariant}
                  activeOutlineColor={theme.colors.primary}
                  style={[styles.composerInput, { backgroundColor: theme.colors.surface }]}
                  accessibilityLabel="Mensaje"
                />
                <IconButton icon="send" mode="contained" disabled={!draft.trim() && !pendingAttachment} onPress={submitMessage} accessibilityLabel="Enviar mensaje" />
              </View>
              {feedback ? <Text accessibilityRole="alert" variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{feedback}</Text> : null}
            </View>
          </Surface>
        )}
      </KeyboardAvoidingView>

      <Portal>
        <Dialog visible={attachOpen} onDismiss={() => setAttachOpen(false)}>
          <Dialog.Title>Adjuntar</Dialog.Title>
          <Dialog.Content style={styles.attachOptions}>
            <Button mode="outlined" icon="camera-outline" onPress={() => attachImage('camera')}>Tomar foto</Button>
            <Button mode="outlined" icon="image-outline" onPress={() => attachImage('library')}>Elegir imagen</Button>
            <Button mode="outlined" icon="map-marker-outline" onPress={() => { setAttachOpen(false); setLocationOpen(true); }}>Compartir ubicación aproximada</Button>
          </Dialog.Content>
          <Dialog.Actions><Button onPress={() => setAttachOpen(false)}>Cancelar</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={locationOpen} onDismiss={() => setLocationOpen(false)} style={styles.locationDialog}>
          <Dialog.Title>Ubicación aproximada</Dialog.Title>
          <Dialog.ScrollArea><LocationDialogContent onSelect={location => { setPendingAttachment({ type: 'location', label: location.label, latitude: location.latitude, longitude: location.longitude }); setLocationOpen(false); }} /></Dialog.ScrollArea>
          <Dialog.Actions><Button onPress={() => setLocationOpen(false)}>Cancelar</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={reportOpen} onDismiss={() => setReportOpen(false)}>
          <Dialog.Title>Reportar contacto</Dialog.Title>
          <Dialog.Content><Text>El reporte quedará registrado para que moderación revise la conversación y el perfil.</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setReportOpen(false)}>Cancelar</Button><Button textColor={theme.colors.error} onPress={() => { report({ targetType: 'conversation', targetId: thread.id, reason: 'Conducta inapropiada o posible estafa' }); setReportOpen(false); setFeedback('Reporte registrado.'); }}>Enviar reporte</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

function LocationDialogContent({ onSelect }: { onSelect: (location: PostLocation) => void }) {
  const [location, setLocation] = useState<PostLocation>();
  return <View style={styles.locationContent}><LocationPicker value={location} onChange={setLocation} /><Button mode="contained" disabled={!location} onPress={() => location && onSelect(location)}>Adjuntar esta ubicación</Button></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerFrame: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#859180', paddingHorizontal: 10 },
  header: { width: '100%', maxWidth: 760, minHeight: 66, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerCopy: { flex: 1, minWidth: 0, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { flexShrink: 1, fontWeight: '800' },
  messagesContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20 },
  conversationHeader: { gap: 10, marginBottom: 18 },
  postContext: { flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderRadius: 16 },
  postImage: { width: 76, minHeight: 82, backgroundColor: '#EEF5EC' },
  postCopy: { flex: 1, justifyContent: 'center', gap: 3, padding: 10 },
  dayRow: { alignItems: 'center', paddingVertical: 12 },
  messageRow: { flexDirection: 'row' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '84%', gap: 6, borderWidth: 1, borderColor: 'transparent', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 },
  messageImage: { width: 220, maxWidth: '100%', aspectRatio: 4 / 3, borderRadius: 12 },
  locationAttachment: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 9 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  messageSeparator: { height: 8 },
  emptyMessages: { padding: 28 },
  composerFrame: { paddingHorizontal: 10, paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#859180' },
  composer: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 5 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  composerInput: { flex: 1, maxHeight: 112 },
  pendingAttachment: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingLeft: 8 },
  pendingImage: { width: 42, height: 42, borderRadius: 8 },
  closedComposer: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14 },
  attachOptions: { gap: 10 },
  locationDialog: { width: '94%', maxWidth: 620, alignSelf: 'center' },
  locationContent: { gap: 14, padding: 18 },
  missingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
});
