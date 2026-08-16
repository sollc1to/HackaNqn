import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import type { AuthenticatedRequest } from '../user/user.middleware';
import { PostRepository } from './post.repository';
import type { CreatePostDTO, ListPostsQuery } from './post.interfaces';

function normalizeTags(tags?: string[] | string) {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag).trim().toLowerCase()).filter(Boolean);
  }
  return String(tags)
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean);
}

// este controlador crea una oferta o solicitud de donacion.
export async function createPost(req: AuthenticatedRequest & Request<{}, {}, CreatePostDTO>, res: Response) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    if (!req.auth?.sub) {
      return res.status(401).json({ msg: 'missing token' });
    }

    const { title, description, kind, locationApprox, tags, status } = req.body;

    const createdPost = await PostRepository.createPost({
      title,
      description,
      kind,
      locationApprox,
      status,
      tags: normalizeTags(tags),
      authorId: req.auth.sub,
    });

    return res.status(201).json({
      msg: 'publication created successfully',
      post: createdPost.toJSON(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// este controlador lista publicaciones con filtros simples.
export async function listPosts(req: Request<{}, {}, {}, ListPostsQuery>, res: Response) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    const posts = await PostRepository.listPosts(req.query);

    return res.status(200).json({
      msg: 'publications retrieved successfully',
      posts: posts.map(post => post.toJSON()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// este controlador devuelve una publicacion por id.
export async function getPostById(req: Request<{ id: string }>, res: Response) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    const post = await PostRepository.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'publication not found' });
    }

    return res.status(200).json({
      msg: 'publication retrieved successfully',
      post: post.toJSON(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}
