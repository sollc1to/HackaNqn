import { Platform } from 'react-native';

import { appAuthors, currentUserId, type AppAuthor } from '@/data/authors';
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
  android: 'http://192.168.0.221:3000',
  web: 'http://localhost:3000',
  default: 'http://192.168.0.221:3000',
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

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

const localCoordinates = { latitude: -38.9516, longitude: -68.0591 };

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
  }));
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

export async function fetchBackendPostById(postId: string) {
  const response = await requestJson<{ msg: string; post: BackendPost }>(`/api/posts/${postId}`, { method: 'GET' });
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

export const demoAuthors = appAuthors;
export const demoCurrentUserId = currentUserId;
