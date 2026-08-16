import mongoose from 'mongoose';

import type { ChatThread } from './chat.interfaces';

// subesquema para cada mensaje del chat.
const chatMessageSchema = new mongoose.Schema(
  {
    // id del usuario que envio el mensaje.
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    // texto principal del mensaje.
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // fecha en que se creo el mensaje.
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // usuarios que ya leyeron el mensaje.
    readBy: {
      type: [String],
      default: [],
    },
  },
  { _id: true },
);

// esquema del hilo entre autor e interesado.
const chatThreadSchema = new mongoose.Schema<ChatThread>(
  {
    // publicacion asociada al chat.
    postId: {
      type: String,
      required: true,
      index: true,
    },
    // usuario que creo la publicacion.
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    // usuario interesado en la publicacion.
    interestedUserId: {
      type: String,
      required: true,
      index: true,
    },
    // asegura que el hilo siempre tenga dos participantes.
    participantIds: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length === 2,
        message: 'participantIds must contain exactly 2 users',
      },
    },
    // mensajes del hilo.
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    // ultimo mensaje visible en la lista.
    lastMessage: {
      type: String,
      default: '',
    },
    // momento del ultimo movimiento en el hilo.
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // permite cerrar o dejar activo el chat.
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

// evita crear dos chats iguales para la misma publicacion y usuario.
chatThreadSchema.index({ postId: 1, interestedUserId: 1 }, { unique: true });

// limpia el documento antes de devolverlo.
chatThreadSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    // expone un id amigable.
    ret.id = ret._id;
    // oculta campos internos.
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// modelo principal del chat.
const ChatThreadModel = mongoose.model('ChatThread', chatThreadSchema);

export default ChatThreadModel;
