import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { getPostById } from '@/data/posts';

// esta vista muestra el detalle de una publicacion abierta desde el dashboard.
export function PostDetailView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ postId?: string }>();

  // este calculo resuelve la publicacion activa segun la ruta.
  const post = useMemo(() => {
    const id = Array.isArray(params.postId) ? params.postId[0] : params.postId;
    return id ? getPostById(id) : undefined;
  }, [params.postId]);

  if (!post) {
    // este estado evita una pantalla rota si el id no existe.
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              // este boton vuelve al tablero anterior.
              router.back();
            }}
          />
        </View>
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            publicacion no encontrada
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            la publicacion solicitada ya no esta disponible o el enlace es incorrecto.
          </Text>
          <Button
            mode="contained"
            buttonColor={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimary}
            onPress={() => {
              // este boton vuelve a la vista previa del feed.
              router.back();
            }}>
            volver
          </Button>
        </View>
      </View>
    );
  }

  const variantLabel =
    post.variant === 'urgent' ? 'urgente' : post.variant === 'request' ? 'peticion' : 'donacion';

  // este detalle combina hero, metadatos, necesidades y acciones directas.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <IconButton
          icon="arrow-left"
          onPress={() => {
            // este boton retorna al listado desde el detalle.
            router.back();
          }}
        />
        <View style={styles.topBarSpacer} />
        <IconButton icon="share-variant-outline" onPress={() => undefined} />
      </View>

      <View style={styles.content}>
        <Surface style={styles.heroCard} elevation={0}>
          <View style={[styles.heroMedia, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Avatar.Icon
              size={96}
              icon={post.variant === 'urgent' ? 'alert-decagram' : post.variant === 'request' ? 'hand-heart' : 'account-group'}
              color={theme.colors.primaryContainer}
              style={{ backgroundColor: theme.colors.surface }}
            />
          </View>

          <View style={styles.heroCopy}>
            <Chip
              compact
              style={[
                styles.variantChip,
                {
                  backgroundColor:
                    post.variant === 'urgent' ? theme.colors.error : theme.colors.primaryContainer,
                },
              ]}
              textStyle={[styles.variantChipText, { color: theme.colors.onPrimary }]}>
              {variantLabel}
            </Chip>

            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              {post.title}
            </Text>

            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {post.description}
            </Text>
          </View>
        </Surface>

        <Surface style={[styles.metaCard, { backgroundColor: theme.colors.surface }]} elevation={0}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ubicacion
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {post.location}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                autor
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {post.author}
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                actividad
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {post.meta}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            necesita
          </Text>
          <View style={styles.chipsWrap}>
            {post.highlights.map(item => (
              <Chip key={item} compact style={styles.highlightChip} textStyle={styles.highlightChipText}>
                {item}
              </Chip>
            ))}
          </View>
        </Surface>

        <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            proximo paso
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            puedes contactar a la persona que publico, guardar la publicacion o compartirla con otros voluntarios.
          </Text>

          <View style={styles.actions}>
            <Button
              mode="contained"
              buttonColor={theme.colors.primaryContainer}
              textColor={theme.colors.onPrimary}
              onPress={() => {
                // esta ruta abre la conversa asociada a la publicacion.
                router.push('./messages-by-post');
              }}>
              contactar
            </Button>
            <Button mode="outlined" onPress={() => undefined}>
              guardar
            </Button>
          </View>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz organiza header y contenido principal.
  root: {
    flex: 1,
  },
  // este topbar da acceso rapido a volver y compartir.
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  // este spacer mantiene el centro visual.
  topBarSpacer: {
    flex: 1,
  },
  // este contenido sostiene la lectura vertical de la ficha.
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 16,
  },
  // esta tarjeta superior concentra la identidad de la publicacion.
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  // esta media se siente como una portada sin depender de imagen externa.
  heroMedia: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este bloque agrupa titulo, descripcion y estado.
  heroCopy: {
    padding: 16,
    gap: 10,
  },
  // este chip marca el tipo de publicacion.
  variantChip: {
    alignSelf: 'flex-start',
  },
  // este texto del chip mantiene consistencia visual.
  variantChipText: {
    textTransform: 'none',
    fontWeight: '700',
  },
  // este titulo sostiene el foco principal de la pantalla.
  title: {
    fontWeight: '800',
  },
  // esta tarjeta resume metadatos utiles.
  metaCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  // esta fila reparte ubicacion y autor.
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // este bloque hace que cada metadato se lea con claridad.
  metaItem: {
    flex: 1,
    gap: 2,
  },
  // esta tarjeta agrupa los chips de necesidad.
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  // este titulo separa cada bloque de contenido.
  sectionTitle: {
    fontWeight: '800',
  },
  // este wrap ordena los chips en varias lineas.
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // este chip se usa para destacar necesidades.
  highlightChip: {
    backgroundColor: '#EAE8E7',
  },
  // este texto deja el chip limpio y legible.
  highlightChipText: {
    textTransform: 'none',
    fontWeight: '600',
  },
  // estas acciones cierran el flujo con pasos claros.
  actions: {
    gap: 10,
    marginTop: 4,
  },
  // este estado vacio evita confusion cuando la ruta falla.
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
});
