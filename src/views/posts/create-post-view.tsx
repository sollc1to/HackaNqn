import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Dialog,
  Portal,
  Snackbar,
  Surface,
  Switch,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { AppHeader, AppScreen, CategoryChip, SegmentedControl } from '@/components';
import {
  categoryDemoImages,
  postCategoryLabel,
  type AppPost,
  type PostCategory,
  type PostKind,
} from '@/data/posts';
import { currentUser } from '@/data/profile';
import { useAppData } from '@/state/app-data-context';
import { pickImage } from '@/utils/pick-image';

const categories: Array<{ key: PostCategory; label: string }> = [
  { key: 'food', label: 'Alimentos' },
  { key: 'clothes', label: 'Ropa' },
  { key: 'health', label: 'Salud' },
  { key: 'home', label: 'Hogar' },
];

const conditions = ['Nuevo', 'Muy buen estado', 'Buen estado', 'No aplica'];
const deliveryOptions = ['Retiro coordinado', 'Puedo acercarlo', 'A coordinar'];

export function CreatePostView() {
  const router = useRouter();
  const theme = useTheme();
  const { addPost } = useAppData();
  const successScale = useRef(new Animated.Value(0.65)).current;
  const [kind, setKind] = useState<PostKind>('donation');
  const [category, setCategory] = useState<PostCategory>('food');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('Buen estado');
  const [deadline, setDeadline] = useState('');
  const [delivery, setDelivery] = useState('Retiro coordinado');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('Barrio Confluencia, Neuquén capital');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [imageUri, setImageUri] = useState<string>();
  const [feedback, setFeedback] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string>();

  useEffect(() => {
    if (!successVisible) return;
    successScale.setValue(0.65);
    Animated.spring(successScale, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [successScale, successVisible]);

  const selectPhoto = async () => {
    const selectedUri = await pickImage(categoryDemoImages[category]);
    if (!selectedUri) return;
    setImageUri(selectedUri);
    setFeedback('Foto agregada al borrador.');
  };

  const publish = () => {
    if (title.trim().length < 5) {
      setFeedback('Escribí un título de al menos 5 caracteres.');
      return;
    }

    if (description.trim().length < 15) {
      setFeedback('Agregá una descripción un poco más detallada.');
      return;
    }

    if (!quantity.trim() || !availability.trim() || !meetingPoint.trim()) {
      setFeedback('Completá cantidad, disponibilidad y punto de encuentro.');
      return;
    }

    const id = `community-${Date.now()}`;
    const newPost: AppPost = {
      id,
      title: title.trim(),
      kind,
      urgent,
      category,
      description: description.trim(),
      imageUri: imageUri ?? categoryDemoImages[category],
      location: location.trim(),
      distanceKm: 1.2,
      author: currentUser.name,
      authorInitials: currentUser.initials,
      authorImageUri: currentUser.imageUri,
      verified: false,
      publishedAt: 'Recién publicada',
      lastActivity: 'Ahora',
      quantity: quantity.trim(),
      condition,
      delivery,
      availability: deadline.trim()
        ? `${availability.trim()} · Fecha límite: ${deadline.trim()}`
        : availability.trim(),
      meetingPoint: meetingPoint.trim(),
      status: 'active',
      completedExchanges: currentUser.completedExchanges,
      highlights: [postCategoryLabel[category], quantity.trim(), delivery],
      ownerId: 'current-user',
    };

    addPost(newPost);
    setCreatedPostId(id);
    setSuccessVisible(true);
  };

  return (
    <AppScreen
      footer={
        <Button mode="contained" icon="check" contentStyle={styles.footerButton} onPress={publish}>
          Publicar
        </Button>
      }
      contentStyle={styles.content}>
      <AppHeader title="Nueva publicación" onBackPress={() => router.back()} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          ¿Qué querés publicar?
        </Text>
        <SegmentedControl
          value={kind}
          onValueChange={value => setKind(value as PostKind)}
          options={[
            { value: 'donation', label: 'Ofrezco una donación' },
            { value: 'request', label: 'Necesito ayuda' },
          ]}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="Título"
          placeholder="Ej.: Mantas de invierno"
          value={title}
          onChangeText={setTitle}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <TextInput
          mode="outlined"
          label="Descripción"
          placeholder="Contá qué ofrecés o necesitás, y cualquier detalle importante."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          style={styles.textArea}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Categoría
        </Text>
        <View style={styles.chipRow}>
          {categories.map(item => (
            <CategoryChip
              key={item.key}
              label={item.label}
              selected={category === item.key}
              onPress={() => {
                setCategory(item.key);
                setImageUri(undefined);
              }}
            />
          ))}
        </View>
      </View>

      <Surface
        elevation={0}
        style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Detalles
        </Text>
        <TextInput
          mode="outlined"
          label="Cantidad"
          placeholder="Ej.: 3 bolsas o 10 unidades"
          value={quantity}
          onChangeText={setQuantity}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />

        <View style={styles.fieldGroup}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
            Estado del artículo
          </Text>
          <View style={styles.chipRow}>
            {conditions.map(item => (
              <CategoryChip key={item} label={item} selected={condition === item} onPress={() => setCondition(item)} />
            ))}
          </View>
        </View>

        <TextInput
          mode="outlined"
          label="Fecha límite (opcional)"
          placeholder="Ej.: 30/08/2026"
          value={deadline}
          onChangeText={setDeadline}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="calendar-outline" />}
        />

        <View style={styles.fieldGroup}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
            Forma de entrega
          </Text>
          <View style={styles.chipRow}>
            {deliveryOptions.map(item => (
              <CategoryChip key={item} label={item} selected={delivery === item} onPress={() => setDelivery(item)} />
            ))}
          </View>
        </View>

        <TextInput
          mode="outlined"
          label="Disponibilidad"
          placeholder="Ej.: Lunes a viernes después de las 17 h"
          value={availability}
          onChangeText={setAvailability}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="clock-outline" />}
        />

        <View style={styles.urgentRow}>
          <View style={styles.urgentCopy}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
              Marcar como urgente
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Usalo solo cuando el tiempo sea determinante.
            </Text>
          </View>
          <Switch value={urgent} onValueChange={setUrgent} color={theme.colors.error} />
        </View>
      </Surface>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Ubicación y encuentro
        </Text>
        <TextInput
          mode="outlined"
          label="Ciudad o barrio"
          value={location}
          onChangeText={setLocation}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Punto aproximado de encuentro"
          placeholder="Ej.: Zona del Paseo de la Costa"
          value={meetingPoint}
          onChangeText={setMeetingPoint}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          La dirección exacta se comparte únicamente por mensaje.
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Fotografía
        </Text>
        <TouchableRipple onPress={selectPhoto} borderless style={styles.uploadRipple}>
          <Surface
            elevation={0}
            style={[
              styles.uploadBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
            ]}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.uploadImage} contentFit="cover" transition={180} />
                <View style={styles.changePhotoLabel}>
                  <MaterialCommunityIcons name="camera-outline" size={18} color="#FFFFFF" />
                  <Text variant="labelMedium" style={styles.changePhotoText}>
                    Cambiar foto
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadEmpty}>
                <MaterialCommunityIcons name="camera-plus-outline" size={34} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  Agregar una foto
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  Elegí una imagen que permita ver la condición y la cantidad.
                </Text>
              </View>
            )}
          </Surface>
        </TouchableRipple>
      </View>

      <Portal>
        <Dialog visible={successVisible} dismissable={false}>
          <Dialog.Content style={styles.successContent}>
            <Animated.View
              style={[
                styles.successIcon,
                { backgroundColor: theme.colors.primaryContainer, transform: [{ scale: successScale }] },
              ]}>
              <MaterialCommunityIcons name="check" size={38} color={theme.colors.primary} />
            </Animated.View>
            <Text variant="headlineSmall" style={[styles.successTitle, { color: theme.colors.onSurface }]}>
              Publicación creada correctamente
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Ya está visible para la comunidad.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained"
              onPress={() => {
                if (!createdPostId) return;
                setSuccessVisible(false);
                router.replace({ pathname: '/post/[postId]', params: { postId: createdPostId } });
              }}>
              Ver publicación
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar visible={feedback.length > 0} onDismiss={() => setFeedback('')} duration={2600}>
          {feedback}
        </Snackbar>
      </Portal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 18,
    gap: 22,
  },
  section: {
    gap: 11,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  textArea: {
    minHeight: 122,
    textAlignVertical: 'top',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 9,
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgentCopy: {
    flex: 1,
    gap: 3,
  },
  uploadRipple: {
    borderRadius: 18,
  },
  uploadBox: {
    minHeight: 190,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 18,
  },
  uploadEmpty: {
    flex: 1,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
  },
  uploadImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#EEF5EC',
  },
  changePhotoLabel: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(27, 28, 28, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerButton: {
    minHeight: 50,
  },
  successContent: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    textAlign: 'center',
    fontWeight: '800',
  },
});
