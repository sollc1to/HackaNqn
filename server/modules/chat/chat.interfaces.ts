// estado del hilo de chat.
export type ChatThreadStatus = 'active' | 'closed';

// mensaje individual dentro de un hilo.
export interface ChatMessage {
  senderId: string;
  text: string;
  createdAt: Date;
  readBy: string[];
}

// estructura principal del chat por publicacion.
export interface ChatThread {
  postId: string;
  authorId: string;
  interestedUserId: string;
  participantIds: [string, string];
  messages: ChatMessage[];
  lastMessage?: string;
  lastMessageAt?: Date;
  status: ChatThreadStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// datos para abrir un chat por primera vez.
export interface StartChatDTO {
  initialMessage?: string;
}

// datos para enviar un mensaje nuevo.
export interface SendChatMessageDTO {
  text: string;
}
