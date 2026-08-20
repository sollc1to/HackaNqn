import { Platform } from 'react-native';

import type { AppAuthor } from '@/data/authors';
import { type ChatMessage, type MessageThread } from '@/data/messages';
import {
  type AppPost,
  type ArticleCondition,
  type DeliveryMethod,
  type PostCategory,
  type PostImage,
  type PostKind,
  type PostLocation,
  type PostStatus,
} from '@/data/posts';

const fallbackApiBaseUrl = Platform.select({
  // En emulador Android, la app debe hablar con el host de desarrollo usando 10.0.2.2.
  // Si corrés en un dispositivo físico, seteá EXPO_PUBLIC_API_URL con la IP real de tu PC.
  android: 'http://10.0.2.2:3000',
  web: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || fallbackApiBaseUrl || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export type ApiErrorResponse = {
  msg?: string;
  errors?: Array<{ msg?: string }>;
};

export type BackendPostImage = {
  url: string;
  publicId: string;
  alt: string;
};

export type BackendPost = {
  id: string;
  title: string;
  description: string;
  kind: PostKind;
  locationApprox: string;
  status: PostStatus;
  tags: string[];
  images: BackendPostImage[];
  authorId: string;
  publishedAt: string;
  category?: PostCategory;
  condition?: ArticleCondition;
  delivery?: DeliveryMethod;
  location?: PostLocation;
  createdAt?: string;
  updatedAt?: string;
  distanceKm?: number;
};

export type BackendChatMessage = {
  senderId: string;
  text: string;
  createdAt: string;
  readBy: string[];
};

export type BackendChat = {
  id: string;
  postId: string;
  authorId: string;
  interestedUserId: string;
  participantIds: [string, string];
  messages: BackendChatMessage[];
  lastMessage?: string;
  lastMessageAt?: string;
  status: 'active' | 'closed';
  createdAt?: string;
  updatedAt?: string;
  counterpartId?: string;
  counterpartName?: string;
  counterpartAvatarUrl?: string;
  unreadCount?: number;
};

export type BackendUser = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  role: 'normal' | 'organizacion' | 'administrador';
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendAuthResponse = {
  msg: string;
  user: BackendUser;
  token: string;
};

export type BackendProfileResponse = {
  msg: string;
  user: BackendUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  address: string;
  role?: 'normal' | 'organizacion' | 'administrador';
  avatarUrl?: string;
};

export type BackendPostImageUpload = {
  uri: string;
  name?: string;
  type?: string;
};

export type CreateBackendPostInput = {
  title: string;
  description: string;
  kind: PostKind;
  locationApprox: string;
  images: BackendPostImageUpload[];
  status?: PostStatus;
  category?: PostCategory;
  condition?: ArticleCondition;
  delivery?: DeliveryMethod;
  location?: PostLocation;
  tags?: string[];
};

export type UpdateBackendPostInput = CreateBackendPostInput & {
  existingImages?: BackendPostImage[];
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

const localCoordinates = { latitude: -38.9516, longitude: -68.0591 };
const fallbackImageType = 'image/jpeg';

function inferImageFileName(uri: string, index: number) {
  const cleanedUri = uri.split('?')[0] ?? uri;
  const candidate = cleanedUri.split('/').filter(Boolean).pop() ?? '';
  if (!candidate) return `post-image-${index + 1}.jpg`;
  return candidate.includes('.') ? candidate : `${candidate}.jpg`;
}

function inferImageType(uri: string) {
  const extension = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic') return 'image/heic';
  return fallbackImageType;
}

async function appendImage(formData: FormData, image: BackendPostImageUpload, index: number) {
  const fileName = image.name?.trim() || inferImageFileName(image.uri, index);
  const mimeType = image.type?.trim() || inferImageType(image.uri);

  if (Platform.OS === 'web') {
    const response = await fetch(image.uri);
    if (!response.ok) throw new Error('No pudimos preparar una de las imágenes para subir.');
    const blob = await response.blob();
    formData.append('images', blob, fileName);
    return;
  }

  // React Native entiende el formato { uri, name, type } en multipart.
  formData.append('images', { uri: image.uri, name: fileName, type: mimeType } as any);
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function requestJson<T>(path: string, options: RequestOptions = {}, query?: Record<string, string | number | undefined>) {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');

  const response = await fetch(buildUrl(path, query), {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  });

  let payload: ApiErrorResponse | T | undefined;
  try {
    payload = (await response.json()) as ApiErrorResponse | T;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const errorMessage =
      (payload as ApiErrorResponse | undefined)?.msg ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

function inferCategory(post: BackendPost): PostCategory | undefined {
  const searchable = `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase();
  const rules: Array<[PostCategory, string[]]> = [
    ['food', ['comida', 'alimento', 'merienda', 'cocina', 'vianda']],
    ['clothes', ['ropa', 'abrigo', 'campera', 'remera', 'zapato']],
    ['health', ['salud', 'higiene', 'medic', 'sanit']],
    ['home', ['hogar', 'casa', 'limpieza']],
    ['school', ['escuela', 'útil', 'util', 'cuaderno', 'mochila', 'estudio']],
    ['furniture', ['mueble', 'silla', 'mesa', 'escritorio']],
    ['volunteering', ['voluntariado', 'acompañamiento', 'apoyo']],
  ];

  return rules.find(([, keywords]) => keywords.some(keyword => searchable.includes(keyword)))?.[0];
}

function buildFallbackLocation(post: BackendPost): PostLocation {
  return post.location ?? {
    label: post.locationApprox,
    locality: 'Neuquén capital',
    latitude: localCoordinates.latitude,
    longitude: localCoordinates.longitude,
  };
}

function buildPostImages(images: BackendPostImage[]): PostImage[] {
  return images.map((image, index) => ({
    id: image.publicId || image.url || `backend-image-${index}`,
    kind: 'uri',
    uri: image.url,
    alt: image.alt,
    publicId: image.publicId,
  }));
}

function backendStatusToExchangeStatus(status: BackendChat['status']) {
  return status === 'closed' ? 'completed' : 'coordinating';
}

function normalizeChatMessage(message: BackendChatMessage, currentUserId: string): ChatMessage {
  return {
    id: `${message.senderId}-${message.createdAt}`,
    sender: message.senderId === currentUserId ? 'me' : 'them',
    text: message.text,
    createdAt: message.createdAt,
    status: message.senderId === currentUserId ? 'read' : 'read',
  };
}

export function normalizeBackendChat(thread: BackendChat, currentUserId: string): MessageThread {
  const counterpartId = thread.counterpartId ?? (thread.authorId === currentUserId ? thread.interestedUserId : thread.authorId);
  const messages = Array.isArray(thread.messages) ? thread.messages.map(message => normalizeChatMessage(message, currentUserId)) : [];

  return {
    id: thread.id,
    postId: thread.postId,
    participantId: counterpartId,
    participantName: thread.counterpartName,
    participantAvatarUrl: thread.counterpartAvatarUrl,
    preview: thread.lastMessage ?? messages.at(-1)?.text ?? 'Nueva conversación',
    updatedAt: thread.updatedAt ?? thread.lastMessageAt ?? thread.createdAt ?? new Date().toISOString(),
    lastSeenAt: thread.updatedAt ?? thread.lastMessageAt ?? thread.createdAt ?? new Date().toISOString(),
    unreadCount: thread.unreadCount ?? 0,
    archived: false,
    blocked: thread.status === 'closed',
    reported: false,
    exchangeStatus: backendStatusToExchangeStatus(thread.status),
    messages,
  };
}

export function normalizeBackendPost(post: BackendPost): AppPost {
  return {
    id: post.id,
    title: post.title,
    kind: post.kind,
    category: post.category ?? inferCategory(post) ?? 'food',
    description: post.description,
    images: buildPostImages(post.images),
    location: buildFallbackLocation(post),
    authorId: post.authorId,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? post.createdAt ?? post.publishedAt,
    quantity: 1,
    quantityUnit: 'unidad',
    condition: post.condition,
    delivery: post.delivery ?? 'coordinate',
    availability: 'Disponible',
    meetingPoint: post.location?.label ?? post.locationApprox,
    status: post.status,
    interestedUserIds: [],
  };
}

export function createPlaceholderAuthor(authorId: string): AppAuthor {
  const initials = authorId
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'NA';

  return {
    id: authorId,
    name: `Usuario ${initials}`,
    initials,
    accountType: 'person',
    bio: 'Perfil sincronizado desde el backend.',
    location: 'Neuquén',
    memberSince: new Date().toISOString(),
    completedExchanges: 0,
    verified: false,
    identityConfirmed: false,
    verificationStatus: 'not-requested',
    rating: 0,
    reviewCount: 0,
    reviews: [],
  };
}

export function mergeAuthorsWithPosts(authors: AppAuthor[], posts: AppPost[]) {
  const knownAuthors = new Set(authors.map(author => author.id));
  const missingAuthors = posts
    .map(post => post.authorId)
    .filter(authorId => !knownAuthors.has(authorId))
    .filter((authorId, index, items) => items.indexOf(authorId) === index)
    .map(createPlaceholderAuthor);

  return [...authors, ...missingAuthors];
}

export function backendUserToAuthor(user: BackendUser): AppAuthor {
  const name = `${user.name} ${user.lastName}`.trim();
  const initials = [user.name, user.lastName]
    .map(part => part.trim()[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'NU';

  return {
    id: user.id,
    name: name || 'Usuario',
    initials,
    imageUri: user.avatarUrl || undefined,
    accountType: user.role === 'organizacion' ? 'organization' : 'person',
    bio: 'Perfil sincronizado desde el backend.',
    location: user.address,
    memberSince: user.createdAt ?? user.birthDate,
    completedExchanges: 0,
    verified: user.role === 'administrador',
    identityConfirmed: Boolean(user.isActive),
    verificationStatus: user.role === 'administrador' ? 'verified' : 'not-requested',
    rating: 0,
    reviewCount: 0,
    reviews: [],
    email: user.email,
    phone: user.phone,
  };
}

export async function fetchBackendPosts(query?: Record<string, string | number | undefined>) {
  const response = await requestJson<{ msg: string; posts: BackendPost[] }>('/api/posts', { method: 'GET' }, query);
  return Array.isArray(response.posts) ? response.posts : [];
}

export async function fetchBackendChats(token?: string) {
  if (!token) throw new Error('missing token');
  const response = await requestJson<{ msg: string; chats: BackendChat[] }>('/api/chats', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(response.chats) ? response.chats : [];
}

export async function fetchBackendChatById(chatId: string, token?: string) {
  if (!token) throw new Error('missing token');
  const response = await requestJson<{ msg: string; chat: BackendChat }>(`/api/chats/${chatId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.chat;
}

export async function startBackendChatForPost(postId: string, token?: string, initialMessage?: string) {
  if (!token) throw new Error('missing token');
  const response = await requestJson<{ msg: string; chat: BackendChat }>(`/api/chats/posts/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: initialMessage?.trim() ? { initialMessage } : {},
  });
  return response.chat;
}

export async function sendBackendChatMessage(chatId: string, text: string, token?: string) {
  if (!token) throw new Error('missing token');
  const response = await requestJson<{ msg: string; chat: BackendChat }>(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { text },
  });
  return response.chat;
}

export async function fetchBackendPostById(postId: string) {
  const response = await requestJson<{ msg: string; post: BackendPost }>(`/api/posts/${postId}`, { method: 'GET' });
  return response.post;
}

export async function createBackendPost(input: CreateBackendPostInput, token?: string) {
  if (!token) throw new Error('missing token');

  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('kind', input.kind);
  formData.append('locationApprox', input.locationApprox);

  if (input.status) formData.append('status', input.status);
  if (input.category) formData.append('category', input.category);
  if (input.condition) formData.append('condition', input.condition);
  if (input.delivery) formData.append('delivery', input.delivery);
  if (input.tags?.length) formData.append('tags', input.tags.join(','));

  for (const [index, image] of input.images.entries()) {
    await appendImage(formData, image, index);
  }

  const response = await requestJson<{ msg: string; post: BackendPost }>('/api/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return response.post;
}

export async function updateBackendPost(postId: string, input: UpdateBackendPostInput, token?: string) {
  if (!token) throw new Error('missing token');

  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('kind', input.kind);
  formData.append('locationApprox', input.locationApprox);

  if (input.status) formData.append('status', input.status);
  if (input.category) formData.append('category', input.category);
  if (input.condition) formData.append('condition', input.condition);
  if (input.delivery) formData.append('delivery', input.delivery);
  if (input.tags?.length) formData.append('tags', input.tags.join(','));
  if (input.existingImages?.length) formData.append('existingImages', JSON.stringify(input.existingImages));

  for (const [index, image] of input.images.entries()) {
    await appendImage(formData, image, index);
  }

  const response = await requestJson<{ msg: string; post: BackendPost }>(`/api/posts/${postId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return response.post;
}

export async function fetchCurrentBackendUser(token?: string) {
  if (!token) throw new Error('missing token');
  const response = await requestJson<BackendProfileResponse>('/api/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.user;
}

export async function loginWithBackend(input: LoginInput) {
  return await requestJson<BackendAuthResponse>('/api/auth/login', { method: 'POST', body: input });
}

export async function registerWithBackend(input: RegisterInput) {
  return await requestJson<BackendAuthResponse>('/api/auth/register', { method: 'POST', body: input });
}
