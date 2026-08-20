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

export const appAuthors: AppAuthor[] = [];

export const currentUserId = '';

export function getAuthorById(authorId: string, authors: AppAuthor[] = appAuthors) {
  return authors.find(author => author.id === authorId);
}
