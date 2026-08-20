import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge, Button, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav, AuthorAvatar, CategoryChip, SkeletonPostCard } from '@/components';
import { type AppAuthor } from '@/data/authors';
import { type MessageThread } from '@/data/messages';
import { formatRelativeDate } from '@/utils/date';
import { fuzzyIncludes } from '@/utils/text';
import { useAppData } from '@/state/app-data-context';

function buildFallbackAuthor(thread: MessageThread): AppAuthor | undefined {
  if (!thread.participantName) return undefined;
  const initials = thread.participantName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'NA';

  return {
    id: thread.participantId,
    name: thread.participantName,
    initials,
    accountType: 'person',
    bio: '',
    location: 'Neuquén',
    memberSince: new Date().toISOString(),
    completedExchanges: 0,
    verified: false,
    identityConfirmed: false,
    verificationStatus: 'not-requested',
    rating: 0,
    reviewCount: 0,
    reviews: [],
    imageUri: thread.participantAvatarUrl,
  };
}

function ThreadItem({ thread, onPress }: { thread: MessageThread; onPress: () => void }) {
  const theme = useTheme();
  const { authors, posts } = useAppData();
  const participant = authors.find(author => author.id === thread.participantId) ?? buildFallbackAuthor(thread);
  const post = posts.find(item => item.id === thread.postId);

  return (
    <TouchableRipple borderless onPress={onPress} accessibilityRole="button" accessibilityLabel={`Conversación con ${participant?.name ?? 'contacto'} sobre ${post?.title ?? 'una publicación'}. ${thread.unreadCount} mensajes sin leer.`} style={styles.threadRipple}>
      <Surface elevation={0} style={[styles.threadCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.avatarWrap}>
          <AuthorAvatar author={participant} size={58} />
          {participant?.verified ? <View style={[styles.verifiedDot, { backgroundColor: theme.colors.surface }]}><MaterialCommunityIcons name="check-decagram" size={17} color={theme.colors.primary} /></View> : null}
        </View>
        <View style={styles.threadBody}>
          <View style={styles.threadTopRow}>
            <View style={styles.participantRow}>
              <MaterialCommunityIcons name={participant?.accountType === 'organization' ? 'office-building-outline' : 'account-outline'} size={15} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleSmall" numberOfLines={1} style={[styles.threadTitle, { color: theme.colors.onSurface, fontWeight: thread.unreadCount ? '800' : '700' }]}>{participant?.name ?? 'Contacto'}</Text>
            </View>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatRelativeDate(thread.updatedAt)}</Text>
          </View>
          <Text variant="labelMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{post?.title ?? 'Publicación no disponible'}</Text>
          <Text variant="bodyMedium" numberOfLines={1} style={{ color: thread.unreadCount ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>{thread.preview}</Text>
          <View style={styles.threadMeta}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{thread.exchangeStatus === 'coordinating' ? 'Coordinando' : thread.exchangeStatus === 'reserved' ? 'Intercambio reservado' : 'Intercambio completado'}</Text>
            {thread.blocked ? <Text variant="labelSmall" style={{ color: theme.colors.error }}>Contacto bloqueado</Text> : null}
          </View>
        </View>
        {thread.unreadCount ? <Badge size={22} style={{ backgroundColor: theme.colors.primary }}>{thread.unreadCount}</Badge> : <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
      </Surface>
    </TouchableRipple>
  );
}

export function MessagesByPostView() {
  const router = useRouter();
  const theme = useTheme();
  const { threads, authors, posts, isHydrating, currentUserId } = useAppData();
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const currentAuthor = authors.find(author => author.id === currentUserId);
  const unreadCount = threads.reduce((total, thread) => total + thread.unreadCount, 0);

  const visibleThreads = useMemo(() => threads
    .filter(thread => thread.archived === showArchived)
    .filter(thread => {
      const participant = authors.find(author => author.id === thread.participantId);
      const post = posts.find(item => item.id === thread.postId);
      return fuzzyIncludes(`${participant?.name ?? ''} ${post?.title ?? ''} ${thread.preview}`, query);
    })
    .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()), [authors, posts, query, showArchived, threads]);

  const navItems = [
    { key: 'home', label: 'Inicio', icon: 'home-outline' as const },
    { key: 'publish', label: 'Publicar', icon: 'plus-circle-outline' as const },
    { key: 'messages', label: 'Mensajes', icon: 'chat-outline' as const, badge: unreadCount > 0 },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerFrame}><View style={styles.header}>
        <View style={styles.brandWrap}><Surface style={[styles.brandIcon, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}><MaterialCommunityIcons name="hand-heart" size={22} color={theme.colors.primary} /></Surface><Text variant="titleLarge" style={[styles.brand, { color: theme.colors.onSurface }]}>Nexo Solidario</Text></View>
        <TouchableRipple borderless style={styles.profileButton} onPress={() => router.push('/personal-data')} accessibilityLabel="Abrir mi perfil"><AuthorAvatar author={currentAuthor} size={42} fallbackLabel="MG" /></TouchableRipple>
      </View></View>

      <FlatList
        data={isHydrating ? [] : visibleThreads}
        keyExtractor={thread => thread.id}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.listHeader}>
          <View style={styles.titleRow}><View style={{ flex: 1 }}><Text variant="headlineSmall" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>Mensajes</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</Text></View><Button compact icon="archive-outline" onPress={() => setShowArchived(current => !current)}>{showArchived ? 'Ver activas' : 'Archivadas'}</Button></View>
          <TextInput mode="outlined" placeholder="Buscar conversaciones" value={query} onChangeText={setQuery} outlineColor={theme.colors.outlineVariant} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="magnify" />} right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined} style={[styles.searchInput, { backgroundColor: theme.colors.surface }]} />
          <View style={styles.filterRow}><CategoryChip label="Activas" selected={!showArchived} onPress={() => setShowArchived(false)} /><CategoryChip label="Archivadas" selected={showArchived} onPress={() => setShowArchived(true)} /></View>
          {isHydrating ? <><SkeletonPostCard /><SkeletonPostCard /></> : null}
        </View>}
        renderItem={({ item }) => <ThreadItem thread={item} onPress={() => router.push({ pathname: '/conversation/[threadId]', params: { threadId: item.id } })} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={!isHydrating ? <View style={styles.emptyState}><MaterialCommunityIcons name={showArchived ? 'archive-outline' : 'message-text-outline'} size={46} color={theme.colors.onSurfaceVariant} /><Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{showArchived ? 'No hay conversaciones archivadas' : 'No encontramos conversaciones'}</Text><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>Las conversaciones que abras desde una publicación aparecerán acá.</Text></View> : null}
      />

      <AppBottomNav items={navItems} activeKey="messages" onChange={key => { if (key === 'home') router.push('/dashboard'); if (key === 'publish') router.push('/create-post'); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerFrame: { paddingHorizontal: 16 },
  header: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  brand: { fontWeight: '800' },
  profileButton: { borderRadius: 999 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 22 },
  listHeader: { gap: 14, paddingTop: 6, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  pageTitle: { fontWeight: '800' },
  searchInput: {},
  filterRow: { flexDirection: 'row', gap: 8 },
  threadRipple: { borderRadius: 17 },
  threadCard: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 17, padding: 12 },
  avatarWrap: { width: 58, height: 58 },
  verifiedDot: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  threadBody: { flex: 1, minWidth: 0, gap: 4 },
  threadTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  participantRow: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  threadTitle: { flex: 1 },
  threadMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  separator: { height: 10 },
  emptyState: { alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 48 },
});
