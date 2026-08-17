import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';


import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {
  AppDatePicker,
  AppHeader,
  AppScreen,
  CategoryChip,
  SegmentedControl,
  SmartImage,
} from '@/components';
import { currentUserId } from '@/data/authors';
import {
  getPostImageSource,
  postCategoryLabel,
  type AppPost,
  type ArticleCondition,
  type DeliveryMethod,
  type PostCategory,
  type PostImage,
  type PostKind,
  type PostLocation,
} from '@/data/posts';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { type PostDraft, useAppData } from '@/state/app-data-context';
import { getPickImageErrorMessage, pickImages, type PickImageSource } from '@/utils/pick-image';
import { containsExactAddress, findProhibitedContent, fuzzyIncludes } from '@/utils/text';

const categories: PostCategory[] = ['food', 'clothes', 'health', 'home', 'school', 'furniture', 'volunteering'];
const conditions: Array<{ key: ArticleCondition; label: string }> = [
  { key: 'new', label: 'Nuevo' },
  { key: 'very-good', label: 'Muy buen estado' },
  { key: 'good', label: 'Buen estado' },
];
const deliveryOptions: Array<{ key: DeliveryMethod; label: string }> = [
  { key: 'coordinate', label: 'A coordinar' },
  { key: 'can-deliver', label: 'Puedo acercarlo' },
];
const unitSuggestions = ['unidad', 'caja', 'bolsa', 'kit', 'persona'];

type FormErrors = Partial<Record<'title' | 'description' | 'quantity' | 'quantityUnit' | 'availability' | 'meetingPoint' | 'location' | 'images' | 'safety' | 'duplicate', string>>;

function draftSignature(draft?: PostDraft) {
  return JSON.stringify([
    draft?.kind,
    draft?.category,
    draft?.title,
    draft?.description,
    draft?.quantity,
    draft?.quantityUnit,
    draft?.condition,
    draft?.deadline,
    draft?.delivery,
    draft?.availability,
    draft?.location,
    draft?.meetingPoint,
    draft?.images,
  ]);
}

function InlineError({ message }: { message?: string }) {
  const theme = useTheme();
  if (!message) return null;
  return <Text variant="bodySmall" accessibilityRole="alert" style={{ color: theme.colors.error }}>{message}</Text>;
}

