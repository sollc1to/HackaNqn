import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { AppScreen, SegmentedControl } from '@/components';

type AuthMode = 'signin' | 'signup';

export function AuthView() {
  const router = useRouter();
  const theme = useTheme();
  // este estado define si mostramos ingreso o registro.
  const [mode, setMode] = useState<AuthMode>('signin');
  // este estado recuerda si el usuario quiere mantener la sesion.
  const [rememberMe, setRememberMe] = useState(true);
  // este estado alterna la visibilidad de la contrasena.
  const [showPassword, setShowPassword] = useState(false);

  // esta pantalla cubre ingreso y registro con el mismo marco visual.
  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Surface style={[styles.logoWrap, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <IconButton icon="hand-heart" size={28} iconColor={theme.colors.onPrimary} />
        </Surface>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primaryContainer }]}>
          red solidaria
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          conecta comunidades para construir una red de ayuda mas fuerte.
        </Text>
      </View>

      <Surface style={styles.card} elevation={0}>
        <SegmentedControl
          value={mode}
          onValueChange={value => {
            // este cambio conmuta entre las dos variantes del formulario.
            setMode(value as AuthMode);
          }}
          options={[
            { value: 'signin', label: 'sign in' },
            { value: 'signup', label: 'sign up' },
          ]}
        />

        <View style={styles.form}>
          {mode === 'signup' ? (
              <TextInput
                mode="outlined"
                label="full name"
                placeholder="maria gonzalez"
                outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primaryContainer}
              style={styles.input}
            />
          ) : null}

          <TextInput
            mode="outlined"
            label="email address"
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primaryContainer}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label={mode === 'signup' ? 'create password' : 'password'}
            placeholder={mode === 'signup' ? 'min. 8 characters' : '••••••••'}
            secureTextEntry={!showPassword}
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primaryContainer}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => {
                  // este icono alterna la visibilidad de la contrasena.
                  setShowPassword(current => !current);
                }}
              />
            }
          />

          {mode === 'signin' ? (
            <View style={styles.rowBetween}>
              <View style={styles.rememberWrap}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => {
                    // este control guarda la preferencia de sesion.
                    setRememberMe(current => !current);
                  }}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  remember me
                </Text>
              </View>
              <Button mode="text" compact textColor={theme.colors.primaryContainer}>
                forgot password?
              </Button>
            </View>
          ) : (
            <Text variant="bodySmall" style={[styles.terms, { color: theme.colors.onSurfaceVariant }]}>
              al crear una cuenta aceptas los terminos de servicio y la politica de privacidad.
            </Text>
          )}

          <Button
            mode="contained"
            buttonColor={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimary}
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={() => {
              // esta ruta reemplaza el auth por el dashboard principal.
              router.replace('./dashboard');
            }}>
            {mode === 'signin' ? 'sign in' : 'create account'}
          </Button>

          <View style={styles.orBlock}>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              or continue with
            </Text>
            <Divider style={styles.divider} />
          </View>

          <Button
            mode="outlined"
            icon="google"
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={() => {
              // este acceso secundario tambien lleva al tablero principal.
              router.replace('./dashboard');
            }}>
            provider
          </Button>
        </View>
      </Surface>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  // este contenedor organiza la pantalla en bloques simples.
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  // este encabezado centra la identidad visual de acceso.
  header: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  // este bloque redondo actua como ancla del logo.
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este titulo refuerza la marca de manera directa.
  title: {
    fontWeight: '800',
    textTransform: 'none',
  },
  // este texto acompana sin competir con el titulo.
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  // esta card contiene el formulario con ritmo visual uniforme.
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 16,
  },
  // esta capa agrupa los campos de acceso.
  form: {
    gap: 14,
  },
  // este input mantiene una altura tactil consistente.
  input: {
    backgroundColor: '#FFFFFF',
  },
  // esta fila reparte recordar usuario y recuperar clave.
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // este bloque alinea checkbox y texto.
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // este bloque separa el boton principal del secundario.
  orBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // estas lineas sostienen el separador sin robar atencion.
  divider: {
    flex: 1,
  },
  // este texto deja claro el alcance legal de la cuenta.
  terms: {
    lineHeight: 20,
  },
  // esta altura normaliza los botones de la pantalla.
  buttonContent: {
    minHeight: 48,
  },
  // este radio coincide con el lenguaje visual del producto.
  button: {
    borderRadius: 8,
  },
});
