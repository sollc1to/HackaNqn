import { type ReactNode, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Avatar,
  Button,
  Portal,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { AppHeader, AppScreen, SegmentedControl } from '@/components';
import { currentUser } from '@/data/profile';
import { pickImage } from '@/utils/pick-image';

function SectionCard({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <Surface
      elevation={0}
      style={[
        styles.sectionCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
      ]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as never} size={22} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
      {children}
    </Surface>
  );
}

export function PersonalDataView() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [location, setLocation] = useState(currentUser.location);
  const [photoUri, setPhotoUri] = useState(currentUser.imageUri);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const updateProfile = () => {
    if (name.trim().length < 3 || !email.includes('@') || phone.trim().length < 8 || location.trim().length < 4) {
      setFeedback('Revisá los datos del perfil antes de guardar.');
      return;
    }

    setFeedback('Perfil actualizado correctamente.');
  };

  const changePassword = () => {
    if (!currentPassword || newPassword.length < 8) {
      setFeedback('Ingresá tu contraseña actual y una nueva de al menos 8 caracteres.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setFeedback('Contraseña actualizada correctamente.');
  };

  const changePhoto = async () => {
    const selectedUri = await pickImage(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    );
    if (!selectedUri) return;
    setPhotoUri(selectedUri);
    setFeedback('Foto de perfil actualizada.');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Perfil" onBackPress={() => router.back()} />

      <View style={styles.hero}>
        <Avatar.Image size={94} source={{ uri: photoUri }} />
        <View style={styles.heroCopy}>
          <Text variant="headlineSmall" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
            {name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {currentUser.memberSince}
          </Text>
          <Button mode="outlined" compact icon="camera-outline" onPress={changePhoto} style={styles.photoButton}>
            Cambiar foto
          </Button>
        </View>
      </View>

      <View style={styles.horizontalPadding}>
        <SegmentedControl
          value="personal-data"
          onValueChange={value => {
            if (value === 'my-posts') router.push('/my-posts');
          }}
          options={[
            { value: 'my-posts', label: 'Mis publicaciones' },
            { value: 'personal-data', label: 'Datos personales' },
          ]}
        />
      </View>

      <Surface elevation={0} style={[styles.trustCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.trustItem}>
          <MaterialCommunityIcons name="handshake-outline" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={[styles.trustNumber, { color: theme.colors.onSurface }]}>
            {currentUser.completedExchanges}
          </Text>
          <Text variant="bodySmall" style={[styles.trustLabel, { color: theme.colors.onSurfaceVariant }]}>
            Intercambios completados
          </Text>
        </View>
        <View style={[styles.trustDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.trustItem}>
          <MaterialCommunityIcons name="map-marker-outline" size={24} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleSmall" style={[styles.trustNumber, { color: theme.colors.onSurface }]}>
            Confluencia
          </Text>
          <Text variant="bodySmall" style={[styles.trustLabel, { color: theme.colors.onSurfaceVariant }]}>
            Zona aproximada
          </Text>
        </View>
      </Surface>

      <SectionCard title="Información personal" icon="account-outline">
        <TextInput
          mode="outlined"
          label="Nombre completo"
          value={name}
          onChangeText={setName}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <TextInput
          mode="outlined"
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <TextInput
          mode="outlined"
          label="Teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="phone-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Ciudad o barrio"
          value={location}
          onChangeText={setLocation}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Solo mostramos una zona aproximada; la dirección exacta permanece privada.
        </Text>
        <Button mode="contained" contentStyle={styles.buttonContent} onPress={updateProfile}>
          Actualizar perfil
        </Button>
      </SectionCard>

      <SectionCard title="Seguridad" icon="lock-outline">
        <TextInput
          mode="outlined"
          label="Contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <TextInput
          mode="outlined"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />
        <Button mode="outlined" contentStyle={styles.buttonContent} onPress={changePassword}>
          Cambiar contraseña
        </Button>
      </SectionCard>

      <Portal>
        <Snackbar visible={feedback.length > 0} onDismiss={() => setFeedback('')} duration={2800}>
          {feedback}
        </Snackbar>
      </Portal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    gap: 18,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  horizontalPadding: {
    paddingHorizontal: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  pageTitle: {
    fontWeight: '800',
  },
  photoButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  trustCard: {
    flexDirection: 'row',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  trustDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  trustNumber: {
    textAlign: 'center',
    fontWeight: '800',
  },
  trustLabel: {
    textAlign: 'center',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  buttonContent: {
    minHeight: 48,
  },
});
