export type PostKind = 'donation' | 'request';
export type PostStatus = 'available' | 'reserved' | 'completed' | 'paused';

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

export interface CreatePostDTO {
  title: string;
  description: string;
  kind: PostKind;
  locationApprox: string;
  tags?: string[] | string;
  status?: PostStatus;
}

export interface ListPostsQuery {
  kind?: PostKind;
  status?: PostStatus;
  tag?: string;
  q?: string;
}

