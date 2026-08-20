import type { ImageSource } from 'expo-image';

export type PostKind = 'donation' | 'request';
export type PostCategory =
  | 'food'
  | 'clothes'
  | 'health'
  | 'home'
  | 'school'
  | 'furniture'
  | 'volunteering';
export type PostStatus = 'available' | 'reserved' | 'completed' | 'paused';
export type DeliveryMethod = 'coordinate' | 'can-deliver';
export type ArticleCondition = 'new' | 'very-good' | 'good';
export type DemoImageKey = 'clothes' | 'food' | 'desk' | 'hygiene' | 'school' | 'wheelchair';

export type PostImage =
  | { id: string; kind: 'asset'; assetKey: DemoImageKey; alt: string }
  | { id: string; kind: 'uri'; uri: string; alt: string; publicId?: string };

export type PostLocation = {
  label: string;
  locality: 'Neuquén capital' | 'Plottier' | 'Centenario' | 'Cutral Co';
  neighborhood?: string;
  latitude: number;
  longitude: number;
};

export type AppPost = {
  id: string;
  title: string;
  kind: PostKind;
  category: PostCategory;
  description: string;
  images: PostImage[];
  location: PostLocation;
  /** Solo se muestra cuando proviene de un cálculo real de geolocalización. */
  distanceKm?: number;
  authorId: string;
  publishedAt: string;
  updatedAt: string;
  quantity: number;
  quantityUnit: string;
  condition?: ArticleCondition;
  delivery: DeliveryMethod;
  availability: string;
  deadline?: string;
  meetingPoint: string;
  status: PostStatus;
  interestedUserIds: string[];
  ownerId?: string;
};

const demoImageSources: Record<DemoImageKey, ImageSource> = {
  clothes: require('../../assets/images/posts/abrigos-neuquen.jpg'),
  food: require('../../assets/images/posts/alimentos-neuquen.jpg'),
  desk: require('../../assets/images/posts/escritorio-neuquen.jpg'),
  hygiene: require('../../assets/images/posts/higiene-neuquen.jpg'),
  school: require('../../assets/images/posts/utiles-neuquen.jpg'),
  wheelchair: require('../../assets/images/posts/silla-ruedas-neuquen.jpg'),
};

export const fallbackPostImage = require('../../assets/images/nexo-icon.png');

export function getPostImageSource(image?: PostImage): ImageSource {
  if (!image) return fallbackPostImage;
  return image.kind === 'asset' ? demoImageSources[image.assetKey] : { uri: image.uri };
}
export const appPosts: AppPost[] = [];

export const postKindLabel: Record<PostKind, string> = {
  donation: 'Donación',
  request: 'Solicitud',
};

export const postCategoryLabel: Record<PostCategory, string> = {
  food: 'Alimentos',
  clothes: 'Ropa',
  health: 'Salud',
  home: 'Hogar',
  school: 'Útiles escolares',
  furniture: 'Muebles',
  volunteering: 'Voluntariado',
};

export const postStatusLabel: Record<PostStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  completed: 'Completada',
  paused: 'Pausada',
};

export const deliveryLabel: Record<DeliveryMethod, string> = {
  coordinate: 'A coordinar',
  'can-deliver': 'Puedo acercarlo',
};

export const conditionLabel: Record<ArticleCondition, string> = {
  new: 'Nuevo',
  'very-good': 'Muy buen estado',
  good: 'Buen estado',
};

export function formatPostQuantity(post: Pick<AppPost, 'quantity' | 'quantityUnit'>) {
  return `${post.quantity.toLocaleString('es-AR')} ${post.quantityUnit}`;
}

export function getPostById(postId: string, posts: AppPost[] = appPosts) {
  return posts.find(post => post.id === postId);
}
