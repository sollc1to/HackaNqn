import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchFilterSection } from '@/components';

type CategoryKey = 'food' | 'clothes' | 'health' | 'housing';
type FoodFilterKey = 'dry' | 'fruit' | 'prepared' | 'gluten-free' | 'water';

const categories = [
  { key: 'food' as const, label: 'alimentos' },
  { key: 'clothes' as const, label: 'ropa' },
  { key: 'health' as const, label: 'salud' },
  { key: 'housing' as const, label: 'hogar' },
];

const foodFilters = [
  { key: 'dry' as const, label: 'no perecederos' },
  { key: 'fruit' as const, label: 'frutas y verduras' },
  { key: 'prepared' as const, label: 'comidas preparadas' },
  { key: 'gluten-free' as const, label: 'sin tacc' },
  { key: 'water' as const, label: 'agua potable' },
];

const recentSearches = [
  { id: 'winter-kids', label: 'ropa de invierno para niños' },
  { id: 'southern-kitchens', label: 'voluntariado comedores zona sur' },
  { id: 'blood-donation', label: 'donación de sangre urgencias' },
];

export function SearchView() {
  const router = useRouter();
  const theme = useTheme();
  // este estado guarda la consulta principal de busqueda.
  const [query, setQuery] = useState('alimentos en zona sur');
  // este estado marca la categoria activa del explorador.
  const [category, setCategory] = useState<CategoryKey>('food');
  // este estado refina el resultado dentro de alimentos.
  const [foodFilter, setFoodFilter] = useState<FoodFilterKey>('dry');

  // este titulo cambia segun la categoria para guiar el filtrado.
  const tagTitle = useMemo(() => {
    if (category === 'food') {
      return 'filtros específicos para alimentos';
    }

    if (category === 'clothes') {
      return 'filtros específicos para ropa';
    }

    if (category === 'health') {
      return 'filtros específicos para salud';
    }

    return 'filtros específicos para hogar';
  }, [category]);

  // esta vista replica la pantalla de busqueda por categorias y filtros.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.background }]} elevation={0}>
        <TouchableRipple
          borderless
          onPress={() => {
            // este back devuelve a la pantalla anterior sin perder el contexto.
            router.back();
          }}
          style={styles.iconButton}>
          <Avatar.Icon
            size={36}
            icon="arrow-left"
            color={theme.colors.primaryContainer}
            style={{ backgroundColor: 'transparent' }}
          />
        </TouchableRipple>

        <View style={styles.searchWrap}>
          <TextInput
            mode="outlined"
            value={query}
            onChangeText={text => {
              // este input actualiza la busqueda en vivo.
              setQuery(text);
            }}
            placeholder="buscar ayuda o donaciones..."
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primaryContainer}
            left={<TextInput.Icon icon="magnify" />}
            right={
              query.length > 0 ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    // este boton limpia el texto sin tocar el resto del filtro.
                    setQuery('');
                  }}
                />
              ) : undefined
            }
          />
        </View>

        <TouchableRipple
          borderless
          onPress={() => {
            // este boton reinicia la busqueda visible del header.
            setQuery('');
          }}
          style={styles.iconButton}>
          <Avatar.Icon
            size={36}
            icon="close"
            color={theme.colors.outlineVariant}
            style={{ backgroundColor: 'transparent' }}
          />
        </TouchableRipple>
      </Surface>

      <SearchFilterSection
        categoryTitle="búsqueda por categorías"
        filterTitle={tagTitle}
        categories={categories.map(item => ({
          ...item,
          selected: item.key === category,
        }))}
        onCategoryChange={key => {
          // este cambio actualiza la categoria principal del buscador.
          setCategory(key as CategoryKey);
        }}
        tags={
          category === 'food'
            ? foodFilters.map(item => ({
                ...item,
                selected: item.key === foodFilter,
              }))
            : undefined
        }
        onTagChange={key => {
          // este cambio afina el filtro secundario de la categoria actual.
          setFoodFilter(key as FoodFilterKey);
        }}
        recentSearches={recentSearches}
        header={
          <View style={styles.sectionIntro}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {query}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz ocupa toda la pantalla.
  root: {
    flex: 1,
  },
  // este header concentra back, busqueda y reset.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  // este boton conserva una superficie tactil discreta.
  iconButton: {
    borderRadius: 999,
  },
  // este bloque central permite que el campo crezca.
  searchWrap: {
    flex: 1,
  },
  // este intro da espacio para mostrar el texto activo.
  sectionIntro: {
    paddingTop: 2,
  },
});
