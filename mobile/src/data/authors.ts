export type AccountType = 'person' | 'organization';

export type UserReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AppAuthor = {
  id: string;
  name: string;
  initials: string;
  imageUri?: string;
  accountType: AccountType;
  bio: string;
  location: string;
  memberSince: string;
  completedExchanges: number;
  verified: boolean;
  identityConfirmed: boolean;
  verificationStatus?: 'not-requested' | 'pending' | 'verified';
  rating: number;
  reviewCount: number;
  reviews: UserReview[];
  email?: string;
  phone?: string;
};

function monthsAgo(months: number) {
  const value = new Date();
  value.setMonth(value.getMonth() - months);
  return value.toISOString();
}

const sharedReviews: UserReview[] = [
  {
    id: 'review-1',
    authorName: 'Lucía R.',
    rating: 5,
    comment: 'Coordinación clara y puntual. La entrega coincidió con la publicación.',
    createdAt: monthsAgo(1),
  },
  {
    id: 'review-2',
    authorName: 'Carlos M.',
    rating: 4,
    comment: 'Muy buena comunicación y trato respetuoso.',
    createdAt: monthsAgo(2),
  },
];

export const appAuthors: AppAuthor[] = [
  {
    id: 'maria-gonzalez',
    name: 'María González',
    initials: 'MG',
    accountType: 'person',
    bio: 'Vecina de Confluencia. Publico objetos en buen estado para que sigan siendo útiles.',
    location: 'Barrio Confluencia, Neuquén capital',
    memberSince: monthsAgo(6),
    completedExchanges: 7,
    verified: false,
    identityConfirmed: true,
    verificationStatus: 'not-requested',
    rating: 4.8,
    reviewCount: 6,
    reviews: sharedReviews,
    email: 'maria.gonzalez@nexo.demo',
    phone: '+54 299 555-0147',
  },
  {
    id: 'comedor-puentes',
    name: 'Comedor Puentes del Limay',
    initials: 'PL',
    accountType: 'organization',
    bio: 'Comedor comunitario ficticio de Plottier usado para demostrar el flujo del MVP.',
    location: 'Plottier, Neuquén',
    memberSince: monthsAgo(15),
    completedExchanges: 31,
    verified: true,
    identityConfirmed: true,
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 24,
    reviews: sharedReviews,
  },
  {
    id: 'fundacion-horizonte',
    name: 'Fundación Horizonte Neuquino',
    initials: 'HN',
    accountType: 'organization',
    bio: 'Organización ficticia de Centenario orientada al acompañamiento educativo.',
    location: 'Centenario, Neuquén',
    memberSince: monthsAgo(10),
    completedExchanges: 18,
    verified: true,
    identityConfirmed: true,
    verificationStatus: 'verified',
    rating: 4.7,
    reviewCount: 15,
    reviews: sharedReviews,
  },
  {
    id: 'red-cutral-co',
    name: 'Red Comunitaria Cutral Co',
    initials: 'RC',
    accountType: 'organization',
    bio: 'Red vecinal ficticia para conectar necesidades temporales con recursos de la comunidad.',
    location: 'Cutral Co, Neuquén',
    memberSince: monthsAgo(12),
    completedExchanges: 22,
    verified: true,
    identityConfirmed: true,
    verificationStatus: 'verified',
    rating: 4.8,
    reviewCount: 19,
    reviews: sharedReviews,
  },
  {
    id: 'cooperativa-manos',
    name: 'Cooperativa Manos del Neuquén',
    initials: 'MN',
    accountType: 'organization',
    bio: 'Cooperativa ficticia del Parque Industrial que articula donaciones con espacios barriales.',
    location: 'Parque Industrial, Neuquén capital',
    memberSince: monthsAgo(9),
    completedExchanges: 14,
    verified: true,
    identityConfirmed: true,
    verificationStatus: 'verified',
    rating: 4.6,
    reviewCount: 11,
    reviews: sharedReviews,
  },
  {
    id: 'biblioteca-maiten',
    name: 'Biblioteca Popular El Maitén',
    initials: 'EM',
    accountType: 'organization',
    bio: 'Biblioteca ficticia de la zona oeste con actividades de apoyo escolar.',
    location: 'Zona oeste, Neuquén capital',
    memberSince: monthsAgo(14),
    completedExchanges: 26,
    verified: true,
    identityConfirmed: true,
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 21,
    reviews: sharedReviews,
  },
];

export const currentUserId = 'maria-gonzalez';

export function getAuthorById(authorId: string, authors: AppAuthor[] = appAuthors) {
  return authors.find(author => author.id === authorId);
}
