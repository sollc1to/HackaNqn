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

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number, hour: number, minute: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

export const messageThreads: MessageThread[] = [
  {
    id: 'food-boxes-plottier',
    postId: 'food-boxes-plottier',
    participantId: 'comedor-puentes',
    preview: 'Sí, recibimos donaciones hasta las 18 h.',
    updatedAt: minutesAgo(35),
    lastSeenAt: minutesAgo(3),
    unreadCount: 2,
    archived: false,
    blocked: false,
    reported: false,
    exchangeStatus: 'coordinating',
    messages: [
      {
        id: 'food-1',
        sender: 'me',
        text: 'Hola, tengo arroz y fideos para donar. ¿Todavía los necesitan?',
        createdAt: minutesAgo(47),
        status: 'read',
      },
      {
        id: 'food-2',
        sender: 'them',
        text: '¡Hola, María! Sí, nos vienen muy bien para las viandas de esta semana.',
        createdAt: minutesAgo(41),
        status: 'read',
      },
      {
        id: 'food-3',
        sender: 'me',
        text: 'Puedo acercarlos hoy por la tarde.',
        createdAt: minutesAgo(38),
        status: 'read',
      },
      {
        id: 'food-4',
        sender: 'them',
        text: 'Sí, recibimos donaciones hasta las 18 h. Te paso el punto exacto al confirmar.',
        createdAt: minutesAgo(35),
        status: 'read',
      },
    ],
  },
  {
    id: 'study-desk-centenario',
    postId: 'study-desk-centenario',
    participantId: 'fundacion-horizonte',
    preview: 'Podemos coordinar el retiro el jueves.',
    updatedAt: minutesAgo(210),
    lastSeenAt: minutesAgo(20),
    unreadCount: 1,
    archived: false,
    blocked: false,
    reported: false,
    exchangeStatus: 'reserved',
    messages: [
      {
        id: 'desk-1',
        sender: 'me',
        text: 'Buenos días. ¿El escritorio sigue disponible?',
        createdAt: minutesAgo(233),
        status: 'read',
      },
      {
        id: 'desk-2',
        sender: 'them',
        text: 'Sí, está reservado mientras coordinamos el retiro.',
        createdAt: minutesAgo(220),
        status: 'read',
      },
      {
        id: 'desk-3',
        sender: 'them',
        text: 'Podemos coordinar el retiro el jueves.',
        createdAt: minutesAgo(210),
        status: 'read',
      },
    ],
  },
  {
    id: 'wheelchair-cutral-co',
    postId: 'wheelchair-cutral-co',
    participantId: 'red-cutral-co',
    preview: 'Gracias, aguardamos la confirmación del traslado.',
    updatedAt: daysAgo(1, 18, 5),
    lastSeenAt: daysAgo(1, 19, 10),
    unreadCount: 0,
    archived: false,
    blocked: false,
    reported: false,
    exchangeStatus: 'coordinating',
    messages: [
      {
        id: 'chair-1',
        sender: 'me',
        text: 'Conozco una organización que podría prestar una silla.',
        createdAt: daysAgo(1, 17, 40),
        status: 'read',
      },
      {
        id: 'chair-2',
        sender: 'them',
        text: 'Sería de muchísima ayuda. La necesitamos por unas tres semanas.',
        createdAt: daysAgo(1, 17, 46),
        status: 'read',
      },
      {
        id: 'chair-3',
        sender: 'them',
        text: 'Gracias, aguardamos la confirmación del traslado.',
        createdAt: daysAgo(1, 18, 5),
        status: 'read',
      },
    ],
  },
  {
    id: 'hygiene-kits-industrial',
    postId: 'hygiene-kits-industrial',
    participantId: 'cooperativa-manos',
    preview: 'Quedaron 12 kits disponibles.',
    updatedAt: daysAgo(3, 9, 22),
    lastSeenAt: daysAgo(3, 11, 0),
    unreadCount: 0,
    archived: false,
    blocked: false,
    reported: false,
    exchangeStatus: 'coordinating',
    messages: [
      {
        id: 'kit-1',
        sender: 'me',
        text: 'Hola, colaboro con un merendero de Confluencia.',
        createdAt: daysAgo(3, 9, 10),
        status: 'read',
      },
      {
        id: 'kit-2',
        sender: 'them',
        text: '¡Qué bueno! Quedaron 12 kits disponibles.',
        createdAt: daysAgo(3, 9, 22),
        status: 'read',
      },
    ],
  },
];

export function getMessageThread(threadId: string, threads: MessageThread[] = messageThreads) {
  return threads.find(thread => thread.id === threadId);
}
