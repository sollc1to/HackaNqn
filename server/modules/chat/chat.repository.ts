import ChatThreadModel from './chat.model';

import type { ChatMessage, ChatThread } from './chat.interfaces';
import type { ChatThreadDocument } from './chat.types';

// datos necesarios para crear un hilo nuevo.
type CreateThreadInput = Pick<ChatThread, 'postId' | 'authorId' | 'interestedUserId' | 'participantIds'> & {
  initialMessage?: {
    senderId: string;
    text: string;
  };
};

export const ChatRepository = {
  // busca un hilo por id.
  async findById(id: string): Promise<ChatThreadDocument | null> {
    return await ChatThreadModel.findById(id);
  },

  // busca un hilo por publicacion y usuario interesado.
  async findByPostAndInterestedUser(postId: string, interestedUserId: string): Promise<ChatThreadDocument | null> {
    return await ChatThreadModel.findOne({ postId, interestedUserId });
  },

  // lista todos los hilos donde participa un usuario.
  async listByUser(userId: string): Promise<ChatThreadDocument[]> {
    return await ChatThreadModel.find({ participantIds: userId }).sort({ lastMessageAt: -1, updatedAt: -1 });
  },

  // crea un hilo nuevo con mensaje inicial opcional.
  async createThread(data: CreateThreadInput): Promise<ChatThreadDocument> {
    const messages: ChatMessage[] = [];

    // agrega el primer mensaje si llego uno.
    if (data.initialMessage) {
      messages.push({
        senderId: data.initialMessage.senderId,
        text: data.initialMessage.text,
        createdAt: new Date(),
      readBy: [data.initialMessage.senderId],
      });
    }

    // persiste el hilo completo.
    const newThread = new ChatThreadModel({
      postId: data.postId,
      authorId: data.authorId,
      interestedUserId: data.interestedUserId,
      participantIds: data.participantIds,
      messages,
      lastMessage: data.initialMessage?.text ?? '',
      lastMessageAt: new Date(),
      status: 'active',
    });

    return await newThread.save();
  },

  // agrega un mensaje al hilo.
  async addMessage(threadId: string, senderId: string, text: string): Promise<ChatThreadDocument | null> {
    const thread = await ChatThreadModel.findById(threadId);

    // aborta si el hilo no existe.
    if (!thread) {
      return null;
    }

    // agrega el mensaje y actualiza el resumen.
    thread.messages.push({
      senderId,
      text,
      createdAt: new Date(),
      readBy: [senderId],
    });
    thread.lastMessage = text;
    thread.lastMessageAt = new Date();

    return await thread.save();
  },

  // marca todos los mensajes como leidos por un usuario.
  async markAsRead(threadId: string, userId: string): Promise<ChatThreadDocument | null> {
    const thread = await ChatThreadModel.findById(threadId);

    // aborta si el hilo no existe.
    if (!thread) {
      return null;
    }

    // agrega el usuario a la lista de lectura.
    for (const message of thread.messages) {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    }

    return await thread.save();
  },
};
