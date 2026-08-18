import type { Request, RequestHandler, Response } from 'express';
import { validationResult } from 'express-validator';

import { deletePostImage, uploadPostImage } from './post.cloudinary';
import type { AuthenticatedRequest } from '../user/user.middleware';
import { PostRepository } from './post.repository';
import type { CreatePostDTO, SearchPostsQuery } from './post.interfaces';

// normaliza etiquetas recibidas como array o texto.
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

// sube una lista de imagenes a cloudinary.
async function uploadImages(files: Express.Multer.File[], title: string) {
  const uploadedImages: Array<{ url: string; publicId: string; alt: string }> = [];

  try {
    for (const [index, file] of files.entries()) {
      const uploaded = await uploadPostImage(file);
      uploadedImages.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: file.originalname?.trim() || `${title} ${index + 1}`,
      });
    }

    return uploadedImages;
  } catch (error) {
    // si algo falla, borra las imagenes ya subidas.
    await Promise.allSettled(uploadedImages.map(image => deletePostImage(image.publicId)));
    throw error;
  }
}

// crea una oferta o solicitud de donacion.
export const createPost: RequestHandler = async (req, res) => {
  try {
    const request = req as AuthenticatedRequest & Request<{}, {}, CreatePostDTO> & { files?: Express.Multer.File[] };

    // valida el body antes de crear la publicacion.
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    // requiere un usuario autenticado.
    if (!request.auth?.sub) {
      return res.status(401).json({ msg: 'missing token' });
    }

    // requiere al menos una imagen.
    const files = Array.isArray(request.files) ? request.files : [];
    if (files.length < 1) {
      return res.status(400).json({ msg: 'at least one image is required' });
    }

    // toma los datos principales del body.
    const {
      title,
      description,
      kind,
      locationApprox,
      tags,
      status,
      category,
      condition,
      delivery,
      location,
    } = request.body;

    // sube las imagenes antes de guardar la publicacion.
    const images = await uploadImages(files, title);

    try {
      // guarda la publicacion con el autor autenticado.
      const createdPost = await PostRepository.createPost({
        title,
        description,
        kind,
        locationApprox,
        status,
        tags: normalizeTags(tags),
        category,
        condition,
        delivery,
        location,
        images,
        authorId: request.auth.sub,
      });

      return res.status(201).json({
        msg: 'publication created successfully',
        post: createdPost.toJSON(),
      });
    } catch (error) {
      // limpia las imagenes si falla la persistencia del post.
      await Promise.allSettled(images.map(image => deletePostImage(image.publicId)));
      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
};

// busca publicaciones con filtros, orden y paginacion.
export async function searchPosts(req: Request<{}, {}, {}, SearchPostsQuery>, res: Response) {
  try {
    // valida los filtros recibidos.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    // consulta las publicaciones.
    const result = await PostRepository.searchPosts(req.query);

    return res.status(200).json({
      msg: 'publications retrieved successfully',
      posts: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// devuelve una publicacion por id.
export async function getPostById(req: Request<{ id: string }>, res: Response) {
  try {
    // valida el parametro id.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    // busca la publicacion en base al id.
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
