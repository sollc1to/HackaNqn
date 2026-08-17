import PostModel from './post.model';
import { buildSearchQuery, distanceKmExpression, paginate } from './post.search';

import type { CreatePostDTO, SearchPostsQuery } from './post.interfaces';
import type { PostDocument } from './post.types';

// datos necesarios para crear una publicacion nueva.
type CreatePostInput = CreatePostDTO & {
  authorId: string;
  tags: string[];
};

// serializa un documento o resultado de agregacion para la api.
function serializePost(post: PostDocument | (PostDocument & { distanceKm: number })) {
  if (typeof (post as PostDocument).toJSON === 'function') {
    return (post as PostDocument).toJSON();
  }

  const { _id, __v, ...rest } = post as PostDocument & { _id?: unknown; __v?: unknown };
  return { ...rest, id: _id?.toString() };
}

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

  // busca publicaciones aplicando filtros, orden y paginacion.
  async searchPosts(filters: SearchPostsQuery = {}) {
    const query = buildSearchQuery(filters);
    const { page, limit, skip } = paginate(filters.page, filters.limit);
    const lat = filters.lat;
    const lng = filters.lng;
    const wantsDistance = filters.sort === 'distance' && lat !== undefined && lng !== undefined;

    // cuenta el total para los metadatos de paginacion.
    const total = await PostModel.countDocuments(query);

    let raw: PostDocument[] | Array<PostDocument & { distanceKm: number }>;

    if (wantsDistance && lat !== undefined && lng !== undefined) {
      // ordena por cercania usando la formula haversine.
      raw = await PostModel.aggregate<PostDocument & { distanceKm: number }>([
        { $match: query },
        { $addFields: { distanceKm: distanceKmExpression(lat, lng) } },
        { $sort: { distanceKm: 1, publishedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } else {
      // devuelve lo mas nuevo primero.
      raw = await PostModel.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit);
    }

    return {
      posts: raw.map(post => serializePost(post)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};
