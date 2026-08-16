export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
};

export type MessageThread = {
  id: string;
  postId: string;
  title: string;
  participant: string;
  participantInitials: string;
  participantImageUri: string;
  verified: boolean;
  location: string;
  preview: string;
  timeLabel: string;
  lastSeen: string;
  unreadCount?: number;
  messages: ChatMessage[];
};

export const messageThreads: MessageThread[] = [
  {
    id: 'food-boxes-plottier',
    postId: 'food-boxes-plottier',
    title: 'Alimentos para el comedor del barrio',
    participant: 'Comedor Puentes del Limay',
    participantInitials: 'PL',
    participantImageUri:
      'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=400&q=80',
    verified: true,
    location: 'Plottier',
    preview: 'Sí, recibimos donaciones hasta las 18 h.',
    timeLabel: '14:30',
    lastSeen: 'Activo ahora',
    unreadCount: 2,
    messages: [
      { id: 'food-1', sender: 'me', text: 'Hola, tengo arroz y fideos para donar. ¿Todavía los necesitan?', time: '14:18' },
      { id: 'food-2', sender: 'them', text: '¡Hola, María! Sí, nos vienen muy bien para las viandas de esta semana.', time: '14:24' },
      { id: 'food-3', sender: 'me', text: 'Puedo acercarlos hoy por la tarde.', time: '14:27' },
      { id: 'food-4', sender: 'them', text: 'Sí, recibimos donaciones hasta las 18 h. Te paso el punto exacto al confirmar.', time: '14:30' },
    ],
  },
  {
    id: 'study-desk-centenario',
    postId: 'study-desk-centenario',
    title: 'Escritorio y silla para estudiar',
    participant: 'Fundación Horizonte Neuquino',
    participantInitials: 'HN',
    participantImageUri:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=400&q=80',
    verified: true,
    location: 'Centenario',
    preview: 'Podemos coordinar el retiro el jueves.',
    timeLabel: '11:15',
    lastSeen: 'Activo hace 20 min',
    unreadCount: 1,
    messages: [
      { id: 'desk-1', sender: 'me', text: 'Buenos días. ¿El escritorio sigue disponible?', time: '10:52' },
      { id: 'desk-2', sender: 'them', text: 'Sí, sigue disponible y está reservado para quien pueda retirarlo.', time: '11:02' },
      { id: 'desk-3', sender: 'them', text: 'Podemos coordinar el retiro el jueves.', time: '11:15' },
    ],
  },
  {
    id: 'wheelchair-cutral-co',
    postId: 'wheelchair-cutral-co',
    title: 'Silla de ruedas plegable',
    participant: 'Red Comunitaria Cutral Co',
    participantInitials: 'RC',
    participantImageUri:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80',
    verified: true,
    location: 'Cutral Co',
    preview: 'Gracias, aguardamos la confirmación del traslado.',
    timeLabel: 'Ayer',
    lastSeen: 'Activo ayer',
    messages: [
      { id: 'chair-1', sender: 'me', text: 'Conozco una organización que podría prestar una silla.', time: '17:40' },
      { id: 'chair-2', sender: 'them', text: 'Sería de muchísima ayuda. La necesitamos por unas tres semanas.', time: '17:46' },
      { id: 'chair-3', sender: 'them', text: 'Gracias, aguardamos la confirmación del traslado.', time: '18:05' },
    ],
  },
  {
    id: 'hygiene-kits-industrial',
    postId: 'hygiene-kits-industrial',
    title: 'Kits de higiene personal',
    participant: 'Cooperativa Manos del Neuquén',
    participantInitials: 'MN',
    participantImageUri:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=400&q=80',
    verified: true,
    location: 'Parque Industrial',
    preview: 'Quedaron 12 kits disponibles.',
    timeLabel: 'Vie',
    lastSeen: 'Activo el viernes',
    messages: [
      { id: 'kit-1', sender: 'me', text: 'Hola, colaboro con un merendero de Confluencia.', time: '09:10' },
      { id: 'kit-2', sender: 'them', text: '¡Qué bueno! Quedaron 12 kits disponibles.', time: '09:22' },
    ],
  },
];

export function getMessageThread(threadId: string) {
  return messageThreads.find(thread => thread.id === threadId);
}
