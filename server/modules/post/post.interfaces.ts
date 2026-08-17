// tipo de publicacion.
export type PostKind = 'donation' | 'request';
// estado posible de una publicacion.
export type PostStatus = 'available' | 'reserved' | 'completed' | 'paused';
// categoria tematica de una publicacion.
export type PostCategory =
  | 'food'
  | 'clothes'
  | 'health'
  | 'home'
  | 'school'
  | 'furniture'
  | 'volunteering';
// condicion del articulo publicado.
export type ArticleCondition = 'new' | 'very-good' | 'good';
// forma de entrega acordada.
export type DeliveryMethod = 'coordinate' | 'can-deliver';
// orden posible de los resultados.
export type PostSort = 'recent' | 'distance';

// ubicacion geografica usada para filtrar y ordenar por distancia.
export interface PostLocation {
  label: string;
  locality: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
}

// estructura base de una publicacion.
export interface Post {
  title: string;
  description: string;
  kind: PostKind;
  locationApprox: string;
  status: PostStatus;
  tags: string[];
  authorId: string;
  publishedAt: Date;
  category?: PostCategory;
  condition?: ArticleCondition;
  delivery?: DeliveryMethod;
  location?: PostLocation;
  createdAt?: Date;
  updatedAt?: Date;
}

// datos que acepta el alta de una publicacion.
export interface CreatePostDTO {
  title: string;
  description: string;
  kind: PostKind;
  locationApprox: string;
  tags?: string[] | string;
  status?: PostStatus;
  category?: PostCategory;
  condition?: ArticleCondition;
  delivery?: DeliveryMethod;
  location?: PostLocation;
}

// filtros de busqueda de publicaciones.
export interface SearchPostsQuery {
  kind?: PostKind;
  status?: PostStatus;
  tag?: string;
  q?: string;
  category?: PostCategory;
  condition?: ArticleCondition;
  delivery?: DeliveryMethod;
  locality?: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: PostSort;
  page?: number;
  limit?: number;
}

// filtros simples para buscar publicaciones.
export interface ListPostsQuery {
  kind?: PostKind;
  status?: PostStatus;
  tag?: string;
  q?: string;
}
