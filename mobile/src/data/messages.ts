export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageAttachment =
  | { type: 'image'; uri: string }
  | { type: 'location'; label: string; latitude: number; longitude: number };

export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  createdAt: string;
  status: MessageStatus;
  attachment?: MessageAttachment;
  simulated?: boolean;
};

export type ExchangeStatus = 'coordinating' | 'reserved' | 'completed';

export type MessageThread = {
  id: string;
  postId: string;
  participantId: string;
  preview: string;
  updatedAt: string;
  lastSeenAt: string;
  unreadCount: number;
  archived: boolean;
  blocked: boolean;
  reported: boolean;
  exchangeStatus: ExchangeStatus;
  messages: ChatMessage[];
};
export const messageThreads: MessageThread[] = [];

export function getMessageThread(threadId: string, threads: MessageThread[] = messageThreads) {
  return threads.find(thread => thread.id === threadId);
}
