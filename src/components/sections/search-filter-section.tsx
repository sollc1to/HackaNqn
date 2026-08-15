import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chip, Divider, IconButton, List, Surface, Text, useTheme } from 'react-native-paper';

type SearchCategory = {
  // esta clave identifica la categoria activa.
  key: string;
  // esta etiqueta muestra el nombre visible.
  label: string;
  // este estado define si la categoria esta activa.
  selected: boolean;
};

type SearchFilterTag = {
  // esta clave identifica el tag activo.
  key: string;
  // este texto se muestra como filtro secundario.
  label: string;
  // este estado marca el tag activo.
  selected: boolean;
};

type RecentSearch = {
  // esta clave permite render estable.
  id: string;
  // este texto representa la busqueda reciente.
  label: string;
  // esta accion limpia el elemento si aplica.
  onRemove?: () => void;
  // esta accion abre la busqueda reciente.
  onPress?: () => void;
};

type SearchFilterSectionProps = {
  // este titulo identifica el bloque de categorias.
  categoryTitle?: string;
  // este titulo identifica el bloque de filtros.
  filterTitle?: string;
  // este titulo identifica el bloque de recientes.
  recentTitle?: string;
  // estas categorias forman el filtro principal.
  categories: SearchCategory[];
  // esta accion cambia la categoria activa.
  onCategoryChange: (key: string) => void;
  // estos filtros completan el refinado de busqueda.
  tags?: SearchFilterTag[];
  // esta accion cambia el filtro secundario.
  onTagChange?: (key: string) => void;
  // estas busquedas previas aceleran el reuso.
  recentSearches?: RecentSearch[];
  // este contenido opcional aparece arriba del bloque.
  header?: ReactNode;
};

export function SearchFilterSection({
  categoryTitle = 'búsqueda por categorías',
  filterTitle,
  recentTitle = 'búsquedas recientes',
  categories,
  onCategoryChange,
  tags,
  onTagChange,
  recentSearches,
  header,
}: SearchFilterSectionProps) {
  const theme = useTheme();

  // este bloque reproduce la estructura del mock de busqueda y filtrado.
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {header ? <View>{header}</View> : null}

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {categoryTitle}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {categories.map(category => (
            <Chip
              key={category.key}
              selected={category.selected}
              onPress={() => onCategoryChange(category.key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: category.selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                },
              ]}
              textStyle={[
                styles.categoryChipText,
                {
                  color: category.selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                },
              ]}>
              {category.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {tags && tags.length > 0 ? (
        <Surface
          style={[
            styles.filterCard,
            {
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surface,
            },
          ]}
          elevation={0}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="filter-variant" size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelLarge" style={[styles.filterHeaderText, { color: theme.colors.onSurfaceVariant }]}>
              {filterTitle}
            </Text>
          </View>

          <View style={styles.tagsWrap}>
            {tags.map(tag => (
              <Chip
                key={tag.key}
                selected={tag.selected}
                compact
                onPress={onTagChange ? () => onTagChange(tag.key) : undefined}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: tag.selected ? theme.colors.surfaceVariant : theme.colors.surface,
                  },
                ]}
                textStyle={[
                  styles.tagChipText,
                  {
                    color: tag.selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                  },
                ]}>
                {tag.label}
              </Chip>
            ))}
          </View>
        </Surface>
      ) : null}

      {recentSearches && recentSearches.length > 0 ? (
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {recentTitle}
          </Text>

          <View style={styles.recentList}>
            {recentSearches.map(item => (
              <View key={item.id}>
                <List.Item
                  title={item.label}
                  titleNumberOfLines={1}
                  onPress={item.onPress}
                  left={props => <MaterialCommunityIcons name="history" size={20} color={theme.colors.outline} style={props.style} />}
                  right={() =>
                    item.onRemove ? (
                      <IconButton
                        icon="close"
                        size={18}
                        iconColor={theme.colors.outlineVariant}
                        onPress={item.onRemove}
                        style={styles.recentAction}
                      />
                    ) : null
                  }
                  style={styles.recentItem}
                />
                <Divider />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // este contenedor administra el espaciado vertical general.
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  // esta seccion agrupa el titulo y las categorias.
  section: {
    gap: 12,
  },
  // este titulo mantiene la jerarquia visual.
  sectionTitle: {
    fontWeight: '800',
  },
  // esta fila desplaza las categorias de forma horizontal.
  horizontalList: {
    gap: 10,
    paddingBottom: 4,
  },
  // este chip mayor se usa para las categorias principales.
  categoryChip: {
    minHeight: 48,
    justifyContent: 'center',
  },
  // este texto usa una lectura simple.
  categoryChipText: {
    fontWeight: '700',
    textTransform: 'none',
  },
  // esta tarjeta agrupa los filtros secundarios.
  filterCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  // este encabezado explica el bloque de filtros.
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // este texto evita ruido visual.
  filterHeaderText: {
    fontWeight: '700',
  },
  // este wrap organiza los tags en multiples lineas.
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // este chip usa una altura menor para tags rapidos.
  tagChip: {
    minHeight: 40,
  },
  // este texto prioriza claridad.
  tagChipText: {
    fontSize: 12,
    textTransform: 'none',
  },
  // esta lista mantiene los items recientes apilados.
  recentList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  // este item reciente deja un toque ligero.
  recentItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  // este boton de cierre mantiene una presencia discreta.
  recentAction: {
    margin: 0,
  },
});
