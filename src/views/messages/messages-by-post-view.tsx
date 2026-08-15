import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Badge, IconButton, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

type ThreadStatus = 'unread' | 'read';

type MessageThread = {
  // este id identifica el hilo.
  id: string;
  // este titulo resume el pedido o donacion.
  title: string;
  // este mensaje muestra la ultima interaccion.
  preview: string;
  // este nombre indica quien envio el ultimo mensaje.
  sender: string;
  // este horario mantiene el contexto temporal.
  timeLabel: string;
  // esta cantidad marca mensajes pendientes.
  unreadCount?: number;
  // este icono representa el tipo de publicacion.
  icon: string;
  // este estado define el peso visual del hilo.
  status: ThreadStatus;
};

const threads: MessageThread[] = [
  {
    id: 'medical-supplies',
    title: 'pedido: suministros medicos',
    preview: 'llegamos con los suministros. donde te encuentro?',
    sender: 'carlos',
    timeLabel: '14:30',
    unreadCount: 3,
    icon: 'package-variant-closed',
    status: 'unread',
  },
  {
    id: 'winter-blankets',
    title: 'donacion: mantas de invierno',
    preview: 'acabo de publicar una nueva solicitud de mantas.',
    sender: 'maria',
    timeLabel: '11:15',
    unreadCount: 1,
    icon: 'blanket',
    status: 'unread',
  },
  {
    id: 'wheelchair',
    title: 'donacion: silla de ruedas',
    preview: 'perfecto, nos vemos manana en el centro comunitario.',
    sender: 'javier',
    timeLabel: 'ayer',
    icon: 'wheelchair-accessibility',
    status: 'read',
  },
  {
    id: 'volunteers',
    title: 'voluntariado: zona norte',
    preview: 'necesitamos 3 voluntarios mas para el sabado.',
    sender: 'ana',
    timeLabel: 'mar 12',
    icon: 'hand-heart',
    status: 'read',
  },
  {
    id: 'food-boxes',
    title: 'pedido: alimentos no perecederos',
    preview: 'gracias por la ayuda de ayer, fue fundamental.',
    sender: 'lucia',
    timeLabel: 'mar 10',
    icon: 'food-apple',
    status: 'read',
  },
];

