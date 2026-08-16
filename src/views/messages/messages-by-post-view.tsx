import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Badge, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav } from '@/components';
import { messageThreads, type MessageThread } from '@/data/messages';
import { currentUser } from '@/data/profile';

const navItems = [
  { key: 'home', label: 'Inicio', icon: 'home-outline' as const },
  { key: 'publish', label: 'Publicar', icon: 'plus-circle-outline' as const },
  { key: 'messages', label: 'Mensajes', icon: 'chat-outline' as const, badge: true },
];

function ThreadItem({ thread, onPress }: { thread: MessageThread; onPress: () => void }) {
  const theme = useTheme();

  return (
    <TouchableRipple borderless onPress={onPress} style={styles.threadRipple}>
      <Surface
        elevation={0}
        style={[
          styles.threadCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
        ]}>
        <View style={styles.avatarWrap}>
          <Avatar.Image size={58} source={{ uri: thread.participantImageUri }} />
          {thread.verified ? (
            <View style={[styles.verifiedDot, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="check-decagram" size={17} color={theme.colors.primary} />
            </View>
          ) : null}
        </View>

        <View style={styles.threadBody}>
          <View style={styles.threadTopRow}>
            <Text
              variant="titleSmall"
              numberOfLines={1}
              style={[
                styles.threadTitle,
                { color: theme.colors.onSurface, fontWeight: thread.unreadCount ? '800' : '700' },
              ]}>
              {thread.participant}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {thread.timeLabel}
            </Text>
          </View>

          <Text variant="labelMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {thread.title}
          </Text>
          <Text
            variant="bodyMedium"
            numberOfLines={1}
            style={{ color: thread.unreadCount ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
            {thread.preview}
          </Text>
        </View>

        {thread.unreadCount ? (
          <Badge size={22} style={{ backgroundColor: theme.colors.primary }}>
            {thread.unreadCount}
          </Badge>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
        )}
      </Surface>
    </TouchableRipple>
  );
}

export function MessagesByPostView() {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const visibleThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return messageThreads.filter(thread =>
      `${thread.title} ${thread.participant} ${thread.preview} ${thread.location}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.brandWrap}>
          <Surface style={[styles.brandIcon, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
            <MaterialCommunityIcons name="hand-heart" size={22} color={theme.colors.primary} />
          </Surface>
          <Text variant="titleLarge" style={[styles.brand, { color: theme.colors.onSurface }]}>
            Nexo Solidario
          </Text>
        </View>
        <TouchableRipple borderless style={styles.profileButton} onPress={() => router.push('/personal-data')}>
          <Avatar.Image size={42} source={{ uri: currentUser.imageUri }} />
        </TouchableRipple>
      </View>

      <FlatList
        data={visibleThreads}
        keyExtractor={thread => thread.id}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text variant="headlineSmall" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
              Mensajes
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Buscar conversaciones"
              value={query}
              onChangeText={setQuery}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="magnify" />}
              right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
              style={styles.searchInput}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ThreadItem
            thread={item}
            onPress={() =>
              router.push({ pathname: '/conversation/[threadId]', params: { threadId: item.id } })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-text-outline" size={46} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              No encontramos conversaciones
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Revisá el texto de búsqueda o volvé a ver todos los mensajes.
            </Text>
          </View>
        }
      />

      <AppBottomNav
        items={navItems}
        activeKey="messages"
        onChange={key => {
          if (key === 'home') router.push('/dashboard');
          if (key === 'publish') router.push('/create-post');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: '800',
  },
  profileButton: {
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  listHeader: {
    gap: 14,
    paddingTop: 6,
    paddingBottom: 16,
  },
  pageTitle: {
    fontWeight: '800',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  threadRipple: {
    borderRadius: 17,
  },
  threadCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
  },
  avatarWrap: {
    width: 58,
    height: 58,
  },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadTitle: {
    flex: 1,
  },
  separator: {
    height: 10,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
});
