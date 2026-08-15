import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { CategoryChip, MyPostItem, SegmentedControl } from '@/components';

type PostStateFilter = 'all' | 'active' | 'completed' | 'inactive';

type MyPostRecord = {
  // este id ayuda a renderizar la lista de forma estable.
  id: string;
  // este titulo representa la publicacion visible.
  title: string;
  // este subtitulo da contexto rapido al post.
  subtitle: string;
  // este meta muestra la actividad asociada.
  meta: string;
  // este tipo distingue oferta de pedido.
  postType: 'offer' | 'request';
  // este estado define el filtro y el tono visual.
  status: Exclude<PostStateFilter, 'all'>;
  // este icono acompana la miniatura.
  icon: string;
};

const records: MyPostRecord[] = [
  {
    id: 'winter-clothes',
    title: 'winter clothes for family of 4',
    subtitle: 'request',
    meta: 'posted oct 12 • 3 offers',
    postType: 'request',
    status: 'active',
    icon: 'tshirt-crew',
  },
  {
    id: 'food-box',
    title: 'box of non-perishable food',
    subtitle: 'offer',
    meta: 'posted sep 28 • claimed',
    postType: 'offer',
    status: 'completed',
    icon: 'food-apple',
  },
  {
    id: 'books-toys',
    title: "children's books and educational toys",
    subtitle: 'offer',
    meta: 'posted today • 0 requests',
    postType: 'offer',
    status: 'active',
    icon: 'bookshelf',
  },
];

export function MyPostsView() {
  const router = useRouter();
  const theme = useTheme();
  const [filter, setFilter] = useState<PostStateFilter>('all');

  const visibleRecords = useMemo(
    () => records.filter(record => filter === 'all' || record.status === filter),
    [filter],
  );

  // esta pantalla concentra el control de publicaciones propias.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.background }]} elevation={0}>
        <View style={styles.headerLeft}>
          <TouchableRipple borderless onPress={() => router.back()} style={styles.iconButton}>
            <Avatar.Icon
              size={36}
              icon="arrow-left"
              color={theme.colors.onSurface}
              style={{ backgroundColor: 'transparent' }}
            />
          </TouchableRipple>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            my posts
          </Text>
        </View>

        <TouchableRipple borderless onPress={() => router.push('./personal-data')} style={styles.profileButton}>
          <Avatar.Icon
            size={36}
            icon="account-circle-outline"
            color={theme.colors.onSurface}
            style={{ backgroundColor: 'transparent' }}
          />
        </TouchableRipple>
      </Surface>

      <View style={styles.content}>
        <SegmentedControl
          value="my-posts"
          onValueChange={value => {
            if (value === 'personal-data') {
              router.push('./personal-data');
            }
          }}
          options={[
            { value: 'my-posts', label: 'my posts' },
            { value: 'personal-data', label: 'personal data' },
          ]}
        />

        <View style={styles.filterRow}>
          <CategoryChip label="all posts" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <CategoryChip label="active" selected={filter === 'active'} onPress={() => setFilter('active')} />
          <CategoryChip
            label="completed"
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
          />
          <CategoryChip label="inactive" selected={filter === 'inactive'} onPress={() => setFilter('inactive')} />
        </View>

        <View style={styles.list}>
          {visibleRecords.map(record => (
            <MyPostItem
              key={record.id}
              title={record.title}
              postType={record.postType}
              status={record.status}
              subtitle={record.subtitle}
              meta={record.meta}
              icon={record.icon}
            />
          ))}
        </View>

        <Button
          mode="contained"
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimary}
          contentStyle={styles.buttonContent}
          style={styles.button}
          icon="plus"
          onPress={() => router.push('./create-post')}>
          create new post
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz organiza header, filtros, lista y accion final.
  root: {
    flex: 1,
  },
  // este header replica la lectura simple del mock.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  // este grupo mantiene el back y el titulo juntos.
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // este boton da un area tactil clara al back.
  iconButton: {
    borderRadius: 999,
  },
  // este titulo sostiene la identidad de la pantalla.
  headerTitle: {
    fontWeight: '800',
  },
  // este avatar abre el acceso al perfil.
  profileButton: {
    borderRadius: 999,
  },
  // este contenedor mantiene el resto del contenido en una columna clara.
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  // esta fila agrupa los filtros por estado.
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // esta lista separa cada item con ritmo consistente.
  list: {
    gap: 12,
  },
  // este boton queda al final como accion principal.
  buttonContent: {
    minHeight: 48,
  },
  // este radio coincide con la familia visual del producto.
  button: {
    borderRadius: 10,
    marginTop: 8,
  },
});
