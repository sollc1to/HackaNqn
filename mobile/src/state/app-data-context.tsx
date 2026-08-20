import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { appAuthors, currentUserId, type AppAuthor, type UserReview } from '@/data/authors';
import {
  messageThreads,
  type ChatMessage,
  type MessageAttachment,
  type MessageThread,
} from '@/data/messages';
import {
  appPosts,
  type AppPost,
  type ArticleCondition,
  type DeliveryMethod,
  type PostCategory,
  type PostKind,
  type PostStatus,
} from '@/data/posts';
import { fetchBackendPosts, mergeAuthorsWithPosts, normalizeBackendPost } from '@/lib/backend-api';
import { clearStoredAuthSession } from '@/lib/auth-storage';

export type SearchRadius = 2 | 5 | 10 | 20;
export type SearchViewMode = 'list' | 'map';
export type SearchFilters = {
  query: string;
  category: 'all' | PostCategory;
  kind: 'all' | PostKind;
  radiusKm: SearchRadius;
  locality: 'all' | AppPost['location']['locality'];
  neighborhood: string;
  status: 'all' | Exclude<PostStatus, 'paused'>;
  condition: 'all' | ArticleCondition;
  delivery: 'all' | DeliveryMethod;
  sort: 'recent' | 'distance';
  viewMode: SearchViewMode;
  center: { label: string; latitude: number; longitude: number };
};

export type PostDraft = Partial<
  Pick<
    AppPost,
    | 'title'
    | 'kind'
    | 'category'
    | 'description'
    | 'images'
    | 'location'
    | 'quantity'
    | 'quantityUnit'
    | 'condition'
    | 'delivery'
    | 'availability'
    | 'deadline'
    | 'meetingPoint'
  >
>;

export type AppReport = {
  id: string;
  targetType: 'post' | 'user' | 'conversation';
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
  status: 'received';
};

export type UserPreferences = {
  notifications: boolean;
  messageNotifications: boolean;
  showApproximateLocation: boolean;
  allowReviews: boolean;
};

const defaultSearchFilters: SearchFilters = {
  query: '',
  category: 'all',
  kind: 'all',
  radiusKm: 20,
  locality: 'all',
  neighborhood: 'all',
  status: 'available',
  condition: 'all',
  delivery: 'all',
  sort: 'recent',
  viewMode: 'list',
  center: { label: 'Centro de Neuquén', latitude: -38.9516, longitude: -68.0591 },
};

const defaultPreferences: UserPreferences = {
  notifications: true,
  messageNotifications: true,
  showApproximateLocation: true,
  allowReviews: true,
};

type PersistedState = {
  posts: AppPost[];
  savedPostIds: string[];
  threads: MessageThread[];
  authors: AppAuthor[];
  reports: AppReport[];
  searchFilters: SearchFilters;
  searchHistory: string[];
  postDraft?: PostDraft;
  preferences: UserPreferences;
};

type AppDataContextValue = {
  posts: AppPost[];
  authors: AppAuthor[];
  threads: MessageThread[];
  reports: AppReport[];
  savedPostIds: string[];
  savedPosts: AppPost[];
  searchFilters: SearchFilters;
  searchHistory: string[];
  postDraft?: PostDraft;
  preferences: UserPreferences;
  isHydrating: boolean;
  dataError: string;
  sessionActive: boolean;
  addPost: (post: AppPost) => void;
  updatePost: (postId: string, updates: Partial<AppPost>) => void;
  deletePost: (postId: string) => void;
  toggleSavedPost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  showInterest: (postId: string) => void;
  report: (report: Omit<AppReport, 'id' | 'createdAt' | 'status'>) => void;
  markThreadRead: (threadId: string) => void;
  ensureThreadForPost: (post: AppPost) => string;
  sendMessage: (threadId: string, text: string, attachment?: MessageAttachment) => void;
  archiveThread: (threadId: string) => void;
  blockThread: (threadId: string) => void;
  updateSearchFilters: (updates: Partial<SearchFilters>) => void;
  clearSearchFilters: () => void;
  rememberSearch: (query: string) => void;
  clearSearchHistory: () => void;
  savePostDraft: (draft?: PostDraft) => void;
  updateProfile: (updates: Partial<AppAuthor>) => void;
  addReview: (authorId: string, rating: number, comment: string) => void;
  requestVerification: () => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  signOut: () => void;
  deleteAccount: () => void;
  retryData: () => void;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);
const storageKey = 'nexo-solidario-v2';

function getBrowserStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return undefined;
  return globalThis.localStorage;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState(appPosts);
  const [authors, setAuthors] = useState(appAuthors);
  const [threads, setThreads] = useState(messageThreads);
  const [reports, setReports] = useState<AppReport[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState(defaultSearchFilters);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [postDraft, setPostDraft] = useState<PostDraft>();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isHydrating, setIsHydrating] = useState(true);
  const [dataError, setDataError] = useState('');
  const [sessionActive, setSessionActive] = useState(true);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      setIsHydrating(true);
      setDataError('');
      let persistedState: Partial<PersistedState> | undefined;
      const hasPersistedPosts = (saved: Partial<PersistedState> | undefined) => Boolean(saved?.posts?.length);
      try {
        const raw = getBrowserStorage()?.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<PersistedState>;
          persistedState = saved;
          if (!active) return;
          if (saved.posts) setPosts(saved.posts);
          if (saved.savedPostIds) setSavedPostIds(saved.savedPostIds);
          if (saved.threads) setThreads(saved.threads);
          if (saved.authors) setAuthors(saved.authors);
          if (saved.reports) setReports(saved.reports);
          if (saved.searchFilters) setSearchFilters(saved.searchFilters);
          if (saved.searchHistory) setSearchHistory(saved.searchHistory);
          if (saved.postDraft) setPostDraft(saved.postDraft);
          if (saved.preferences) setPreferences(saved.preferences);
        }
      } catch {
        setDataError('No pudimos recuperar los datos guardados en este dispositivo.');
      } finally {
        const shouldUseRemotePosts = !hasPersistedPosts(persistedState);

        try {
          const remotePosts = await fetchBackendPosts();

          if (!active) return;

          if (remotePosts.length > 0) {
            const normalizedPosts = remotePosts.map(normalizeBackendPost);
            setPosts(normalizedPosts);
            setAuthors(mergeAuthorsWithPosts(persistedState?.authors ?? appAuthors, normalizedPosts));
            setDataError('');
          } else if (shouldUseRemotePosts) {
            setPosts(appPosts);
            setAuthors(mergeAuthorsWithPosts(persistedState?.authors ?? appAuthors, appPosts));
          }
        } catch {
          if (!active) return;

          if (shouldUseRemotePosts) {
            setPosts(appPosts);
            setAuthors(mergeAuthorsWithPosts(persistedState?.authors ?? appAuthors, appPosts));
            setDataError('No pudimos conectar con el backend. Se muestran los datos de demostración.');
          } else {
            setDataError('No pudimos conectar con el backend, pero conservamos tus datos guardados.');
          }
        } finally {
          setTimeout(() => active && setIsHydrating(false), 220);
        }
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, [retryToken]);

  useEffect(() => {
    if (isHydrating) return;
    try {
      const payload: PersistedState = {
        posts,
        savedPostIds,
        threads,
        authors,
        reports,
        searchFilters,
        searchHistory,
        postDraft,
        preferences,
      };
      getBrowserStorage()?.setItem(storageKey, JSON.stringify(payload));
    } catch {
      setDataError('Los cambios están visibles, pero no se pudieron guardar en este dispositivo.');
    }
  }, [authors, isHydrating, postDraft, posts, preferences, reports, savedPostIds, searchFilters, searchHistory, threads]);

  const savedPosts = useMemo(
    () => savedPostIds.map(id => posts.find(post => post.id === id)).filter((post): post is AppPost => Boolean(post)),
    [posts, savedPostIds],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      posts,
      authors,
      threads,
      reports,
      savedPostIds,
      savedPosts,
      searchFilters,
      searchHistory,
      postDraft,
      preferences,
      isHydrating,
      dataError,
      sessionActive,
      addPost: post => setPosts(current => [post, ...current]),
      updatePost: (postId, updates) =>
        setPosts(current =>
          current.map(post => (post.id === postId ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post)),
        ),
      deletePost: postId => {
        setPosts(current => current.filter(post => post.id !== postId));
        setSavedPostIds(current => current.filter(id => id !== postId));
      },
      toggleSavedPost: postId =>
        setSavedPostIds(current => (current.includes(postId) ? current.filter(id => id !== postId) : [postId, ...current])),
      isPostSaved: postId => savedPostIds.includes(postId),
      showInterest: postId =>
        setPosts(current =>
          current.map(post => {
            if (post.id !== postId || post.interestedUserIds.includes(currentUserId)) return post;
            return { ...post, interestedUserIds: [...post.interestedUserIds, currentUserId] };
          }),
        ),
      report: reportInput =>
        setReports(current => [
          ...current,
          {
            ...reportInput,
            id: `report-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'received',
          },
        ]),
      markThreadRead: threadId =>
        setThreads(current => {
          const target = current.find(thread => thread.id === threadId);
          if (!target || target.unreadCount === 0) return current;
          return current.map(thread => (thread.id === threadId ? { ...thread, unreadCount: 0 } : thread));
        }),
      ensureThreadForPost: post => {
        const existing = threads.find(thread => thread.postId === post.id);
        if (existing) return existing.id;
        const id = post.id;
        setThreads(current => [
          {
            id,
            postId: post.id,
            participantId: post.authorId,
            preview: 'Nueva conversación',
            updatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            unreadCount: 0,
            archived: false,
            blocked: false,
            reported: false,
            exchangeStatus: 'coordinating',
            messages: [],
          },
          ...current,
        ]);
        return id;
      },
      sendMessage: (threadId, text, attachment) => {
        const now = new Date().toISOString();
        const message: ChatMessage = {
          id: `message-${Date.now()}`,
          sender: 'me',
          text,
          createdAt: now,
          status: 'sent',
          attachment,
        };
        setThreads(current =>
          current.map(thread =>
            thread.id === threadId
              ? { ...thread, preview: text || 'Adjunto', updatedAt: now, messages: [...thread.messages, message] }
              : thread,
          ),
        );
        setTimeout(() => {
          setThreads(current =>
            current.map(thread =>
              thread.id === threadId
                ? {
                    ...thread,
                    messages: thread.messages.map(item =>
                      item.id === message.id ? { ...item, status: 'delivered' as const } : item,
                    ),
                  }
                : thread,
            ),
          );
        }, 450);
        setTimeout(() => {
          setThreads(current =>
            current.map(thread => {
              if (thread.id !== threadId || thread.blocked) return thread;
              const replyOptions = [
                '¡Hola! Sí, podemos coordinar por acá. ¿Qué día y horario te queda cómodo?',
                'Perfecto, gracias por escribir. Decime cuándo podrías acercarte y coordinamos.',
                '¡Buenísimo! Sigue disponible. Podemos acordar el punto de encuentro por acá.',
              ];
              const replyText = replyOptions[thread.messages.length % replyOptions.length];
              const reply: ChatMessage = {
                id: `reply-${Date.now()}`,
                sender: 'them',
                text: replyText,
                createdAt: new Date().toISOString(),
                status: 'read',
              };
              return {
                ...thread,
                preview: reply.text,
                updatedAt: reply.createdAt,
                messages: [
                  ...thread.messages.map(item =>
                    item.id === message.id ? { ...item, status: 'read' as const } : item,
                  ),
                  reply,
                ],
              };
            }),
          );
        }, 1100);
      },
      archiveThread: threadId =>
        setThreads(current => current.map(thread => (thread.id === threadId ? { ...thread, archived: !thread.archived } : thread))),
      blockThread: threadId =>
        setThreads(current => current.map(thread => (thread.id === threadId ? { ...thread, blocked: !thread.blocked } : thread))),
      updateSearchFilters: updates => setSearchFilters(current => ({ ...current, ...updates })),
      clearSearchFilters: () => setSearchFilters(defaultSearchFilters),
      rememberSearch: query => {
        const normalized = query.trim();
        if (!normalized) return;
        setSearchHistory(current => [normalized, ...current.filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6));
      },
      clearSearchHistory: () => setSearchHistory([]),
      savePostDraft: draft => setPostDraft(draft),
      updateProfile: updates =>
        setAuthors(current => current.map(author => (author.id === currentUserId ? { ...author, ...updates } : author))),
      addReview: (authorId, rating, comment) => {
        const review: UserReview = {
          id: `review-${Date.now()}`,
          authorName: 'María G.',
          rating,
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
        };
        setAuthors(current =>
          current.map(author => {
            if (author.id !== authorId) return author;
            const reviewCount = author.reviewCount + 1;
            const average = (author.rating * author.reviewCount + rating) / reviewCount;
            return { ...author, rating: Math.round(average * 10) / 10, reviewCount, reviews: [review, ...author.reviews] };
          }),
        );
      },
      requestVerification: () =>
        setAuthors(current =>
          current.map(author =>
            author.id === currentUserId ? { ...author, verificationStatus: 'pending' as const } : author,
          ),
        ),
      updatePreferences: updates => setPreferences(current => ({ ...current, ...updates })),
      signOut: () => {
        clearStoredAuthSession();
        setSessionActive(false);
      },
      deleteAccount: () => {
        clearStoredAuthSession();
        setPosts(current => current.filter(post => post.ownerId !== 'current-user'));
        setSessionActive(false);
      },
      retryData: () => setRetryToken(current => current + 1),
    }),
    [
      authors,
      dataError,
      isHydrating,
      postDraft,
      posts,
      preferences,
      reports,
      savedPostIds,
      savedPosts,
      searchFilters,
      searchHistory,
      sessionActive,
      threads,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return context;
}
