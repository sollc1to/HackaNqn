import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Badge, IconButton, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { AppBottomNav, CategoryChip, PostCard } from '@/components';
import { appPosts } from '@/data/posts';

type FilterKey = 'all' | 'donation' | 'request' | 'urgent';
type NavKey = 'home' | 'publish' | 'messages';

const filters: Array<{ key: FilterKey; label: string; icon?: string }> = [
  { key: 'all', label: 'Todos', icon: 'filter-variant' },
  { key: 'donation', label: 'Donaciones' },
    { key: 'request', label: 'Peticiones' },
  { key: 'urgent', label: 'Urgente' },
];

export function DashboardView() {
  const router = useRouter();
  const theme = useTheme();
  // este estado guarda la busqueda que filtra el feed visible.
  const [query, setQuery] = useState('');
  // este estado mantiene la categoria activa del tablero.
  const [filter, setFilter] = useState<FilterKey>('all');
  // este estado sincroniza la pestaña resaltada en la barra inferior.
  const [activeNav, setActiveNav] = useState<NavKey>('home');

  // este calculo reduce la lista a lo que coincide con busqueda y categoria.
  const visiblePosts = appPosts.filter(post => {
    const matchesFilter = filter === 'all' ? true : post.category === filter;
    const matchesQuery =
      query.trim().length === 0 ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.location.toLowerCase().includes(query.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  // esta pantalla organiza descubrimiento, filtros y acceso rapido a publicaciones.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <TouchableRipple
            borderless
            style={styles.brandIconButton}
            onPress={() => {
              // este toque refuerza la vuelta al inicio sin cambiar de pantalla.
              setActiveNav('home');
            }}>
            <Avatar.Icon size={36} icon="hand-heart" color={theme.colors.onPrimary} style={{ backgroundColor: theme.colors.primaryContainer }} />
          </TouchableRipple>
          <Text variant="titleLarge" style={[styles.brand, { color: theme.colors.primaryContainer }]}>
            red solidaria
          </Text>
        </View>

        <View style={styles.profileWrap}>
          <TouchableRipple
            borderless
            onPress={() => {
              // esta ruta lleva al perfil y datos personales.
              router.push('./personal-data');
            }}>
            <View style={styles.profileButton}>
              <Avatar.Text size={40} label="MG" style={{ backgroundColor: theme.colors.surfaceVariant }} />
              <Badge size={8} style={styles.profileBadge} />
            </View>
          </TouchableRipple>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.searchBlock}>
          <TouchableRipple
            onPress={() => {
              // esta accion abre la pantalla dedicada a buscar y filtrar.
              router.push('./search');
            }}
            style={styles.searchRipple}
            borderless>
            <Surface
              style={[
                styles.searchSurface,
                {
                  borderColor: theme.colors.outlineVariant,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              elevation={0}>
              <IconButton icon="magnify" size={20} iconColor={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
              <Text variant="bodyLarge" style={[styles.searchText, { color: theme.colors.onSurfaceVariant }]}>
                {query.length > 0 ? query : 'buscar ayuda o donaciones...'}
              </Text>
              {query.length > 0 ? (
                <IconButton
                  icon="close"
                  size={18}
                  iconColor={theme.colors.onSurfaceVariant}
                  onPress={() => {
                    // este boton limpia la busqueda local sin salir del dashboard.
                    setQuery('');
                  }}
                  style={styles.searchClear}
                />
              ) : null}
            </Surface>
          </TouchableRipple>
        </View>

        <View style={styles.filters}>
          {filters.map(item => (
            <CategoryChip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              icon={item.icon}
              onPress={() => {
                // este chip ajusta el filtro principal del feed.
                setFilter(item.key);
              }}
            />
          ))}
        </View>

        <View style={styles.highlightRow}>
          <View style={styles.highlightCopy}>
            <Text variant="titleMedium" style={[styles.highlightTitle, { color: theme.colors.onSurface }]}>
              comunidad activa hoy
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              publicaciones nuevas y urgentes para responder rapido.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {visiblePosts.map(post => (
            <View key={post.id} style={styles.gridItem}>
              <PostCard
                title={post.title}
                location={post.location}
                variant={post.variant}
                description={post.description}
                onPress={() => {
                  // cada card abre el detalle de la publicacion elegida.
                  router.push((`/post/${post.id}` as never));
                }}
                emptyMediaIcon={
                  <Avatar.Icon
                    size={48}
                    icon={post.variant === 'urgent' ? 'alert-decagram' : post.variant === 'request' ? 'food' : 'account-group'}
                    color={theme.colors.primaryContainer}
                    style={{ backgroundColor: theme.colors.surface }}
                  />
                }
              />
            </View>
          ))}
        </View>
      </View>

      <AppBottomNav
        activeKey={activeNav}
        onChange={key => {
          // este manejador mantiene la barra sincronizada con cada ruta.
          setActiveNav(key as NavKey);

          if (key === 'publish') {
            // este destino lleva al formulario de alta de publicaciones.
            router.push('./create-post');
            return;
          }

          if (key === 'messages') {
            // este destino lleva a los mensajes agrupados por publicacion.
            router.push('./messages-by-post');
          }
        }}
        items={[
          {
            key: 'home',
            label: 'inicio',
            icon: 'home',
          },
          {
            key: 'publish',
            label: 'publicar',
            icon: 'plus-circle-outline',
          },
          {
            key: 'messages',
            label: 'mensajes',
            badge: true,
            icon: 'chat-outline',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz organiza header, contenido y barra inferior.
  root: {
    flex: 1,
  },
  // este encabezado replica la lectura compacta del dashboard original.
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  // este bloque agrupa icono y marca.
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // este boton mantiene el icono con una zona de toque clara.
  brandIconButton: {
    borderRadius: 999,
  },
  // esta marca da la sensacion de identidad fuerte.
  brand: {
    fontWeight: '800',
  },
  // este bloque sostiene el avatar del perfil y el indicador.
  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este boton acompana el avatar sin recargarlo.
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este punto marca actividad o notificacion pendiente.
  profileBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
  },
  // este bloque central mantiene el contenido desplazable.
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  // esta seccion controla la busqueda.
  searchBlock: {
    marginTop: 2,
  },
  // este ripple hace que la barra se comporte como acceso directo.
  searchRipple: {
    borderRadius: 28,
  },
  // esta superficie mantiene la estetica de campo de busqueda.
  searchSurface: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  // este icono fija la lectura de busqueda.
  searchIcon: {
    margin: 0,
  },
  // este texto reemplaza el comportamiento de input por una entrada tactil.
  searchText: {
    flex: 1,
  },
  // este boton limpia el texto actual sin salir de la pantalla.
  searchClear: {
    margin: 0,
  },
  // este grupo permite desplazar filtros sin romper la grilla.
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // este bloque agrega una pieza editorial corta como en el diseño.
  highlightRow: {
    paddingTop: 2,
  },
  // este copy crea jerarquia antes de la grilla.
  highlightCopy: {
    gap: 4,
  },
  // este titulo anticipa la actividad del feed.
  highlightTitle: {
    fontWeight: '800',
  },
  // esta grilla muestra las cards en dos columnas.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 8,
  },
  // este item define el ancho de cada card.
  gridItem: {
    width: '48%',
  },
});
