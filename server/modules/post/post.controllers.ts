import type { Request, RequestHandler, Response } from 'express';
import { validationResult } from 'express-validator';

import { deletePostImage, uploadPostImage } from './post.cloudinary';
import type { AuthenticatedRequest } from '../user/user.middleware';
import { PostRepository } from './post.repository';
import type { CreatePostDTO, SearchPostsQuery, UpdatePostDTO } from './post.interfaces';

type StoredPostImage = {
  url: string;
  publicId: string;
  alt: string;
};

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

// convierte imagenes existentes desde el body multipart.
function parseStoredImages(value: unknown) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(item => {
        if (!item || typeof item !== 'object') return null;
        const candidate = item as Partial<StoredPostImage>;
        if (!candidate.url || !candidate.publicId || !candidate.alt) return null;
        return {
          url: String(candidate.url),
          publicId: String(candidate.publicId),
          alt: String(candidate.alt).trim() || 'Imagen de la publicación',
        };
      })
      .filter((image): image is StoredPostImage => Boolean(image));
  } catch {
    return [];
  }
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

    const files = Array.isArray(request.files) ? request.files : [];
    const { title, description, kind, locationApprox, tags, status, category, condition, delivery, location } = request.body;

    if (kind === 'donation' && files.length < 1) {
      return res.status(400).json({ msg: 'at least one image is required' });
    }

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

// actualiza una publicacion existente.
export const updatePost: RequestHandler = async (req, res) => {
  try {
    const request = req as AuthenticatedRequest & Request<{ id: string }, {}, UpdatePostDTO & { existingImages?: string }> & {
      files?: Express.Multer.File[];
    };

    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    if (!request.auth?.sub) {
      return res.status(401).json({ msg: 'missing token' });
    }

    const existingPost = await PostRepository.findById(request.params.id);

    if (!existingPost) {
      return res.status(404).json({ msg: 'publication not found' });
    }

    if (existingPost.authorId !== request.auth.sub) {
      return res.status(403).json({ msg: 'you can only update your own publications' });
    }

    const files = Array.isArray(request.files) ? request.files : [];
    const existingImages = parseStoredImages(request.body.existingImages);
    const { title, description, kind, locationApprox, tags, status, category, condition, delivery, location } = request.body;
    const nextImages = [...existingImages, ...files];
    const nextKind = kind ?? existingPost.kind;

    if (nextImages.length > 5) {
      return res.status(400).json({ msg: 'you can upload up to 5 images' });
    }

    if (nextKind === 'donation' && nextImages.length < 1) {
      return res.status(400).json({ msg: 'at least one image is required' });
    }

    const uploadedImages = await uploadImages(files, title);
    const images = [...existingImages, ...uploadedImages];
    const removedImages = existingPost.images.filter(
      image => Boolean(image.publicId) && !images.some(next => next.publicId === image.publicId),
    );

    try {
      const updatedPost = await PostRepository.updatePostById(request.params.id, {
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

      await Promise.allSettled(removedImages.map(image => deletePostImage(image.publicId)));

      return res.status(200).json({
        msg: 'publication updated successfully',
        post: updatedPost?.toJSON(),
      });
    } catch (error) {
      await Promise.allSettled(uploadedImages.map(image => deletePostImage(image.publicId)));
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
