import { Avatar } from 'react-native-paper';

import { type AppAuthor } from '@/data/authors';

type AuthorAvatarProps = {
  author?: AppAuthor;
  size: number;
  fallbackLabel?: string;
};

export function AuthorAvatar({ author, size, fallbackLabel = 'NS' }: AuthorAvatarProps) {
  if (author?.imageUri) {
    return (
      <Avatar.Image
        size={size}
        source={{ uri: author.imageUri }}
        accessibilityLabel={`Foto de perfil de ${author.name}`}
      />
    );
  }

  return (
    <Avatar.Text
      size={size}
      label={author?.initials ?? fallbackLabel}
      accessibilityLabel={`Avatar de ${author?.name ?? 'Nexo Solidario'}`}
    />
  );
}
