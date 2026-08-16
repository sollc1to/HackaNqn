import { Router } from 'express';
import { body } from 'express-validator';

import { loginUser, registerUser } from './user.controllers';

export const AuthRouter: Router = Router();

// estas validaciones mantienen las entradas del auth controladas.
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

// estas validaciones protegen el ingreso con email y password.
const loginRules = [
  body('user').trim().notEmpty().withMessage('user is required'),
  body('password').notEmpty().withMessage('password is required'),
];

// esta ruta crea una cuenta nueva.
AuthRouter.post('/register', registerRules, registerUser);

// esta ruta valida credenciales y devuelve un token.
AuthRouter.post('/login', loginRules, loginUser);
