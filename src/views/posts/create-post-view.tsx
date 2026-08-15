import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, CategoryChip, SegmentedControl } from '@/components';

type PostMode = 'offer' | 'request';
type PostCategory = 'food' | 'clothes' | 'health' | 'housing';

const categories: Array<{ key: PostCategory; label: string }> = [
  { key: 'food', label: 'food' },
  { key: 'clothes', label: 'clothes' },
  { key: 'health', label: 'health' },
  { key: 'housing', label: 'housing' },
];

export function CreatePostView() {
  const router = useRouter();
  const theme = useTheme();
  // este estado define el tipo de publicacion que se va a crear.
  const [mode, setMode] = useState<PostMode>('offer');
  // este estado guarda la categoria elegida.
  const [category, setCategory] = useState<PostCategory>('food');
  // este estado mantiene el titulo del nuevo post.
  const [title, setTitle] = useState('');
  // este estado guarda la descripcion extendida.
  const [description, setDescription] = useState('');
  // este estado conserva la ubicacion sugerida.
  const [location, setLocation] = useState('Buenos Aires, Argentina');

  // este set de opciones resume la decision entre ofrecer y pedir ayuda.
  const segmentedOptions = useMemo(
    () => [
      { value: 'offer', label: "i'm offering help" },
      { value: 'request', label: 'i need help' },
    ],
    [],
  );

  // esta pantalla concentra el alta de una publicacion con un formulario simple.
  return (
    <AppScreen
      footer={
        <Button
          mode="contained"
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimary}
          contentStyle={styles.footerButtonContent}
          style={styles.footerButton}
          onPress={() => {
            // este boton cierra el alta y vuelve a la pantalla anterior.
            router.back();
          }}>
          publish post
        </Button>
      }
      contentStyle={styles.content}>
      <AppHeader
        title="new post"
        onBackPress={() => {
          // este back vuelve sin perder el flujo previo.
          router.back();
        }}
      />

      <View style={styles.section}>
        <SegmentedControl
          value={mode}
          onValueChange={value => {
            // este cambio alterna entre ofrecer ayuda y pedirla.
            setMode(value as PostMode);
          }}
          options={segmentedOptions}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="title of the post"
          placeholder="e.g., warm blankets for winter"
          value={title}
          onChangeText={text => {
            // este input actualiza el titulo visible del post.
            setTitle(text);
          }}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primaryContainer}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          category
        </Text>
        <View style={styles.chipRow}>
          {categories.map(item => (
            <CategoryChip
              key={item.key}
              label={item.label}
              selected={category === item.key}
              onPress={() => {
                // este toque actualiza la categoria activa del formulario.
                setCategory(item.key);
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="description"
          placeholder="describe the details of your offer or request..."
          value={description}
          onChangeText={text => {
            // este input completa el contenido principal del post.
            setDescription(text);
          }}
          multiline
          numberOfLines={5}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primaryContainer}
          style={styles.textArea}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="location"
          value={location}
          onChangeText={text => {
            // este campo define la ubicacion visible del post.
            setLocation(text);
          }}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primaryContainer}
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          upload photo
        </Text>
        <TouchableRipple onPress={() => undefined} style={styles.uploadRipple}>
          <Surface
            style={[
              styles.uploadBox,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
            elevation={0}>
            <IconButton icon="camera-plus-outline" size={28} iconColor={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              tap to upload image
            </Text>
          </Surface>
        </TouchableRipple>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  // este contenedor mantiene una lectura vertical limpia.
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  // esta seccion separa cada grupo del formulario.
  section: {
    gap: 10,
  },
  // este bloque conserva el boton inferior con buen alcance tactil.
  footerButtonContent: {
    minHeight: 48,
  },
  // este radio coincide con el sistema visual base.
  footerButton: {
    borderRadius: 10,
  },
  // esta etiqueta da contexto a cada bloque.
  label: {
    fontWeight: '700',
  },
  // este grupo acomoda chips en varias lineas.
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // este textarea gana altura para una descripcion util.
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  // esta capa amplifica el area tocable del upload.
  uploadRipple: {
    borderRadius: 16,
  },
  // esta caja simula el borde punteado del mock.
  uploadBox: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
