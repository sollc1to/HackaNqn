export type PostKind = 'donation' | 'request';
export type PostCategory = 'food' | 'clothes' | 'health' | 'home';
export type PostStatus = 'active' | 'completed' | 'inactive';

export type AppPost = {
  id: string;
  title: string;
  kind: PostKind;
  urgent: boolean;
  category: PostCategory;
  description: string;
  imageUri: string;
  location: string;
  distanceKm: number;
  author: string;
  authorInitials: string;
  authorImageUri?: string;
  verified: boolean;
  publishedAt: string;
  lastActivity: string;
  quantity: string;
  condition: string;
  delivery: string;
  availability: string;
  meetingPoint: string;
  status: PostStatus;
  completedExchanges: number;
  highlights: string[];
  ownerId?: 'current-user';
};

// Imágenes remotas estables para que el prototipo comunique condición y cantidad.
// En producción deberían venir del servicio de almacenamiento del proyecto.
export const categoryDemoImages: Record<PostCategory, string> = {
  food:
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1000&q=80',
  clothes:
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
  health:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
  home:
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
};

export const appPosts: AppPost[] = [
  {
    id: 'winter-clothes-confluencia',
    title: 'Abrigos de invierno para familias',
    kind: 'donation',
    urgent: false,
    category: 'clothes',
    description: 'Camperas, buzos y guantes limpios, listos para retirar en el barrio.',
    imageUri: categoryDemoImages.clothes,
    location: 'Barrio Confluencia, Neuquén capital',
    distanceKm: 1.8,
    author: 'María González',
    authorInitials: 'MG',
    verified: false,
    publishedAt: 'Hoy, 09:20',
    lastActivity: 'Hace 12 min',
    quantity: '3 bolsas grandes',
    condition: 'Muy buen estado',
    delivery: 'Retiro coordinado',
    availability: 'Lunes a viernes, después de las 17 h',
    meetingPoint: 'Zona del Paseo de la Costa',
    status: 'active',
    completedExchanges: 7,
    highlights: ['Camperas', 'Buzos', 'Guantes'],
    ownerId: 'current-user',
  },
  {
    id: 'completed-food-donation',
    title: 'Caja de alimentos no perecederos',
    kind: 'donation',
    urgent: false,
    category: 'food',
    description: 'Alimentos entregados a un espacio comunitario de la zona oeste de la ciudad.',
    imageUri: categoryDemoImages.food,
    location: 'Neuquén capital, zona oeste',
    distanceKm: 5.4,
    author: 'María González',
    authorInitials: 'MG',
    verified: false,
    publishedAt: '28 de julio',
    lastActivity: 'Completada el 30 de julio',
    quantity: '1 caja grande',
    condition: 'Envases cerrados y vigentes',
    delivery: 'Entrega coordinada',
    availability: 'Entrega completada',
    meetingPoint: 'Zona oeste de Neuquén capital',
    status: 'completed',
    completedExchanges: 7,
    highlights: ['Arroz', 'Fideos', 'Conservas'],
    ownerId: 'current-user',
  },
  {
    id: 'food-boxes-plottier',
    title: 'Alimentos para el comedor del barrio',
    kind: 'request',
    urgent: true,
    category: 'food',
    description: 'Buscamos alimentos no perecederos para sostener las viandas de esta semana.',
    imageUri: categoryDemoImages.food,
    location: 'Plottier, Neuquén',
    distanceKm: 14.2,
    author: 'Comedor Puentes del Limay',
    authorInitials: 'PL',
    verified: true,
    publishedAt: 'Hoy, 08:05',
    lastActivity: 'Activo ahora',
    quantity: '40 módulos alimentarios',
    condition: 'Envases cerrados y vigentes',
    delivery: 'Entrega en la organización',
    availability: 'Todos los días, de 9 a 18 h',
    meetingPoint: 'Centro de Plottier; dirección exacta por mensaje',
    status: 'active',
    completedExchanges: 31,
    highlights: ['Arroz', 'Fideos', 'Conservas', 'Leche larga vida'],
  },
  {
    id: 'study-desk-centenario',
    title: 'Escritorio y silla para estudiar',
    kind: 'donation',
    urgent: false,
    category: 'home',
    description: 'Juego de escritorio compacto, firme y preparado para una segunda vida.',
    imageUri: categoryDemoImages.home,
    location: 'Centenario, Neuquén',
    distanceKm: 15.6,
    author: 'Fundación Horizonte Neuquino',
    authorInitials: 'HN',
    verified: true,
    publishedAt: 'Ayer, 18:40',
    lastActivity: 'Hace 1 h',
    quantity: '1 escritorio y 1 silla',
    condition: 'Buen estado, con marcas de uso',
    delivery: 'Retiro en sede',
    availability: 'Martes y jueves, de 14 a 19 h',
    meetingPoint: 'Zona centro de Centenario',
    status: 'active',
    completedExchanges: 18,
    highlights: ['Escritorio', 'Silla', 'Uso escolar'],
  },
  {
    id: 'wheelchair-cutral-co',
    title: 'Silla de ruedas plegable',
    kind: 'request',
    urgent: true,
    category: 'health',
    description: 'Se necesita de forma temporal para acompañar una recuperación domiciliaria.',
    imageUri: categoryDemoImages.health,
    location: 'Cutral Co, Neuquén',
    distanceKm: 109,
    author: 'Red Comunitaria Cutral Co',
    authorInitials: 'RC',
    verified: true,
    publishedAt: 'Hoy, 10:10',
    lastActivity: 'Hace 4 min',
    quantity: '1 unidad',
    condition: 'Segura y en funcionamiento',
    delivery: 'A coordinar',
    availability: 'Necesidad hasta el 30 de agosto',
    meetingPoint: 'Hospital de Complejidad Media, zona cercana',
    status: 'active',
    completedExchanges: 22,
    highlights: ['Plegable', 'Apoyapiés', 'Uso temporal'],
  },
  {
    id: 'hygiene-kits-industrial',
    title: 'Kits de higiene personal',
    kind: 'donation',
    urgent: false,
    category: 'health',
    description: 'Productos nuevos armados en kits individuales para organizaciones barriales.',
    imageUri:
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1000&q=80',
    location: 'Parque Industrial, Neuquén capital',
    distanceKm: 7.4,
    author: 'Cooperativa Manos del Neuquén',
    authorInitials: 'MN',
    verified: true,
    publishedAt: 'Hace 2 días',
    lastActivity: 'Ayer',
    quantity: '24 kits',
    condition: 'Productos nuevos y cerrados',
    delivery: 'Podemos acercarlos',
    availability: 'Miércoles y viernes, de 10 a 16 h',
    meetingPoint: 'Parque Industrial Este',
    status: 'active',
    completedExchanges: 14,
    highlights: ['Jabón', 'Shampoo', 'Cepillo dental'],
  },
  {
    id: 'school-supplies-neuquen',
    title: 'Útiles para apoyo escolar',
    kind: 'request',
    urgent: false,
    category: 'home',
    description: 'Cuadernos, lápices y mochilas para el espacio de acompañamiento escolar.',
    imageUri:
      'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1000&q=80',
    location: 'Neuquén capital, zona oeste',
    distanceKm: 5.1,
    author: 'Biblioteca Popular El Maitén',
    authorInitials: 'EM',
    verified: true,
    publishedAt: 'Hace 3 días',
    lastActivity: 'Hoy, 08:30',
    quantity: 'Para 15 estudiantes',
    condition: 'Nuevos o en buen estado',
    delivery: 'Entrega en la biblioteca',
    availability: 'Lunes, miércoles y viernes',
    meetingPoint: 'Zona oeste; dirección exacta por mensaje',
    status: 'active',
    completedExchanges: 26,
    highlights: ['Cuadernos', 'Lápices', 'Mochilas'],
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
};

export function getPostById(postId: string, posts: AppPost[] = appPosts) {
  return posts.find(post => post.id === postId);
}
