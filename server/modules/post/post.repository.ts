import PostModel from './post.model';

import type { CreatePostDTO, ListPostsQuery } from './post.interfaces';

// datos necesarios para crear una publicacion nueva.
type CreatePostInput = CreatePostDTO & {
  authorId: string;
  tags: string[];
};

export const PostRepository = {
  // crea y guarda una nueva publicacion.
  async createPost(data: CreatePostInput) {
    const newPost = new PostModel(data);
    return await newPost.save();
  },

  // busca una publicacion por id.
  async findById(id: string) {
    return await PostModel.findById(id);
  },

  // lista publicaciones aplicando filtros simples.
  async listPosts(filters: ListPostsQuery = {}) {
    const query: Record<string, unknown> = {};

    // filtra por tipo de publicacion.
    if (filters.kind) query.kind = filters.kind;
    // filtra por estado.
    if (filters.status) query.status = filters.status;
    // filtra por etiqueta normalizada.
    if (filters.tag) query.tags = filters.tag.toLowerCase();
    // filtra por texto en campos principales.
    if (filters.q) {
      query.$or = [
        { title: { $regex: filters.q, $options: 'i' } },
        { description: { $regex: filters.q, $options: 'i' } },
        { locationApprox: { $regex: filters.q, $options: 'i' } },
      ];
    }

    // devuelve lo mas nuevo primero.
    return await PostModel.find(query).sort({ publishedAt: -1, createdAt: -1 });
  },
};
