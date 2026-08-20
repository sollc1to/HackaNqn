import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Dialog, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, AuthorAvatar, RatingStars } from '@/components';
import { useAppData } from '@/state/app-data-context';
import { useCurrentUserProfile } from '@/hooks/use-current-user-profile';
import { formatDate } from '@/utils/date';
import { getPickImageErrorMessage, pickImages } from '@/utils/pick-image';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'location', string>>;

export function PersonalDataView() {
  const router = useRouter();
  const theme = useTheme();
  const { updateProfile, savedPosts } = useAppData();
  const { profile, isLoading, error: profileError } = useCurrentUserProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [photoDialog, setPhotoDialog] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');
    setLocation(profile.location);
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <AppScreen contentStyle={styles.content}>
        <AppHeader title="Mi perfil" onBackPress={() => router.back()} rightIcon="cog-outline" onRightPress={() => router.push('/settings')} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, paddingHorizontal: 16 }}>
          {isLoading ? 'Cargando tu perfil desde el servidor...' : 'No encontramos tu perfil de sesión.'}
        </Text>
      </AppScreen>
    );
  }

  const update = () => {
    if (!profile) return;
    const next: Errors = {};
    if (name.trim().length < 3) next.name = 'Ingresá tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingresá un correo válido.';
    if (!/^\+?[0-9\s-]{8,18}$/.test(phone)) next.phone = 'Ingresá un teléfono válido, por ejemplo +54 299 555 0147.';
    if (location.trim().length < 4) next.location = 'Indicá una ciudad o barrio aproximado.';
    setErrors(next);
    if (Object.keys(next).length) return;
    updateProfile({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), location: location.trim(), initials: name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() });
    setStatus('Perfil actualizado correctamente.');
  };

  const selectPhoto = async (source: 'camera' | 'library') => {
    if (!profile) return;
    setPhotoDialog(false);
    try {
      const images = await pickImages(source, false);
      if (!images[0]) return;
      updateProfile({ imageUri: images[0].uri });
      setStatus('Foto de perfil actualizada.');
    } catch (error) {
      setStatus(getPickImageErrorMessage(error));
    }
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Mi perfil" onBackPress={() => router.back()} rightIcon="cog-outline" onRightPress={() => router.push('/settings')} />

      {profileError ? (
        <Surface elevation={0} style={[styles.statusCard, { backgroundColor: theme.colors.surfaceVariant, marginHorizontal: 16 }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>{profileError}</Text>
        </Surface>
      ) : null}

      <View style={styles.hero}>
        <AuthorAvatar author={profile} size={94} />
        <View style={styles.heroCopy}>
          <Text variant="headlineSmall" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>{profile.name}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{profile.accountType === 'organization' ? 'Cuenta de organización' : 'Cuenta personal'} · desde {formatDate(profile.memberSince)}</Text>
          <View style={styles.ratingRow}><RatingStars value={profile.rating} size={18} /><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{profile.rating.toFixed(1)} ({profile.reviewCount})</Text></View>
          <Button mode="outlined" compact icon="camera-outline" onPress={() => setPhotoDialog(true)} style={styles.photoButton}>Cambiar foto</Button>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Button mode="outlined" icon="clipboard-text-outline" onPress={() => router.push('/my-posts')}>Mis publicaciones</Button>
        <Button mode="outlined" icon="bookmark-outline" onPress={() => router.push('/saved-posts')}>Guardadas ({savedPosts.length})</Button>
        <Button mode="outlined" icon="cog-outline" onPress={() => router.push('/settings')}>Configuración</Button>
      </View>

      <Surface elevation={0} style={[styles.trustCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.trustItem}><MaterialCommunityIcons name="handshake-outline" size={24} color={theme.colors.primary} /><Text variant="titleLarge" style={styles.trustNumber}>{profile.completedExchanges}</Text><Text variant="bodySmall" style={styles.trustLabel}>Intercambios completados</Text></View>
        <View style={[styles.trustDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.trustItem}><MaterialCommunityIcons name="star-outline" size={24} color="#9A6700" /><Text variant="titleLarge" style={styles.trustNumber}>{profile.rating.toFixed(1)}</Text><Text variant="bodySmall" style={styles.trustLabel}>Puntaje de la comunidad</Text></View>
      </Surface>

      <Surface elevation={0} style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.sectionHeader}><MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.onSurfaceVariant} /><Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Información personal</Text></View>
        <TextInput mode="outlined" label="Nombre completo" value={name} onChangeText={value => { setName(value.slice(0, 80)); setErrors(current => ({ ...current, name: undefined })); }} error={Boolean(errors.name)} />
        <FieldMessage message={errors.name} />
        <TextInput mode="outlined" label="Correo electrónico" value={email} onChangeText={value => { setEmail(value); setErrors(current => ({ ...current, email: undefined })); }} keyboardType="email-address" autoCapitalize="none" error={Boolean(errors.email)} />
        <FieldMessage message={errors.email} />
        <TextInput mode="outlined" label="Teléfono" value={phone} onChangeText={value => { setPhone(value.replace(/[^0-9+\s-]/g, '')); setErrors(current => ({ ...current, phone: undefined })); }} keyboardType="phone-pad" error={Boolean(errors.phone)} left={<TextInput.Icon icon="phone-outline" />} />
        <FieldMessage message={errors.phone} />
        <TextInput mode="outlined" label="Ciudad o barrio" value={location} onChangeText={value => { setLocation(value); setErrors(current => ({ ...current, location: undefined })); }} error={Boolean(errors.location)} left={<TextInput.Icon icon="map-marker-outline" />} />
        <FieldMessage message={errors.location} />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Solo se muestra una zona aproximada. No ingreses tu dirección exacta.</Text>
        <Button mode="contained" contentStyle={styles.buttonContent} onPress={update}>Actualizar perfil</Button>
        {status ? <Surface accessibilityRole="alert" elevation={0} style={[styles.statusCard, { backgroundColor: theme.colors.surfaceVariant }]}><Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>{status}</Text></Surface> : null}
      </Surface>

      <Portal>
        <Dialog visible={photoDialog} onDismiss={() => setPhotoDialog(false)}>
          <Dialog.Title>Cambiar foto</Dialog.Title>
          <Dialog.Content style={styles.photoOptions}><Button mode="contained" icon="camera-outline" onPress={() => selectPhoto('camera')}>Tomar con la cámara</Button><Button mode="outlined" icon="image-outline" onPress={() => selectPhoto('library')}>Elegir de la biblioteca</Button></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setPhotoDialog(false)}>Cancelar</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </AppScreen>
  );
}

function FieldMessage({ message }: { message?: string }) {
  const theme = useTheme();
  return message ? <Text accessibilityRole="alert" variant="bodySmall" style={{ color: theme.colors.error }}>{message}</Text> : null;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, gap: 18 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16 },
  heroCopy: { flex: 1, gap: 3 },
  pageTitle: { fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoButton: { alignSelf: 'flex-start', marginTop: 4 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  trustCard: { flexDirection: 'row', borderRadius: 18, marginHorizontal: 16, padding: 16 },
  trustItem: { flex: 1, alignItems: 'center', gap: 3 },
  trustDivider: { width: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  trustNumber: { color: '#1B1C1C', textAlign: 'center', fontWeight: '800' },
  trustLabel: { color: '#40493D', textAlign: 'center' },
  sectionCard: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 16, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontWeight: '800' },
  buttonContent: { minHeight: 48 },
  statusCard: { borderRadius: 12, padding: 12 },
  photoOptions: { gap: 10 },
});
