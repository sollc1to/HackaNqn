// tipo de publicacion.
export type PostKind = 'donation' | 'request';
// estado posible de una publicacion.
export type PostStatus = 'available' | 'reserved' | 'completed' | 'paused';

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
}

// filtros simples para buscar publicaciones.
export interface ListPostsQuery {
  kind?: PostKind;
  status?: PostStatus;
  tag?: string;
  q?: string;
}
