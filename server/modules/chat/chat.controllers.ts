import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import type { AuthenticatedRequest } from '../user/user.middleware';
import { PostRepository } from '../post/post.repository';
import { ChatRepository } from './chat.repository';
import type { SendChatMessageDTO, StartChatDTO } from './chat.interfaces';

// verifica que el usuario sea parte del hilo.
function isParticipant(thread: { authorId: string; interestedUserId: string }, userId: string) {
  return thread.authorId === userId || thread.interestedUserId === userId;
}

// calcula los mensajes no leidos para un usuario dado.
function getUnreadCount(thread: { messages: Array<{ senderId: string; readBy: string[] }> }, userId: string) {
  return thread.messages.filter(message => message.senderId !== userId && !message.readBy.includes(userId)).length;
}

// arma un resumen liviano para la lista de chats.
function toThreadSummary(thread: any, userId: string) {
  const counterpartId = thread.authorId === userId ? thread.interestedUserId : thread.authorId;

  return {
    id: thread.id,
    postId: thread.postId,
    counterpartId,
    participantIds: thread.participantIds,
    lastMessage: thread.lastMessage,
    lastMessageAt: thread.lastMessageAt,
    status: thread.status,
    unreadCount: getUnreadCount(thread, userId),
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

// crea o recupera un chat entre quien publica y quien se interesa.
export async function startChatForPost(
  req: AuthenticatedRequest & Request<{ postId: string }, {}, StartChatDTO>,
  res: Response,
) {
  try {
    // valida el body recibido.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    // toma el usuario autenticado.
    const authUserId = req.auth?.sub;
    // toma el id de la publicacion.
    const postId = req.params.postId;

    // requiere un token valido.
    if (!authUserId) {
      return res.status(401).json({ msg: 'missing token' });
    }

    // busca la publicacion para validar el autor.
    const post = await PostRepository.findById(postId);

    // corta si la publicacion no existe.
    if (!post) {
      return res.status(404).json({ msg: 'publication not found' });
    }

    // evita que el autor se cree como interesado de su propia publicacion.
    if (post.authorId === authUserId) {
      return res.status(403).json({ msg: 'post owner cannot start this chat as interested user' });
    }

    // reutiliza el hilo si ya existe.
    let thread = await ChatRepository.findByPostAndInterestedUser(postId, authUserId);

    // crea el hilo solo si todavia no existe.
    if (!thread) {
      thread = await ChatRepository.createThread({
        postId,
        authorId: post.authorId,
        interestedUserId: authUserId,
        participantIds: [post.authorId, authUserId],
        initialMessage: req.body.initialMessage?.trim()
          ? { senderId: authUserId, text: req.body.initialMessage.trim() }
          : undefined,
      });
    }

    // devuelve el hilo listo para usar.
    return res.status(200).json({
      msg: 'chat ready',
      chat: thread.toJSON(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// lista los chats visibles para el usuario autenticado.
export async function listMyChats(req: AuthenticatedRequest, res: Response) {
  try {
    // toma el usuario autenticado.
    const authUserId = req.auth?.sub;

    // requiere token valido.
    if (!authUserId) {
      return res.status(401).json({ msg: 'missing token' });
    }

    // consulta los hilos donde participa el usuario.
    const threads = await ChatRepository.listByUser(authUserId);

    // devuelve un resumen por hilo.
    return res.status(200).json({
      msg: 'chats retrieved successfully',
      chats: threads.map(thread => toThreadSummary(thread.toJSON(), authUserId)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// devuelve un chat completo con sus mensajes y lo marca como leido.
export async function getChatById(req: AuthenticatedRequest & Request<{ chatId: string }>, res: Response) {
  try {
    // toma el usuario autenticado.
    const authUserId = req.auth?.sub;

    // requiere token valido.
    if (!authUserId) {
      return res.status(401).json({ msg: 'missing token' });
    }

    // busca el hilo por id.
    const thread = await ChatRepository.findById(req.params.chatId);

    // corta si el chat no existe.
    if (!thread) {
      return res.status(404).json({ msg: 'chat not found' });
    }

    // valida que el usuario pertenezca al hilo.
    if (!isParticipant(thread, authUserId)) {
      return res.status(403).json({ msg: 'forbidden' });
    }

    // marca el hilo como leido para ese usuario.
    const updatedThread = await ChatRepository.markAsRead(thread.id, authUserId);

    // devuelve el hilo completo.
    return res.status(200).json({
      msg: 'chat retrieved successfully',
      chat: updatedThread?.toJSON() ?? thread.toJSON(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// permite enviar mensajes solo entre los dos participantes.
export async function sendChatMessage(
  req: AuthenticatedRequest & Request<{ chatId: string }, {}, SendChatMessageDTO>,
  res: Response,
) {
  try {
    // valida el mensaje entrante.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    // toma el usuario autenticado.
    const authUserId = req.auth?.sub;

    // requiere token valido.
    if (!authUserId) {
      return res.status(401).json({ msg: 'missing token' });
    }

    // busca el hilo destino.
    const thread = await ChatRepository.findById(req.params.chatId);

    // corta si el hilo no existe.
    if (!thread) {
      return res.status(404).json({ msg: 'chat not found' });
    }

    // valida que el usuario participe del hilo.
    if (!isParticipant(thread, authUserId)) {
      return res.status(403).json({ msg: 'forbidden' });
    }

    // evita escribir en un chat cerrado.
    if (thread.status === 'closed') {
      return res.status(409).json({ msg: 'chat is closed' });
    }

    // limpia el texto antes de guardar.
    const text = req.body.text.trim();

    // agrega el mensaje y actualiza el resumen.
    const updatedThread = await ChatRepository.addMessage(thread.id, authUserId, text);

    // responde con el hilo actualizado.
    return res.status(201).json({
      msg: 'message sent successfully',
      chat: updatedThread?.toJSON(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}
