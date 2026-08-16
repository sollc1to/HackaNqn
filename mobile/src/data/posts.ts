import type { ImageSource } from 'expo-image';

export type PostKind = 'donation' | 'request';
export type PostCategory =
  | 'food'
  | 'clothes'
  | 'health'
  | 'home'
  | 'school'
  | 'furniture'
  | 'volunteering';
export type PostStatus = 'available' | 'reserved' | 'completed' | 'paused';
export type DeliveryMethod = 'coordinate' | 'can-deliver';
export type ArticleCondition = 'new' | 'very-good' | 'good';
export type DemoImageKey = 'clothes' | 'food' | 'desk' | 'hygiene' | 'school' | 'wheelchair';

export type PostImage =
  | { id: string; kind: 'asset'; assetKey: DemoImageKey; alt: string }
  | { id: string; kind: 'uri'; uri: string; alt: string };

export type PostLocation = {
  label: string;
  locality: 'Neuquén capital' | 'Plottier' | 'Centenario' | 'Cutral Co';
  neighborhood?: string;
  latitude: number;
  longitude: number;
};

export type AppPost = {
  id: string;
  title: string;
  kind: PostKind;
  category: PostCategory;
  description: string;
  images: PostImage[];
  location: PostLocation;
  /** Solo se muestra cuando proviene de un cálculo real de geolocalización. */
  distanceKm?: number;
  authorId: string;
  publishedAt: string;
  updatedAt: string;
  quantity: number;
  quantityUnit: string;
  condition?: ArticleCondition;
  delivery: DeliveryMethod;
  availability: string;
  deadline?: string;
  meetingPoint: string;
  status: PostStatus;
  interestedUserIds: string[];
  ownerId?: 'current-user';
};

const demoImageSources: Record<DemoImageKey, ImageSource> = {
  clothes: require('../../assets/images/posts/abrigos-neuquen.jpg'),
  food: require('../../assets/images/posts/alimentos-neuquen.jpg'),
  desk: require('../../assets/images/posts/escritorio-neuquen.jpg'),
  hygiene: require('../../assets/images/posts/higiene-neuquen.jpg'),
  school: require('../../assets/images/posts/utiles-neuquen.jpg'),
  wheelchair: require('../../assets/images/posts/silla-ruedas-neuquen.jpg'),
};

export const fallbackPostImage = require('../../assets/images/nexo-icon.png');

export function getPostImageSource(image?: PostImage): ImageSource {
  if (!image) return fallbackPostImage;
  return image.kind === 'asset' ? demoImageSources[image.assetKey] : { uri: image.uri };
}

function isoFromNow({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }) {
  const value = new Date();
  value.setSeconds(0, 0);
  value.setDate(value.getDate() - days);
  value.setHours(value.getHours() - hours);
  value.setMinutes(value.getMinutes() - minutes);
  return value.toISOString();
}

function demoImages(primary: DemoImageKey, secondary?: DemoImageKey): PostImage[] {
  const images: PostImage[] = [
    { id: `${primary}-main`, kind: 'asset', assetKey: primary, alt: `Vista general de ${primary}` },
  ];
  if (secondary) {
    images.push({ id: `${secondary}-detail`, kind: 'asset', assetKey: secondary, alt: 'Vista complementaria' });
  }
  return images;
}