export function CreatePostView() {
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const editPostId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const { posts, addPost, updatePost, postDraft, savePostDraft } = useAppData();
  const editingPost = posts.find(post => post.id === editPostId && post.ownerId === 'current-user');
  const initial: PostDraft | undefined = editingPost
    ? {
        title: editingPost.title,
        kind: editingPost.kind,
        category: editingPost.category,
        description: editingPost.description,
        images: editingPost.images,
        location: editingPost.location,
        quantity: editingPost.quantity,
        quantityUnit: editingPost.quantityUnit,
        condition: editingPost.condition,
        delivery: editingPost.delivery,
        availability: editingPost.availability,
        deadline: editingPost.deadline,
        meetingPoint: editingPost.meetingPoint,
      }
    : postDraft ?? {
        kind: 'donation',
        category: 'food',
        title: '',
        description: '',
        images: [],
        quantityUnit: 'unidad',
        condition: 'good',
        delivery: 'coordinate',
        availability: '',
        meetingPoint: '',
      };
  const initialRef = useRef<PostDraft | AppPost | undefined>(initial);
  const successScale = useRef(new Animated.Value(reducedMotion ? 1 : 0.65)).current;

  const [kind, setKind] = useState<PostKind>(initial?.kind ?? 'donation');
  const [category, setCategory] = useState<PostCategory>(initial?.category ?? 'food');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ? String(initial.quantity) : '');
  const [quantityUnit, setQuantityUnit] = useState(initial?.quantityUnit ?? 'unidad');
  const [condition, setCondition] = useState<ArticleCondition>(initial?.condition ?? 'good');
  const [deadline, setDeadline] = useState(initial?.deadline);
  const [delivery, setDelivery] = useState<DeliveryMethod>(initial?.delivery ?? 'coordinate');
  const [availability, setAvailability] = useState(initial?.availability ?? '');
  const [location, setLocation] = useState<PostLocation | undefined>(initial?.location);
  const [meetingPoint, setMeetingPoint] = useState(initial?.meetingPoint ?? '');
  const [images, setImages] = useState<PostImage[]>(initial?.images ?? []);
  const [safetyAccepted, setSafetyAccepted] = useState(Boolean(editingPost));
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoDialog, setPhotoDialog] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState('');
  const [selectingImages, setSelectingImages] = useState(false);

  const currentDraft = useMemo<PostDraft>(() => ({
    kind,
    category,
    title,
    description,
    quantity: quantity ? Number(quantity) : undefined,
    quantityUnit,
    condition: kind === 'donation' ? condition : undefined,
    deadline,
    delivery,
    availability,
    location,
    meetingPoint,
    images,
  }), [availability, category, condition, deadline, delivery, description, images, kind, location, meetingPoint, quantity, quantityUnit, title]);

  const dirty = useMemo(() => draftSignature(currentDraft) !== draftSignature(initialRef.current), [currentDraft]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!dirty) return false;
      setLeaveDialog(true);
      return true;
    });
    return () => subscription.remove();
  }, [dirty]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!successVisible || reducedMotion) return;
    successScale.setValue(0.65);
    Animated.spring(successScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, [reducedMotion, successScale, successVisible]);

  const clearError = (field: keyof FormErrors) => setErrors(current => ({ ...current, [field]: undefined }));

  const leave = () => {
    setLeaveDialog(false);
    router.back();
  };

  const attemptLeave = () => {
    if (dirty) setLeaveDialog(true);
    else router.back();
  };

  const selectPhotos = async (source: PickImageSource) => {
    setPhotoDialog(false);
    setSelectingImages(true);
    setStatusMessage('');
    try {
      const selected = await pickImages(source, source === 'library');
      if (!selected.length) return;
      const remaining = Math.max(0, 5 - images.length);
      const nextImages: PostImage[] = selected.slice(0, remaining).map((image, index) => ({
        id: `local-${Date.now()}-${index}`,
        kind: 'uri',
        uri: image.uri,
        alt: `Foto agregada ${images.length + index + 1}`,
      }));
      setImages(current => [...current, ...nextImages]);
      clearError('images');
      setStatusMessage(`${nextImages.length} ${nextImages.length === 1 ? 'foto agregada' : 'fotos agregadas'} y optimizadas.`);
    } catch (error) {
      setErrors(current => ({ ...current, images: getPickImageErrorMessage(error) }));
    } finally {
      setSelectingImages(false);
    }
  };

  const selectMapLocation = (event: MapPressEvent) => {
  const coordinate = event.nativeEvent.coordinate;

  // Redondeamos las coordenadas para no guardar una ubicación demasiado exacta.
  const latitude = Number(coordinate.latitude.toFixed(3));
  const longitude = Number(coordinate.longitude.toFixed(3));

  setLocation({
    latitude,
    longitude,
    locality: 'Neuquén capital',
    label: 'Punto aproximado seleccionado',
  });

  clearError('location');
};

  const validate = () => {
    const next: FormErrors = {};
    if (title.trim().length < 5) next.title = 'Escribí un título de al menos 5 carácteres.';
    if (title.length > 80) next.title = 'El título puede tener hasta 80 carácteres.';
    if (description.trim().length < 20) next.description = 'Agregá una descripción de al menos 20 carácteres.';
    if (description.length > 600) next.description = 'La descripción puede tener hasta 600 carácteres.';
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) next.quantity = 'Ingresá una cantidad numérica mayor que cero.';
    if (quantityUnit.trim().length < 2) next.quantityUnit = 'Indicá la unidad: cajas, bolsas, personas, etc.';
    if (availability.trim().length < 5) next.availability = 'Indicá días u horarios disponibles.';
    if (!location) next.location = 'Elegí una ubicación tocando el mapa.';
    if (meetingPoint.trim().length < 4) next.meetingPoint = 'Indicá una referencia aproximada, sin dirección exacta.';
    if (images.length === 0) next.images = 'Agregá al menos una fotografía tomada o elegida de tu dispositivo.';
    if (!safetyAccepted) next.safety = 'Confirmá que la publicación cumple las normas.';
    if (containsExactAddress(`${description} ${meetingPoint}`)) next.description = 'Quitá la dirección exacta. Compartila únicamente por mensaje.';
    if (findProhibitedContent(`${title} ${description}`)) next.description = 'La descripción parece incluir un producto prohibido o regulado.';

    const duplicate = posts.find(post =>
      post.id !== editingPost?.id &&
      post.authorId === currentUserId &&
      post.category === category &&
      fuzzyIncludes(post.title, title) &&
      fuzzyIncludes(title, post.title),
    );
    if (duplicate) next.duplicate = `Ya existe una publicación similar: “${duplicate.title}”. Editala o cambiale el contenido.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const publish = () => {
    setStatusMessage('');
    if (!validate() || !location) return;
    const now = new Date().toISOString();
    const id = editingPost?.id ?? `community-${Date.now()}`;
    const post: AppPost = {
      id,
      title: title.trim(),
      kind,
      category,
      description: description.trim(),
      images,
      location,
      authorId: currentUserId,
      publishedAt: editingPost?.publishedAt ?? now,
      updatedAt: now,
      quantity: Number(quantity),
      quantityUnit: quantityUnit.trim().toLowerCase(),
      condition: kind === 'donation' ? condition : undefined,
      delivery,
      availability: availability.trim(),
      deadline,
      meetingPoint: meetingPoint.trim(),
      status: editingPost?.status ?? 'available',
      interestedUserIds: editingPost?.interestedUserIds ?? [],
      ownerId: 'current-user',
    };
    if (editingPost) updatePost(id, post);
    else addPost(post);
    savePostDraft(undefined);
    initialRef.current = currentDraft;
    setCreatedPostId(id);
    setSuccessVisible(true);
  };

  const saveDraft = () => {
    savePostDraft(currentDraft);
    initialRef.current = currentDraft;
    setStatusMessage('Borrador guardado en este dispositivo.');
  };

  return (
    <AppScreen
      footer={<Button mode="contained" icon="check" contentStyle={styles.footerButton} onPress={publish}>{editingPost ? 'Guardar cambios' : 'Publicar'}</Button>}
      contentStyle={styles.content}>
      <AppHeader title={editingPost ? 'Editar publicación' : 'Nueva publicación'} onBackPress={attemptLeave} />

      {!editingPost ? (
        <View style={styles.draftRow}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>Podés guardar y continuar más tarde.</Text>
          <Button compact icon="content-save-outline" onPress={saveDraft}>Guardar borrador</Button>
        </View>
      ) : null}

      {statusMessage ? (
        <Surface accessibilityRole="alert" elevation={0} style={[styles.statusCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurface, flex: 1 }}>{statusMessage}</Text>
        </Surface>
      ) : null}

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>¿Qué querés publicar?</Text>
        <SegmentedControl
          value={kind}
          onValueChange={value => { setKind(value as PostKind); clearError('duplicate'); }}
          options={[{ value: 'donation', label: 'Ofrezco una donación' }, { value: 'request', label: 'Necesito ayuda' }]}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          label="Título"
          placeholder="Ej.: Mantas de invierno"
          value={title}
          onChangeText={value => { setTitle(value.slice(0, 80)); clearError('title'); clearError('duplicate'); }}
          error={Boolean(errors.title)}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          accessibilityLabel="Título de la publicación"
        />
        <View style={styles.helperRow}><InlineError message={errors.title} /><Text variant="bodySmall" style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>{title.length}/80</Text></View>
        <TextInput
          mode="outlined"
          label="Descripción"
          placeholder="Contá qué ofrecés o necesitás. No escribas tu dirección exacta."
          value={description}
          onChangeText={value => { setDescription(value.slice(0, 600)); clearError('description'); clearError('duplicate'); }}
          multiline
          numberOfLines={5}
          error={Boolean(errors.description)}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          style={styles.textArea}
        />
        <View style={styles.helperRow}><InlineError message={errors.description} /><Text variant="bodySmall" style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>{description.length}/600</Text></View>
        <InlineError message={errors.duplicate} />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Categoría</Text>
        <View style={styles.chipRow}>
          {categories.map(item => <CategoryChip key={item} label={postCategoryLabel[item]} selected={category === item} onPress={() => { setCategory(item); clearError('duplicate'); }} />)}
        </View>
      </View>

      <Surface elevation={0} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Detalles</Text>
        <View style={styles.quantityFields}>
          <View style={styles.quantityInput}>
            <TextInput
              mode="outlined"
              label="Cantidad"
              placeholder="Ej.: 3"
              value={quantity}
              onChangeText={value => { setQuantity(value.replace(/[^0-9]/g, '')); clearError('quantity'); }}
              keyboardType="number-pad"
              inputMode="numeric"
              error={Boolean(errors.quantity)}
              accessibilityLabel="Cantidad numérica"
            />
            <InlineError message={errors.quantity} />
          </View>
          <View style={styles.unitInput}>
            <TextInput
              mode="outlined"
              label="Unidad"
              placeholder="bolsas"
              value={quantityUnit}
              onChangeText={value => { setQuantityUnit(value.replace(/[0-9]/g, '').slice(0, 24)); clearError('quantityUnit'); }}
              error={Boolean(errors.quantityUnit)}
            />
            <InlineError message={errors.quantityUnit} />
          </View>
        </View>
        <View style={styles.chipRow}>
          {unitSuggestions.map(unit => <CategoryChip key={unit} label={unit} selected={quantityUnit === unit} onPress={() => { setQuantityUnit(unit); clearError('quantityUnit'); }} />)}
        </View>

        {kind === 'donation' ? (
          <View style={styles.fieldGroup}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>Estado del artículo</Text>
            <View style={styles.chipRow}>{conditions.map(item => <CategoryChip key={item.key} label={item.label} selected={condition === item.key} onPress={() => setCondition(item.key)} />)}</View>
          </View>
        ) : null}

        <AppDatePicker label="Fecha límite (opcional)" value={deadline} onChange={setDeadline} />

        <View style={styles.fieldGroup}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>Forma de entrega</Text>
          <View style={styles.chipRow}>{deliveryOptions.map(item => <CategoryChip key={item.key} label={item.label} selected={delivery === item.key} onPress={() => setDelivery(item.key)} />)}</View>
        </View>

        <TextInput
          mode="outlined"
          label="Disponibilidad"
          placeholder="Ej.: Lunes a viernes después de las 17 h"
          value={availability}
          onChangeText={value => { setAvailability(value.slice(0, 120)); clearError('availability'); }}
          error={Boolean(errors.availability)}
          left={<TextInput.Icon icon="clock-outline" />}
        />
        <InlineError message={errors.availability} />
      </Surface>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Ubicación y encuentro</Text>
<View
  style={[
    styles.mapContainer,
    {
      borderColor: errors.location
        ? theme.colors.error
        : theme.colors.outlineVariant,
    },
  ]}>
  <MapView
    style={StyleSheet.absoluteFillObject}
    initialRegion={{
      latitude: -38.9516,
      longitude: -68.0591,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    }}
    onPress={selectMapLocation}>
    {location ? (
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="Ubicación aproximada"
      />
    ) : null}
  </MapView>
</View>

<Text
  variant="bodySmall"
  style={{
    color: errors.location
      ? theme.colors.error
      : theme.colors.onSurfaceVariant,
  }}>
  {errors.location ??
    'Tocá un punto del mapa. Solo se publicará una ubicación aproximada.'}
</Text>
        <TextInput
          mode="outlined"
          label="Referencia aproximada"
          placeholder="Ej.: Zona del Paseo de la Costa"
          value={meetingPoint}
          onChangeText={value => { setMeetingPoint(value.slice(0, 100)); clearError('meetingPoint'); clearError('description'); }}
          error={Boolean(errors.meetingPoint)}
        />
        <InlineError message={errors.meetingPoint} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={{ flex: 1 }}><Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Fotografías</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Hasta 5 fotos · se optimizan antes de agregarlas</Text></View>
          <Button mode="outlined" icon="camera-plus-outline" loading={selectingImages} disabled={images.length >= 5 || selectingImages} onPress={() => setPhotoDialog(true)}>Agregar</Button>
        </View>
        {images.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {images.map((image, index) => (
              <View key={image.id} style={styles.photoWrap}>
                <SmartImage source={getPostImageSource(image)} style={styles.photo} contentFit="cover" accessibilityLabel={image.alt} />
                <IconButton icon="close" mode="contained" size={16} onPress={() => setImages(current => current.filter(item => item.id !== image.id))} accessibilityLabel={`Quitar foto ${index + 1}`} style={styles.removePhoto} />
                {index === 0 ? <View style={styles.coverLabel}><Text variant="labelSmall" style={styles.coverText}>Portada</Text></View> : null}
              </View>
            ))}
          </ScrollView>
        ) : (
          <Surface elevation={0} style={[styles.photoEmpty, { backgroundColor: theme.colors.surface, borderColor: errors.images ? theme.colors.error : theme.colors.outlineVariant }]}>
            <MaterialCommunityIcons name="image-multiple-outline" size={36} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>Mostrá la condición y la cantidad con fotos claras.</Text>
          </Surface>
        )}
        <InlineError message={errors.images} />
      </View>

      <Surface elevation={0} style={[styles.safetyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="shield-alert-outline" size={25} color={theme.colors.onSurfaceVariant} />
        <View style={styles.safetyCopy}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>Normas de publicación</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 19 }}>
            No se permiten medicamentos abiertos, comida vencida, sangre, armas ni elementos peligrosos. No publiques domicilios exactos ni pidas dinero.
          </Text>
          <TouchableCheck checked={safetyAccepted} onPress={() => { setSafetyAccepted(current => !current); clearError('safety'); }} />
          <InlineError message={errors.safety} />
          <Button compact mode="text" onPress={() => router.push('/safety')}>Leer política completa</Button>
        </View>
      </Surface>

      <Portal>
        <Dialog visible={photoDialog} onDismiss={() => setPhotoDialog(false)}>
          <Dialog.Title>Agregar fotografías</Dialog.Title>
          <Dialog.Content style={styles.photoOptions}>
            <Button mode="contained" icon="camera-outline" onPress={() => selectPhotos('camera')}>Tomar con la cámara</Button>
            <Button mode="outlined" icon="image-multiple-outline" onPress={() => selectPhotos('library')}>Elegir de la biblioteca</Button>
          </Dialog.Content>
          <Dialog.Actions><Button onPress={() => setPhotoDialog(false)}>Cancelar</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={leaveDialog} onDismiss={() => setLeaveDialog(false)}>
          <Dialog.Title>Hay cambios sin guardar</Dialog.Title>
          <Dialog.Content><Text>Si salís ahora, podrías perder la información de esta publicación.</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLeaveDialog(false)}>Seguir editando</Button>
            {!editingPost ? <Button onPress={() => { saveDraft(); setLeaveDialog(false); router.back(); }}>Guardar borrador</Button> : null}
            <Button textColor={theme.colors.error} onPress={leave}>Descartar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={successVisible} dismissable={false}>
          <Dialog.Content style={styles.successContent}>
            <Animated.View style={[styles.successIcon, { backgroundColor: theme.colors.primaryContainer, transform: [{ scale: successScale }] }]}>
              <MaterialCommunityIcons name="check" size={38} color={theme.colors.primary} />
            </Animated.View>
            <Text variant="headlineSmall" style={[styles.successTitle, { color: theme.colors.onSurface }]}>{editingPost ? 'Publicación actualizada' : 'Publicación creada correctamente'}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>Ya está visible con sus datos y estado actualizados.</Text>
          </Dialog.Content>
          <Dialog.Actions><Button mode="contained" onPress={() => { if (!createdPostId) return; setSuccessVisible(false); router.replace({ pathname: '/post/[postId]', params: { postId: createdPostId } }); }}>Ver publicación</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </AppScreen>
  );
}

function TouchableCheck({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Button mode="text" onPress={onPress} contentStyle={styles.checkButton} accessibilityState={{ checked }} accessibilityRole="checkbox">
      <View style={styles.checkInner}><Checkbox status={checked ? 'checked' : 'unchecked'} /><Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>Confirmo que el contenido es seguro y verdadero.</Text></View>
    </Button>
  );
}

const styles = StyleSheet.create({

  mapContainer: {
  height: 240,
  borderRadius: 20,
  borderWidth: 1,
  overflow: 'hidden',
},
  content: { paddingBottom: 18, gap: 22 },
  section: { gap: 11, paddingHorizontal: 16 },
  sectionTitle: { fontWeight: '800' },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  textArea: { minHeight: 122, textAlignVertical: 'top' },
  helperRow: { minHeight: 18, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  counter: { marginLeft: 'auto' },
  formCard: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 16, gap: 16 },
  quantityFields: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  quantityInput: { flex: 0.75, gap: 4 },
  unitInput: { flex: 1.25, gap: 4 },
  fieldGroup: { gap: 9 },
  photoRow: { gap: 10, paddingRight: 16 },
  photoWrap: { width: 150, height: 118, overflow: 'hidden', borderRadius: 14 },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 4, right: 4 },
  coverLabel: { position: 'absolute', left: 7, bottom: 7, borderRadius: 999, backgroundColor: 'rgba(27,28,28,0.78)', paddingHorizontal: 8, paddingVertical: 4 },
  coverText: { color: '#FFFFFF', fontWeight: '800' },
  photoEmpty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderRadius: 18, paddingHorizontal: 28 },
  safetyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 18, marginHorizontal: 16, padding: 16 },
  safetyCopy: { flex: 1, gap: 7 },
  checkButton: { minHeight: 46, justifyContent: 'flex-start' },
  checkInner: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  footerButton: { minHeight: 50 },
  draftRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, marginHorizontal: 16, padding: 12 },
  photoOptions: { gap: 12 },
  successContent: { alignItems: 'center', gap: 12, paddingTop: 12 },
  successIcon: { width: 76, height: 76, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  successTitle: { textAlign: 'center', fontWeight: '800' },
});
