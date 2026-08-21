import { Router } from 'express';
import { body, param } from 'express-validator';

import { getMyProfile, getUserById, loginUser, registerUser } from './user.controllers';
import { requireAuth } from './user.middleware';

export const AuthRouter: Router = Router();

// valida los datos para registrar un usuario nuevo.
const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('name must have between 2 and 80 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('lastName is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('lastName must have between 2 and 80 characters'),
  body('email').trim().isEmail().withMessage('email is invalid').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('password must have at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('phone is required'),
  body('birthDate')
    .isISO8601()
    .withMessage('birthDate must be a valid date'),
  body('address').trim().notEmpty().withMessage('address is required'),
  body('role')
    .optional()
    .isIn(['normal', 'organizacion', 'administrador'])
    .withMessage('role is invalid'),
];

// valida los datos de acceso para iniciar sesion.
const loginRules = [
  body('email').trim().isEmail().withMessage('email is invalid').normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
];

// crea una cuenta nueva.
AuthRouter.post('/register', registerRules, registerUser);

// valida credenciales y devuelve un token.
AuthRouter.post('/login', loginRules, loginUser);

// devuelve el perfil del usuario autenticado.
AuthRouter.get('/me', requireAuth, getMyProfile);

// devuelve el perfil publico de un usuario por id.
AuthRouter.get('/users/:userId', requireAuth, param('userId').isMongoId().withMessage('userId is invalid'), getUserById);
