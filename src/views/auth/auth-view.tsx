import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Checkbox,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { AppScreen, SegmentedControl } from '@/components';

type AuthMode = 'signin' | 'signup';

export function AuthView() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const theme = useTheme();
  const requestedMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const [mode, setMode] = useState<AuthMode>(requestedMode === 'signup' ? 'signup' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (requestedMode === 'signup' || requestedMode === 'signin') setMode(requestedMode);
  }, [requestedMode]);

  const submit = async () => {
    const normalizedEmail = email.trim();

    if (mode === 'signup' && name.trim().length < 3) {
      setMessage('Ingresá tu nombre completo.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage('Ingresá un correo electrónico válido.');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setMessage('La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.');
      return;
    }

    setSubmitting(true);
    // Pausa breve para que el usuario vea que la acción fue recibida.
    await new Promise(resolve => setTimeout(resolve, 450));
    router.replace('/dashboard');
  };

  const recoverPassword = () => {
    if (!email.trim().includes('@')) {
      setMessage('Primero ingresá el correo de tu cuenta.');
      return;
    }

    setMessage(`Flujo de demostración iniciado para ${email.trim()}. El envío real requiere conectar el servicio de autenticación.`);
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <IconButton icon="arrow-left" onPress={() => router.back()} style={styles.backButton} />

      <View style={styles.header}>
        <Surface style={[styles.logo, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <MaterialCommunityIcons name="hand-heart" size={34} color={theme.colors.primary} />
        </Surface>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Nexo Solidario
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Conectamos ayuda local en Neuquén.
        </Text>
      </View>

      <Surface
        elevation={0}
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <SegmentedControl
          value={mode}
          onValueChange={value => setMode(value as AuthMode)}
          options={[
            { value: 'signin', label: 'Iniciar sesión' },
            { value: 'signup', label: 'Registrarse' },
          ]}
        />

        <View style={styles.form}>
          {mode === 'signup' ? (
            <TextInput
              mode="outlined"
              label="Nombre completo"
              placeholder="María González"
            value={name}
              onChangeText={value => { setName(value); setMessage(''); }}
              autoComplete="name"
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              style={styles.input}
            />
          ) : null}

          <TextInput
            mode="outlined"
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChangeText={value => { setEmail(value); setMessage(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label={mode === 'signup' ? 'Crear contraseña' : 'Contraseña'}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={value => { setPassword(value); setMessage(''); }}
            secureTextEntry={!showPassword}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPassword(current => !current)}
              />
            }
          />

          {mode === 'signin' ? (
            <View style={styles.optionsRow}>
              <View style={styles.rememberWrap}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(current => !current)}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Recordarme
                </Text>
              </View>
              <Button mode="text" compact onPress={recoverPassword}>
                Recuperar contraseña
              </Button>
            </View>
          ) : (
            <View style={styles.termsWrap}>
              <Text variant="bodySmall" style={[styles.terms, { color: theme.colors.onSurfaceVariant }]}>Al crear una cuenta aceptás los términos y la política de privacidad.</Text>
              <Button compact mode="text" onPress={() => router.push({ pathname: '/safety', params: { section: 'policies' } })}>Leer políticas</Button>
            </View>
          )}

          {message ? (
            <Surface accessibilityRole="alert" elevation={0} style={[styles.messageCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface, flex: 1 }}>{message}</Text>
            </Surface>
          ) : null}

          <Button
            mode="contained"
            loading={submitting}
            disabled={submitting}
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={submit}>
            {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </View>
      </Surface>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 20,
  },
  backButton: {
    marginLeft: -8,
    marginTop: 4,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 18,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  terms: {
    lineHeight: 20,
  },
  termsWrap: {
    gap: 2,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 11,
  },
  buttonContent: {
    minHeight: 50,
  },
  button: {
    borderRadius: 12,
  },
});
