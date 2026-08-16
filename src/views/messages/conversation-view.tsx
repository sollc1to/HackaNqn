import { useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, IconButton, Portal, Snackbar, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ChatMessage, getMessageThread } from '@/data/messages';
import { useAppData } from '@/state/app-data-context';

export function ConversationView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ threadId?: string | string[] }>();
  const { posts } = useAppData();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId;
  const thread = threadId ? getMessageThread(threadId) : undefined;
  const post = posts.find(item => item.id === (thread?.postId ?? threadId));
  const [messages, setMessages] = useState<ChatMessage[]>(
    thread?.messages ?? [
      {
        id: 'welcome',
        sender: 'them',
        text: 'Hola, gracias por comunicarte por esta publicación. ¿Cómo podemos coordinar?',
        time: 'Ahora',
      },
    ],
  );
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState('');

  const participant = useMemo(
    () => ({
      name: thread?.participant ?? post?.author ?? 'Contacto de la publicación',
      initials: thread?.participantInitials ?? post?.authorInitials ?? 'NS',
      imageUri: thread?.participantImageUri ?? post?.authorImageUri,
      verified: thread?.verified ?? post?.verified ?? false,
      lastSeen: thread?.lastSeen ?? post?.lastActivity ?? 'Actividad reciente',
    }),
    [post, thread],
  );

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages(current => [
      ...current,
      { id: `me-${Date.now()}`, sender: 'me', text, time: 'Ahora' },
    ]);
    setDraft('');
    setFeedback('Mensaje enviado.');

    // Respuesta breve de demostración para que el flujo se pueda probar de punta a punta.
    setTimeout(() => {
      setMessages(current => [
        ...current,
        {
          id: `reply-${Date.now()}`,
          sender: 'them',
          text: '¡Gracias por escribir! Confirmamos los detalles y coordinamos por acá.',
          time: 'Ahora',
        },
      ]);
    }, 900);
  };

  if (!threadId || (!thread && !post)) {
    return (
      <SafeAreaView style={[styles.missingRoot, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="message-alert-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
          Conversación no disponible
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          La publicación pudo haber finalizado o el enlace no es válido.
        </Text>
        <IconButton icon="arrow-left" mode="contained" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}>
        <Surface elevation={0} style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          {participant.imageUri ? (
            <Avatar.Image size={42} source={{ uri: participant.imageUri }} />
          ) : (
            <Avatar.Text size={42} label={participant.initials} />
          )}
          <View style={styles.headerCopy}>
            <View style={styles.nameRow}>
              <Text variant="titleSmall" numberOfLines={1} style={[styles.name, { color: theme.colors.onSurface }]}>
                {participant.name}
              </Text>
              {participant.verified ? (
                <MaterialCommunityIcons name="check-decagram" size={17} color={theme.colors.primary} />
              ) : null}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {participant.lastSeen}
            </Text>
          </View>
        </Surface>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={message => message.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            post ? (
              <Surface
                elevation={0}
                style={[
                  styles.postContext,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
                ]}>
                <Image source={{ uri: post.imageUri }} style={styles.postImage} contentFit="cover" />
                <View style={styles.postCopy}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Conversación sobre
                  </Text>
                  <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    {post.title}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                    {post.location}
                  </Text>
                </View>
              </Surface>
            ) : null
          }
          renderItem={({ item }) => {
            const mine = item.sender === 'me';
            return (
              <View style={[styles.messageRow, mine ? styles.myMessageRow : styles.theirMessageRow]}>
                <View
                  style={[
                    styles.bubble,
                    mine
                      ? { backgroundColor: theme.colors.primary }
                      : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
                  ]}>
                  <Text variant="bodyMedium" style={{ color: mine ? theme.colors.onPrimary : theme.colors.onSurface }}>
                    {item.text}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={[styles.time, { color: mine ? '#EAF4E8' : theme.colors.onSurfaceVariant }]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
        />

        <Surface elevation={2} style={[styles.composer, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            mode="outlined"
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribí un mensaje"
            multiline
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={styles.composerInput}
            onSubmitEditing={sendMessage}
          />
          <IconButton
            icon="send"
            mode="contained"
            disabled={!draft.trim()}
            onPress={sendMessage}
            accessibilityLabel="Enviar mensaje"
          />
        </Surface>
      </KeyboardAvoidingView>

      <Portal>
        <Snackbar visible={feedback.length > 0} onDismiss={() => setFeedback('')} duration={1800}>
          {feedback}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#859180',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    flexShrink: 1,
    fontWeight: '800',
  },
  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },
  postContext: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 22,
  },
  postImage: {
    width: 76,
    minHeight: 82,
    backgroundColor: '#EEF5EC',
  },
  postCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    padding: 10,
  },
  messageRow: {
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    gap: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  time: {
    alignSelf: 'flex-end',
  },
  messageSeparator: {
    height: 9,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#859180',
  },
  composerInput: {
    flex: 1,
    maxHeight: 112,
    backgroundColor: '#FFFFFF',
  },
  missingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
});
