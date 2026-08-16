import { Router } from 'express';
import { body, param } from 'express-validator';

import { startChatForPost, listMyChats, getChatById, sendChatMessage } from './chat.controllers';
import { requireAuth } from '../user/user.middleware';

// router principal del chat de publicaciones.
export const ChatRouter: Router = Router();

// valida el alta o apertura de un chat.
const startChatRules = [
  param('postId').isMongoId().withMessage('postId is invalid'),
  body('initialMessage')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('initialMessage must have between 1 and 1000 characters'),
];

// valida el envio de mensajes nuevos.
const sendMessageRules = [
  param('chatId').isMongoId().withMessage('chatId is invalid'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('text must have between 1 and 1000 characters'),
];

// lista los chats del usuario autenticado.
ChatRouter.get('/', requireAuth, listMyChats);
// obtiene un chat puntual por id.
ChatRouter.get('/:chatId', requireAuth, param('chatId').isMongoId().withMessage('chatId is invalid'), getChatById);
// crea o recupera un chat desde una publicacion.
ChatRouter.post('/posts/:postId', requireAuth, startChatRules, startChatForPost);
// envia un mensaje dentro de un chat existente.
ChatRouter.post('/:chatId/messages', requireAuth, sendMessageRules, sendChatMessage);