export function MessagesByPostView() {
  const router = useRouter();
  const theme = useTheme();
  // este estado controla el texto del buscador local.
  const [query, setQuery] = useState('');
  // este estado marca la pestaña activa en la barra inferior.
  const [activeNav, setActiveNav] = useState<'home' | 'create' | 'messages'>('messages');

  // este calculo reduce la lista a los hilos que coinciden con el texto.
  const visibleThreads = useMemo(
    () =>
      threads.filter(thread => {
        const text = `${thread.title} ${thread.preview} ${thread.sender}`.toLowerCase();
        return query.trim().length === 0 || text.includes(query.toLowerCase());
      }),
    [query],
  );

  // esta vista organiza los mensajes por publicacion con una jerarquia de lista limpia.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.background }]} elevation={0}>
        <TouchableRipple borderless onPress={() => setActiveNav('home')} style={styles.headerIconButton}>
          <Avatar.Icon size={36} icon="hand-heart" color={theme.colors.primaryContainer} style={{ backgroundColor: 'transparent' }} />
        </TouchableRipple>

        <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.primaryContainer }]}>
          red solidaria
        </Text>

        <TouchableRipple borderless onPress={() => undefined} style={styles.headerProfileButton}>
          <Avatar.Text size={40} label="U" color={theme.colors.onPrimary} style={{ backgroundColor: theme.colors.primaryContainer }} />
        </TouchableRipple>
      </Surface>

      <View style={styles.body}>
        <View style={styles.searchBlock}>
          <TextInput
            mode="outlined"
            placeholder="buscar mensajes..."
            value={query}
            onChangeText={text => {
              // este cambio actualiza el filtro local sin recargar la vista.
              setQuery(text);
            }}
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primaryContainer}
            left={<TextInput.Icon icon="magnify" />}
          />
        </View>

        <View style={styles.sectionTitleWrap}>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            mensajes
          </Text>
        </View>

        <View style={styles.threadList}>
          {visibleThreads.map(thread => {
            const isUnread = thread.status === 'unread';

            return (
              <TouchableRipple key={thread.id} borderless onPress={() => undefined} style={styles.threadRipple}>
                  <Surface
                  style={[
                    styles.threadCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  elevation={0}>
                  <View style={styles.threadAvatarWrap}>
                    <View
                    style={[
                      styles.threadAvatar,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: theme.colors.outlineVariant,
                        },
                      ]}>
                      <IconButton icon={thread.icon} size={28} iconColor={theme.colors.primaryContainer} />
                    </View>
                    <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isUnread ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                        borderColor: theme.colors.surface,
                      },
                    ]}
                  />
                  </View>

                  <View style={styles.threadBody}>
                    <View style={styles.threadTitleRow}>
                      <Text
                        variant="titleSmall"
                        style={[
                          styles.threadTitle,
                          { color: theme.colors.onSurface, fontWeight: isUnread ? '700' : '600' },
                        ]}
                        numberOfLines={1}>
                        {thread.title}
                      </Text>
                      <Text variant="labelSmall" style={[styles.time, { color: theme.colors.primaryContainer }]}>
                        {thread.timeLabel}
                      </Text>
                    </View>

                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.threadPreview,
                        { color: isUnread ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                      ]}
                      numberOfLines={1}>
                      <Text style={{ color: theme.colors.primaryContainer, fontWeight: '700' }}>{thread.sender}: </Text>
                      {thread.preview}
                    </Text>
                  </View>

                  <View style={styles.threadMeta}>
                    {typeof thread.unreadCount === 'number' ? (
                      <Badge size={24} style={styles.unreadBadge}>
                        {thread.unreadCount}
                      </Badge>
                    ) : null}
                  </View>
                </Surface>
              </TouchableRipple>
            );
          })}
        </View>
      </View>

      <Surface style={[styles.nav, { backgroundColor: theme.colors.background }]} elevation={2}>
        <TouchableRipple
          onPress={() => {
            // esta ruta vuelve al tablero principal.
            setActiveNav('home');
            router.push('./dashboard');
          }}
          style={styles.navItem}>
          <View style={styles.navItemContent}>
            <MaterialCommunityIcons name="home-outline" size={24} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={styles.navLabel}>
              inicio
            </Text>
          </View>
        </TouchableRipple>

        <TouchableRipple
          onPress={() => {
            // esta ruta abre el flujo de creacion de una publicacion.
            setActiveNav('create');
            router.push('./create-post');
          }}
          style={styles.navItemCenter}>
          <View style={[styles.fabWrap, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.onPrimary} />
          </View>
          <Text variant="labelSmall" style={[styles.navLabel, styles.hiddenLabel]}>
            agregar
          </Text>
        </TouchableRipple>

        <TouchableRipple
          onPress={() => {
            // este toque solo refuerza el estado activo del tab actual.
            setActiveNav('messages');
          }}
          style={styles.navItem}>
          <View style={styles.navItemContentActive}>
            <MaterialCommunityIcons name="chat" size={24} color={theme.colors.onPrimary} />
            <Text variant="labelSmall" style={[styles.navLabel, { color: theme.colors.onPrimary }]}>
              mensajes
            </Text>
          </View>
        </TouchableRipple>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz reparte el contenido y la barra inferior.
  root: {
    flex: 1,
  },
  // este encabezado conserva una composicion simple y centrada.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  // este boton abre el menu o vuelve a la seccion principal.
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este titulo sostiene la identidad de la app.
  headerTitle: {
    fontWeight: '800',
  },
  // este avatar marca acceso al perfil.
  headerProfileButton: {
    borderRadius: 999,
  },
  // este cuerpo sostiene la busqueda y la lista.
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 80,
  },
  // esta zona mantiene el campo de busqueda en primer plano.
  searchBlock: {
    marginBottom: 18,
  },
  // este titulo separa la cabecera de la lista.
  sectionTitleWrap: {
    marginBottom: 12,
  },
  // este titulo sostiene la jerarquia de la pantalla.
  sectionTitle: {
    fontWeight: '800',
  },
  // esta lista agrupa los hilos con espaciado minimo.
  threadList: {
    gap: 8,
  },
  // este ripple da feedback tactil por fila.
  threadRipple: {
    borderRadius: 16,
  },
  // esta card replica el estilo del listado del mock.
  threadCard: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  // este wrap contiene el icono y el punto de estado.
  threadAvatarWrap: {
    width: 56,
    height: 56,
  },
  // este bloque contiene el avatar de la conversacion.
  threadAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este punto marca actividad no leida.
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  // este bloque agrupa titulo y preview.
  threadBody: {
    flex: 1,
    gap: 4,
  },
  // esta fila separa titulo de fecha.
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  // este titulo debe truncarse sin romper el layout.
  threadTitle: {
    flex: 1,
  },
  // esta fecha se mantiene compacta.
  time: {
    fontWeight: '700',
  },
  // este preview da contexto rapido al hilo.
  threadPreview: {
    flexShrink: 1,
  },
  // esta columna final contiene badge o espaciado.
  threadMeta: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // este badge marca cuantos mensajes quedan sin leer.
  unreadBadge: {
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // esta barra inferior replica la navegacion del mock.
  nav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D9D6D6',
  },
  // este item concentra el boton de inicio y mensajes.
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  // este item central sostiene el boton flotante.
  navItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  // este contenedor crea el estado activo del item de mensajes.
  navItemContentActive: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
  },
  // este contenedor mantiene el estilo de los items inactivos.
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este circulo da presencia al boton principal.
  fabWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // esta etiqueta desaparece visualmente en el boton central.
  hiddenLabel: {
    opacity: 0,
    height: 0,
  },
  // esta etiqueta mantiene una lectura sobria en la barra.
  navLabel: {
    marginTop: 2,
    fontWeight: '600',
  },
});