export const appPosts: AppPost[] = [
  {
    id: 'winter-clothes-confluencia',
    title: 'Abrigos de invierno para familias',
    kind: 'donation',
    category: 'clothes',
    description: 'Camperas y buzos limpios, listos para coordinar con una familia de la zona.',
    images: demoImages('clothes'),
    location: {
      label: 'Barrio Confluencia, Neuquén capital',
      locality: 'Neuquén capital',
      neighborhood: 'Confluencia',
      latitude: -38.9632,
      longitude: -68.0341,
    },
    authorId: 'maria-gonzalez',
    publishedAt: isoFromNow({ minutes: 42 }),
    updatedAt: isoFromNow({ minutes: 12 }),
    quantity: 3,
    quantityUnit: 'bolsas',
    condition: 'very-good',
    delivery: 'coordinate',
    availability: 'Lunes a viernes después de las 17 h',
    meetingPoint: 'Zona del Paseo de la Costa',
    status: 'available',
    interestedUserIds: ['lucas-rojas', 'ana-mella'],
    ownerId: 'current-user',
  },
  {
    id: 'completed-food-donation',
    title: 'Caja de alimentos no perecederos',
    kind: 'donation',
    category: 'food',
    description: 'Alimentos cerrados que fueron entregados a un espacio comunitario de la zona oeste.',
    images: demoImages('food'),
    location: {
      label: 'Zona oeste, Neuquén capital',
      locality: 'Neuquén capital',
      neighborhood: 'San Lorenzo',
      latitude: -38.9497,
      longitude: -68.1012,
    },
    authorId: 'maria-gonzalez',
    publishedAt: isoFromNow({ days: 19 }),
    updatedAt: isoFromNow({ days: 17 }),
    quantity: 1,
    quantityUnit: 'caja',
    condition: 'new',
    delivery: 'can-deliver',
    availability: 'Intercambio finalizado',
    meetingPoint: 'Zona oeste de Neuquén capital',
    status: 'completed',
    interestedUserIds: ['comedor-puentes'],
    ownerId: 'current-user',
  },
  {
    id: 'food-boxes-plottier',
    title: 'Alimentos para el comedor del barrio',
    kind: 'request',
    category: 'food',
    description: 'Buscamos alimentos no perecederos cerrados para sostener las viandas de esta semana.',
    images: demoImages('food', 'hygiene'),
    location: {
      label: 'Centro de Plottier, Neuquén',
      locality: 'Plottier',
      latitude: -38.9527,
      longitude: -68.2299,
    },
    authorId: 'comedor-puentes',
    publishedAt: isoFromNow({ hours: 2 }),
    updatedAt: isoFromNow({ minutes: 4 }),
    quantity: 40,
    quantityUnit: 'módulos',
    delivery: 'can-deliver',
    availability: 'Todos los días de 9 a 18 h',
    deadline: isoFromNow({ days: -8 }),
    meetingPoint: 'Centro de Plottier; el punto exacto se comparte por mensaje',
    status: 'available',
    interestedUserIds: ['maria-gonzalez', 'lucas-rojas', 'ana-mella'],
  },
  {
    id: 'study-desk-centenario',
    title: 'Escritorio y silla para estudiar',
    kind: 'donation',
    category: 'furniture',
    description: 'Juego de escritorio compacto, firme y preparado para una segunda vida.',
    images: demoImages('desk', 'school'),
    location: {
      label: 'Centro de Centenario, Neuquén',
      locality: 'Centenario',
      latitude: -38.8296,
      longitude: -68.1318,
    },
    authorId: 'fundacion-horizonte',
    publishedAt: isoFromNow({ days: 1, hours: 3 }),
    updatedAt: isoFromNow({ hours: 1 }),
    quantity: 2,
    quantityUnit: 'unidades',
    condition: 'good',
    delivery: 'coordinate',
    availability: 'Martes y jueves de 14 a 19 h',
    meetingPoint: 'Zona centro de Centenario',
    status: 'reserved',
    interestedUserIds: ['maria-gonzalez', 'ana-mella'],
  },
  {
    id: 'wheelchair-cutral-co',
    title: 'Silla de ruedas plegable',
    kind: 'request',
    category: 'health',
    description: 'Se necesita de forma temporal para acompañar una recuperación domiciliaria.',
    images: demoImages('wheelchair'),
    location: {
      label: 'Zona centro, Cutral Co',
      locality: 'Cutral Co',
      latitude: -38.9397,
      longitude: -69.2303,
    },
    authorId: 'red-cutral-co',
    publishedAt: isoFromNow({ minutes: 28 }),
    updatedAt: isoFromNow({ minutes: 4 }),
    quantity: 1,
    quantityUnit: 'unidad',
    delivery: 'coordinate',
    availability: 'Necesidad temporal durante tres semanas',
    deadline: isoFromNow({ days: -14 }),
    meetingPoint: 'Zona cercana al hospital; punto exacto por mensaje',
    status: 'available',
    interestedUserIds: ['lucas-rojas'],
  },
  {
    id: 'hygiene-kits-industrial',
    title: 'Kits de higiene personal',
    kind: 'donation',
    category: 'health',
    description: 'Productos nuevos armados en kits individuales para organizaciones barriales.',
    images: demoImages('hygiene'),
    location: {
      label: 'Parque Industrial, Neuquén capital',
      locality: 'Neuquén capital',
      neighborhood: 'Parque Industrial',
      latitude: -38.9034,
      longitude: -68.0713,
    },
    authorId: 'cooperativa-manos',
    publishedAt: isoFromNow({ days: 2 }),
    updatedAt: isoFromNow({ days: 1 }),
    quantity: 24,
    quantityUnit: 'kits',
    condition: 'new',
    delivery: 'can-deliver',
    availability: 'Miércoles y viernes de 10 a 16 h',
    meetingPoint: 'Parque Industrial Este',
    status: 'available',
    interestedUserIds: ['maria-gonzalez'],
  },
  {
    id: 'school-supplies-neuquen',
    title: 'Útiles para apoyo escolar',
    kind: 'request',
    category: 'school',
    description: 'Buscamos cuadernos, lápices y mochilas para el espacio de acompañamiento escolar.',
    images: demoImages('school', 'desk'),
    location: {
      label: 'Zona oeste, Neuquén capital',
      locality: 'Neuquén capital',
      neighborhood: 'Gran Neuquén',
      latitude: -38.9539,
      longitude: -68.1178,
    },
    authorId: 'biblioteca-maiten',
    publishedAt: isoFromNow({ days: 3 }),
    updatedAt: isoFromNow({ hours: 2 }),
    quantity: 15,
    quantityUnit: 'estudiantes',
    delivery: 'can-deliver',
    availability: 'Lunes, miércoles y viernes',
    meetingPoint: 'Zona oeste; punto exacto por mensaje',
    status: 'available',
    interestedUserIds: ['ana-mella'],
  },
];

export const postKindLabel: Record<PostKind, string> = {
  donation: 'Donación',
  request: 'Solicitud',
};

export const postCategoryLabel: Record<PostCategory, string> = {
  food: 'Alimentos',
  clothes: 'Ropa',
  health: 'Salud',
  home: 'Hogar',
  school: 'Útiles escolares',
  furniture: 'Muebles',
  volunteering: 'Voluntariado',
};

export const postStatusLabel: Record<PostStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  completed: 'Completada',
  paused: 'Pausada',
};

export const deliveryLabel: Record<DeliveryMethod, string> = {
  coordinate: 'A coordinar',
  'can-deliver': 'Puedo acercarlo',
};

export const conditionLabel: Record<ArticleCondition, string> = {
  new: 'Nuevo',
  'very-good': 'Muy buen estado',
  good: 'Buen estado',
};

export function formatPostQuantity(post: Pick<AppPost, 'quantity' | 'quantityUnit'>) {
  return `${post.quantity.toLocaleString('es-AR')} ${post.quantityUnit}`;
}

export function getPostById(postId: string, posts: AppPost[] = appPosts) {
  return posts.find(post => post.id === postId);
}
