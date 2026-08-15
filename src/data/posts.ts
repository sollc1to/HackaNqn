// este modulo concentra las publicaciones visibles en la experiencia principal.

export type PostVariant = 'donation' | 'request' | 'urgent';

export type AppPost = {
  // este id permite construir rutas y buscar la publicacion.
  id: string;
  // este titulo representa el contenido principal.
  title: string;
  // esta ubicacion ayuda a contextualizar la card.
  location: string;
  // esta variante define el tono visual.
  variant: PostVariant;
  // esta categoria ayuda a filtrar la publicacion.
  category: 'all' | 'donation' | 'request' | 'urgent';
  // esta descripcion da contexto adicional.
  description: string;
  // este texto describe quien publica.
  author: string;
  // este dato ayuda a entender prioridad o interes.
  meta: string;
  // esta lista sintetiza lo que se necesita o se ofrece.
  highlights: string[];
};

export const appPosts: AppPost[] = [
  {
    id: 'winter-clothes',
    title: 'ropa de invierno para adultos',
    location: 'centro, caba',
    variant: 'donation',
    category: 'donation',
    description: 'abrigo, guantes y buzos listos para entregar a familias de la zona centro.',
    author: 'maria gonzalez',
    meta: 'publicado hoy • 12 interacciones',
    highlights: ['abrigo', 'guantes', 'buzos'],
  },
  {
    id: 'food-boxes',
    title: 'alimentos no perecederos para comedor',
    location: 'flores sur',
    variant: 'request',
    category: 'request',
    description: 'se necesitan cajas para cubrir la semana completa del comedor comunitario.',
    author: 'lucia fernandez',
    meta: 'publicado ayer • 8 ofertas',
    highlights: ['arroz', 'fideos', 'latas', 'agua'],
  },
  {
    id: 'study-desk',
    title: 'escritorio y silla para estudiante',
    location: 'palermo',
    variant: 'donation',
    category: 'donation',
    description: 'mueble en buen estado para uso escolar y teletrabajo en casa.',
    author: 'martin ruiz',
    meta: 'publicado hace 2 dias • 5 consultas',
    highlights: ['escritorio', 'silla', 'uso escolar'],
  },
  {
    id: 'wheelchair',
    title: 'silla de ruedas plegable',
    location: 'belgrano',
    variant: 'urgent',
    category: 'urgent',
    description: 'prioridad alta por una necesidad de movilidad detectada en la comunidad.',
    author: 'ana silva',
    meta: 'urgente • 3 minutos',
    highlights: ['movilidad', 'entrega rapida'],
  },
];

// esta funcion permite recuperar una publicacion por ruta o contexto.
export function getPostById(postId: string) {
  return appPosts.find(post => post.id === postId);
}
