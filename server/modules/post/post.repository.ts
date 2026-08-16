import PostModel from './post.model';

import type { CreatePostDTO, ListPostsQuery } from './post.interfaces';

type CreatePostInput = CreatePostDTO & {
  authorId: string;
  tags: string[];
};

export const PostRepository = {
  async createPost(data: CreatePostInput) {
    const newPost = new PostModel(data);
    return await newPost.save();
  },

  async findById(id: string) {
    return await PostModel.findById(id);
  },

  async listPosts(filters: ListPostsQuery = {}) {
    const query: Record<string, unknown> = {};

    if (filters.kind) query.kind = filters.kind;
    if (filters.status) query.status = filters.status;
    if (filters.tag) query.tags = filters.tag.toLowerCase();
    if (filters.q) {
      query.$or = [
        { title: { $regex: filters.q, $options: 'i' } },
        { description: { $regex: filters.q, $options: 'i' } },
        { locationApprox: { $regex: filters.q, $options: 'i' } },
      ];
    }

    return await PostModel.find(query).sort({ publishedAt: -1, createdAt: -1 });
  },
};

