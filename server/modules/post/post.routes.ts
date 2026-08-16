import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { createPost, getPostById, listPosts } from './post.controllers';
import { requireAuth } from '../user/user.middleware';

export const PostRouter: Router = Router();

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
    .isIn(['donation', 'request'])
    .withMessage('kind is invalid'),
  body('locationApprox')
    .trim()
    .notEmpty()
    .withMessage('locationApprox is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('locationApprox must have between 3 and 120 characters'),
  body('status')
    .optional()
    .isIn(['available', 'reserved', 'completed', 'paused'])
    .withMessage('status is invalid'),
  body('tags').optional(),
];

const listRules = [
  query('kind').optional().isIn(['donation', 'request']).withMessage('kind is invalid'),
  query('status')
    .optional()
    .isIn(['available', 'reserved', 'completed', 'paused'])
    .withMessage('status is invalid'),
  query('tag').optional().trim(),
  query('q').optional().trim(),
];

PostRouter.get('/', listRules, listPosts);
PostRouter.get('/:id', param('id').isMongoId().withMessage('id is invalid'), getPostById);
PostRouter.post('/', requireAuth, createRules, createPost);

