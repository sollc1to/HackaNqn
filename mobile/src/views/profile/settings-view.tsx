import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Dialog, Portal, Surface, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen, SegmentedControl } from '@/components';
import { currentUserId, type AccountType } from '@/data/authors';
import { useAppData } from '@/state/app-data-context';

export function SettingsView() {
  const router = useRouter();
  const theme = useTheme();
  const { authors, preferences, updatePreferences, updateProfile, requestVerification, signOut, deleteAccount } = useAppData();
  const profile = authors.find(author => author.id === currentUserId)!;
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title="Configuración" onBackPress={() => router.back()} />

      <SettingsSection title="Tipo de cuenta" icon="account-switch-outline">
        <SegmentedControl
          value={profile.accountType}
          onValueChange={value => updateProfile({ accountType: value as AccountType })}
          options={[{ value: 'person', label: 'Cuenta personal' }, { value: 'organization', label: 'Organización' }]}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Las organizaciones muestran su tipo de perfil de forma explícita y pueden solicitar verificación documental.
        </Text>
        {profile.accountType === 'organization' ? (
          <Surface elevation={0} style={[styles.verificationCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="check-decagram-outline" size={25} color={theme.colors.primary} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
                {profile.verificationStatus === 'pending' ? 'Solicitud en revisión' : profile.verificationStatus === 'verified' ? 'Organización verificada' : 'Verificación pendiente de solicitar'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>En el MVP, la revisión queda simulada y claramente identificada.</Text>
            </View>
            {profile.verificationStatus === 'not-requested' ? <Button compact onPress={requestVerification}>Solicitar</Button> : null}
          </Surface>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Notificaciones" icon="bell-outline">
        <SettingSwitch label="Notificaciones generales" description="Cambios de estado, guardadas y novedades relevantes." value={preferences.notifications} onValueChange={value => updatePreferences({ notifications: value })} />
        <SettingSwitch label="Mensajes" description="Avisos de nuevas respuestas y mensajes sin leer." value={preferences.messageNotifications} onValueChange={value => updatePreferences({ messageNotifications: value })} />
      </SettingsSection>

      <SettingsSection title="Privacidad" icon="shield-account-outline">
        <SettingSwitch label="Mostrar ubicación aproximada" description="Nunca se publica una dirección exacta." value={preferences.showApproximateLocation} onValueChange={value => updatePreferences({ showApproximateLocation: value })} />
        <SettingSwitch label="Permitir reseñas" description="Solo después de intercambios completados." value={preferences.allowReviews} onValueChange={value => updatePreferences({ allowReviews: value })} />
      </SettingsSection>

      <SettingsSection title="Seguridad" icon="lock-outline">
        <SettingsLink icon="key-outline" title="Cambiar contraseña" description="Actualizá tu clave en una pantalla protegida." onPress={() => router.push('/change-password')} />
        <SettingsLink icon="shield-check-outline" title="Confianza y seguridad" description="Moderación, encuentros, estafas y bloqueo." onPress={() => router.push('/safety')} />
        <SettingsLink icon="file-document-outline" title="Términos y políticas" description="Privacidad, convivencia y política de donaciones." onPress={() => router.push({ pathname: '/safety', params: { section: 'policies' } })} />
      </SettingsSection>

      <SettingsSection title="Apariencia" icon="theme-light-dark">
        <View style={styles.appearanceRow}><MaterialCommunityIcons name="white-balance-sunny" size={22} color={theme.colors.onSurfaceVariant} /><View style={{ flex: 1 }}><Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>Tema claro</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>La app declara tema claro; ya no sigue una apariencia automática incompleta.</Text></View></View>
      </SettingsSection>

      <View style={styles.accountActions}>
        <Button mode="outlined" icon="logout" onPress={() => { signOut(); router.replace('/'); }}>Cerrar sesión</Button>
        <Button mode="text" icon="account-remove-outline" textColor={theme.colors.error} onPress={() => setDeleteOpen(true)}>Eliminar cuenta</Button>
      </View>

      <Portal>
        <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)}>
          <Dialog.Title>Eliminar cuenta</Dialog.Title>
          <Dialog.Content><Text>Se eliminarán tus publicaciones locales y se cerrará la sesión de demostración. Esta acción no se puede deshacer dentro de la app.</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDeleteOpen(false)}>Cancelar</Button><Button textColor={theme.colors.error} onPress={() => { deleteAccount(); setDeleteOpen(false); router.replace('/'); }}>Eliminar definitivamente</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </AppScreen>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const theme = useTheme();
  return <Surface elevation={0} style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}><View style={styles.sectionHeader}><MaterialCommunityIcons name={icon as never} size={22} color={theme.colors.onSurfaceVariant} /><Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{title}</Text></View>{children}</Surface>;
}

function SettingSwitch({ label, description, value, onValueChange }: { label: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const theme = useTheme();
  return <TouchableRipple onPress={() => onValueChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} style={styles.settingRipple}><View style={styles.settingRow}><View style={{ flex: 1, gap: 2 }}><Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>{label}</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} /></View></TouchableRipple>;
}

function SettingsLink({ icon, title, description, onPress }: { icon: string; title: string; description: string; onPress: () => void }) {
  const theme = useTheme();
  return <TouchableRipple onPress={onPress} accessibilityRole="link" style={styles.settingRipple}><View style={styles.settingRow}><MaterialCommunityIcons name={icon as never} size={22} color={theme.colors.primary} /><View style={{ flex: 1, gap: 2 }}><Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>{title}</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{description}</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} /></View></TouchableRipple>;
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 30 },
  section: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 14, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, paddingBottom: 2 },
  settingRipple: { borderRadius: 12 },
  settingRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 7 },
  verificationCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  appearanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 8 },
  accountActions: { gap: 8, marginHorizontal: 16 },
});
