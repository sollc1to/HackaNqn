import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { createPost, getPostById, searchPosts, updatePost } from './post.controllers';
import { requireAuth } from '../user/user.middleware';
import { handlePostImagesUpload } from './post.upload';

// router principal de publicaciones.
export const PostRouter: Router = Router();

const postKinds = ['donation', 'request'];
const postStatuses = ['available', 'reserved', 'completed', 'paused'];
const postCategories = ['food', 'clothes', 'health', 'home', 'school', 'furniture', 'volunteering'];
const postConditions = ['new', 'very-good', 'good'];
const postDeliveries = ['coordinate', 'can-deliver'];

// reglas para crear una publicacion.
const createRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('title must have between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('description must have between 10 and 1000 characters'),
  body('kind')
    .isIn(postKinds)
    .withMessage('kind is invalid'),
  body('locationApprox')
    .trim()
    .notEmpty()
    .withMessage('locationApprox is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('locationApprox must have between 3 and 120 characters'),
  body('status')
    .optional()
    .isIn(postStatuses)
    .withMessage('status is invalid'),
  body('tags').optional(),
  body('category')
    .optional()
    .isIn(postCategories)
    .withMessage('category is invalid'),
  body('condition')
    .optional()
    .isIn(postConditions)
    .withMessage('condition is invalid'),
  body('delivery')
    .optional()
    .isIn(postDeliveries)
    .withMessage('delivery is invalid'),
  body('location.label')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('location.label is invalid'),
  body('location.locality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('location.locality is invalid'),
  body('location.neighborhood')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('location.neighborhood is invalid'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('location.latitude is invalid'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('location.longitude is invalid'),
];

// reglas para buscar publicaciones.
const searchRules = [
  query('kind')
    .optional()
    .isIn(postKinds)
    .withMessage('kind is invalid'),
  query('status')
    .optional()
    .isIn(postStatuses)
    .withMessage('status is invalid'),
  query('tag').optional().trim(),
  query('q').optional().trim(),
  query('category')
    .optional()
    .isIn(postCategories)
    .withMessage('category is invalid'),
  query('condition')
    .optional()
    .isIn(postConditions)
    .withMessage('condition is invalid'),
  query('delivery')
    .optional()
    .isIn(postDeliveries)
    .withMessage('delivery is invalid'),
  query('locality').optional().trim(),
  query('neighborhood').optional().trim(),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('lat is invalid')
    .toFloat(),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('lng is invalid')
    .toFloat(),
  query('radiusKm')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('radiusKm is invalid')
    .toFloat()
    .custom((_value, { req }) => {
      if (req.query?.lat === undefined || req.query?.lng === undefined) {
        throw new Error('radiusKm requires lat and lng');
      }
      return true;
    }),
  query('sort')
    .optional()
    .isIn(['recent', 'distance'])
    .withMessage('sort is invalid')
    .custom((value, { req }) => {
      if (value === 'distance' && (req.query?.lat === undefined || req.query?.lng === undefined)) {
        throw new Error('sort=distance requires lat and lng');
      }
      return true;
    }),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page is invalid')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit is invalid')
    .toInt(),
];

// busca publicaciones con filtros y paginacion.
PostRouter.get('/', searchRules, searchPosts);
// obtiene una publicacion por id.
PostRouter.get('/:id', param('id').isMongoId().withMessage('id is invalid'), getPostById);
// crea una publicacion protegida con jwt y subida de imagenes.
PostRouter.post('/', requireAuth, handlePostImagesUpload, createRules, createPost);
// actualiza una publicacion propia protegida con jwt y subida de imagenes.
PostRouter.put('/:id', requireAuth, param('id').isMongoId().withMessage('id is invalid'), handlePostImagesUpload, createRules, updatePost);
