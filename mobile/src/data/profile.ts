import { appAuthors, currentUserId } from './authors';

const profile = appAuthors.find(author => author.id === currentUserId);

if (!profile) {
  throw new Error('No se encontró el perfil de demostración');
}

export const currentUser = {
  ...profile,
  id: 'current-user' as const,
  authorId: profile.id,
};
