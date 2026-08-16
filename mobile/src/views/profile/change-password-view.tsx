import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen } from '@/components';

type PasswordErrors = Partial<Record<'current' | 'next' | 'confirm', string>>;

export function ChangePasswordView() {
  const router = useRouter();
  const theme = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [success, setSuccess] = useState(false);

  const submit = () => {
    const nextErrors: PasswordErrors = {};
    if (!current) nextErrors.current = 'Ingresá tu contraseña actual.';
    if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next)) nextErrors.next = 'Usá al menos 8 caracteres, una mayúscula, una minúscula y un número.';
    if (confirm !== next) nextErrors.confirm = 'Las contraseñas no coinciden.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setCurrent(''); setNext(''); setConfirm(''); setSuccess(true);
  };

  return <AppScreen contentStyle={styles.content}>
    <AppHeader title="Cambiar contraseña" onBackPress={() => router.back()} />
    <Surface elevation={0} style={[styles.info, { backgroundColor: theme.colors.surfaceVariant }]}><MaterialCommunityIcons name="information-outline" size={22} color={theme.colors.onSurfaceVariant} /><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>En esta demo se valida el formato y se confirma el flujo. La actualización real deberá conectarse al servicio de autenticación.</Text></Surface>
    <Surface elevation={0} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <TextInput mode="outlined" label="Contraseña actual" value={current} onChangeText={value => { setCurrent(value); setErrors(error => ({ ...error, current: undefined })); setSuccess(false); }} secureTextEntry error={Boolean(errors.current)} />
      <ErrorMessage message={errors.current} />
      <TextInput mode="outlined" label="Nueva contraseña" value={next} onChangeText={value => { setNext(value); setErrors(error => ({ ...error, next: undefined })); setSuccess(false); }} secureTextEntry error={Boolean(errors.next)} />
      <ErrorMessage message={errors.next} />
      <TextInput mode="outlined" label="Repetir nueva contraseña" value={confirm} onChangeText={value => { setConfirm(value); setErrors(error => ({ ...error, confirm: undefined })); setSuccess(false); }} secureTextEntry error={Boolean(errors.confirm)} />
      <ErrorMessage message={errors.confirm} />
      <Button mode="contained" contentStyle={styles.button} onPress={submit}>Actualizar contraseña</Button>
      {success ? <Surface accessibilityRole="alert" elevation={0} style={[styles.success, { backgroundColor: theme.colors.primaryContainer }]}><MaterialCommunityIcons name="check-circle-outline" size={22} color={theme.colors.primary} /><Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>Contraseña validada y actualizada en la sesión de demostración.</Text></Surface> : null}
    </Surface>
  </AppScreen>;
}

function ErrorMessage({ message }: { message?: string }) { const theme = useTheme(); return message ? <Text accessibilityRole="alert" variant="bodySmall" style={{ color: theme.colors.error }}>{message}</Text> : null; }

const styles = StyleSheet.create({ content: { gap: 16, paddingBottom: 28 }, info: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 16, marginHorizontal: 16, padding: 14 }, card: { borderWidth: 1, borderRadius: 18, marginHorizontal: 16, padding: 16, gap: 9 }, button: { minHeight: 48 }, success: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 14, padding: 12 } });
