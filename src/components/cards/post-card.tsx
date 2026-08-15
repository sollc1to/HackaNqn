import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';

export type PostCardVariant = 'donation' | 'request' | 'urgent';

type PostCardProps = {
  // este titulo resume el contenido principal de la card.
  title: string;
  // esta ubicacion ayuda a contextualizar la publicacion.
  location: string;
  // esta variante define el estilo de prioridad.
  variant?: PostCardVariant;
  // esta imagen opcional representa el contenido de la publicacion.
  imageUri?: string;
  // este texto complementario puede usarse como detalle extra.
  description?: string;
  // este nodo opcional reemplaza la media cuando no hay imagen.
  emptyMediaIcon?: ReactNode;
  // esta accion se ejecuta al tocar la card.
  onPress?: () => void;
};

export function PostCard({
  title,
  location,
  variant = 'donation',
  imageUri,
  description,
  emptyMediaIcon,
  onPress,
}: PostCardProps) {
  const theme = useTheme();

  const badgeLabel = variant === 'urgent' ? 'urgente' : variant === 'request' ? 'peticion' : 'donacion';
  const badgeBackground =
    variant === 'urgent'
      ? theme.colors.error
      : variant === 'request'
        ? theme.colors.tertiaryContainer
        : theme.colors.primaryContainer;
  const badgeTextColor = variant === 'urgent' ? theme.colors.onError : theme.colors.onPrimary;

  // esta card cubre el patron principal de feed y grillas.
  return (
    <Card style={styles.card} mode="outlined" onPress={onPress}>
      {imageUri ? (
        <Card.Cover source={{ uri: imageUri }} style={styles.cover} />
      ) : (
        <View style={[styles.mediaPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          {emptyMediaIcon ?? (
            <Avatar.Icon
              size={40}
              icon="hand-heart"
              color={theme.colors.primary}
              style={{ backgroundColor: theme.colors.surface }}
            />
          )}
        </View>
      )}

      <View style={styles.badgeWrap}>
        <Chip style={[styles.badge, { backgroundColor: badgeBackground }]} textStyle={[styles.badgeText, { color: badgeTextColor }]}>
          {badgeLabel}
        </Chip>
      </View>

      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>

        {description ? (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}

        <View style={styles.locationRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {location}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  // esta card respeta el radio y la separacion del diseño base.
  card: {
    overflow: 'hidden',
  },
  // esta imagen mantiene una altura estable en grillas.
  cover: {
    height: 132,
  },
  // este estado vacio evita espacios rotos cuando no hay imagen.
  mediaPlaceholder: {
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este chip se superpone sobre la media.
  badgeWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  // este badge mantiene un peso visual leve.
  badge: {
    minHeight: 28,
  },
  // este texto del badge usa minúsculas como en el sistema visual.
  badgeText: {
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  // este contenido usa paddings simples y faciles de leer.
  content: {
    paddingTop: 12,
    paddingBottom: 14,
    gap: 6,
  },
  // este titulo controla la jerarquia de la card.
  title: {
    fontWeight: '700',
  },
  // esta descripcion queda disponible para cards mas ricas.
  description: {
    marginTop: 2,
  },
  // esta fila prepara el espacio para el indicador de ubicacion.
  locationRow: {
    marginTop: 2,
  },
});
