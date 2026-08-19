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

import {
  AppDatePicker,
  AppScreen,
  SegmentedControl,
} from '@/components';
import { loginWithBackend, registerWithBackend } from '@/lib/backend-api';

type AuthMode = 'signin' | 'signup';
type AccountType = 'person' | 'organization';

export function AuthView() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const theme = useTheme();

  const requestedMode = Array.isArray(params.mode)
    ? params.mode[0]
    : params.mode;

  const [mode, setMode] = useState<AuthMode>(
    requestedMode === 'signup' ? 'signup' : 'signin'
  );

  const [accountType, setAccountType] = useState<AccountType>('person');

  // Datos de acceso
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Datos personales / de contacto
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState<string | undefined>();
  const [address, setAddress] = useState('');
  const [cuit, setCuit] = useState('');

  // Estado de UI
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (requestedMode === 'signup' || requestedMode === 'signin') {
      setMode(requestedMode);
    }
  }, [requestedMode]);

  const clearMessage = () => setMessage('');

  const validateSignup = () => {
    if (username.trim().length < 4) {
      setMessage('El nombre de usuario debe tener al menos 4 caracteres.');
      return false;
    }

    if (accountType === 'person') {
      if (name.trim().length < 2) {
        setMessage('Ingresá tu nombre.');
        return false;
      }

      if (lastName.trim().length < 2) {
        setMessage('Ingresá tu apellido.');
        return false;
      }

      if (!birthDate) {
        setMessage('Seleccioná tu fecha de nacimiento.');
        return false;
      }
    }

    if (accountType === 'organization') {
      if (organizationName.trim().length < 3) {
        setMessage('Ingresá el nombre de la organización.');
        return false;
      }

      if (name.trim().length < 2 || lastName.trim().length < 2) {
        setMessage('Ingresá el nombre y apellido de la persona responsable.');
        return false;
      }

      const normalizedCuit = cuit.replace(/\D/g, '');

      if (normalizedCuit.length !== 11) {
        setMessage('El CUIT debe contener 11 números.');
        return false;
      }
    }

    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage('Ingresá un correo electrónico válido.');
      return false;
    }

    const normalizedPhone = phone.replace(/\D/g, '');

    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setMessage('Ingresá un número de teléfono válido.');
      return false;
    }

    if (address.trim().length < 5) {
      setMessage('Ingresá un domicilio válido.');
      return false;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setMessage(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
      );
      return false;
    }

    return true;
  };

  const validateSignin = () => {
    if (username.trim().length < 1) {
      setMessage('Ingresá tu correo electrónico.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
      setMessage('Ingresá un correo electrónico válido.');
      return false;
    }

    if (!password) {
      setMessage('Ingresá tu contraseña.');
      return false;
    }

    return true;
  };

  const submit = async () => {
    setMessage('');

    const isValid =
      mode === 'signup'
        ? validateSignup()
        : validateSignin();

    if (!isValid) return;

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const response = await loginWithBackend({
          email: username.trim().toLowerCase(),
          password,
        });

        if (rememberMe && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
          globalThis.localStorage.setItem('nexo-solidario-token', response.token);
          globalThis.localStorage.setItem('nexo-solidario-user', JSON.stringify(response.user));
        }

        setMessage('Sesión iniciada correctamente.');
        router.replace('/dashboard');
        return;
      }

      const response = await registerWithBackend({
        name: (accountType === 'organization' ? organizationName : name).trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        birthDate: birthDate ?? new Date().toISOString(),
        address: address.trim(),
        role: accountType === 'organization' ? 'organizacion' : 'normal',
      });

      if (rememberMe && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.setItem('nexo-solidario-token', response.token);
        globalThis.localStorage.setItem('nexo-solidario-user', JSON.stringify(response.user));
      }

      setMessage('Cuenta creada correctamente.');
      router.replace('/dashboard');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No pudimos completar el acceso.');
    } finally {
      setSubmitting(false);
    }
  };

  const recoverPassword = () => {
    if (!username.trim()) {
      setMessage('Primero ingresá tu nombre de usuario.');
      return;
    }

    setMessage(
      'Flujo de recuperación iniciado. El envío real requiere conectar el servicio de autenticación.'
    );
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <IconButton
        icon="arrow-left"
        onPress={() => router.back()}
        style={styles.backButton}
      />

      <View style={styles.header}>
        <Surface
          style={[
            styles.logo,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          elevation={0}
        >
          <MaterialCommunityIcons
            name="hand-heart"
            size={34}
            color={theme.colors.primary}
          />
        </Surface>

        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Nexo Solidario
        </Text>

        <Text
          variant="bodyLarge"
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Conectamos ayuda local en Neuquén.
        </Text>
      </View>

      <Surface
        elevation={0}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <SegmentedControl
          value={mode}
          onValueChange={value => {
            setMode(value as AuthMode);
            clearMessage();
          }}
          options={[
            { value: 'signin', label: 'Iniciar sesión' },
            { value: 'signup', label: 'Registrarse' },
          ]}
        />

        <View style={styles.form}>
          {mode === 'signup' ? (
            <>
              <View style={styles.fieldGroup}>
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.onSurface }}
                >
                  Tipo de cuenta
                </Text>

                <SegmentedControl
                  value={accountType}
                  onValueChange={value => {
                    setAccountType(value as AccountType);
                    clearMessage();
                  }}
                  options={[
                    { value: 'person', label: 'Persona' },
                    { value: 'organization', label: 'Organización' },
                  ]}
                />
              </View>

              {accountType === 'organization' ? (
                <TextInput
                  mode="outlined"
                  label="Nombre de la organización"
                  placeholder="Ej.: Fundación Manos Neuquinas"
                  value={organizationName}
                  onChangeText={value => {
                    setOrganizationName(value);
                    clearMessage();
                  }}
                  outlineColor={theme.colors.outlineVariant}
                  activeOutlineColor={theme.colors.primary}
                  style={styles.input}
                />
              ) : null}

              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <TextInput
                    mode="outlined"
                    label={
                      accountType === 'organization'
                        ? 'Nombre representante'
                        : 'Nombre'
                    }
                    placeholder="María"
                    value={name}
                    onChangeText={value => {
                      setName(value);
                      clearMessage();
                    }}
                    autoComplete="name"
                    outlineColor={theme.colors.outlineVariant}
                    activeOutlineColor={theme.colors.primary}
                    style={styles.input}
                  />
                </View>

                <View style={styles.column}>
                  <TextInput
                    mode="outlined"
                    label={
                      accountType === 'organization'
                        ? 'Apellido del representante'
                        : 'Apellido'
                    }
                    placeholder="González"
                    value={lastName}
                    onChangeText={value => {
                      setLastName(value);
                      clearMessage();
                    }}
                    outlineColor={theme.colors.outlineVariant}
                    activeOutlineColor={theme.colors.primary}
                    style={styles.input}
                  />
                </View>
              </View>

              {accountType === 'person' ? (
                <AppDatePicker
                  label="Fecha de nacimiento"
                  value={birthDate}
                  onChange={value => {
                    setBirthDate(value);
                    clearMessage();
                  }}
                />
              ) : null}

              {accountType === 'organization' ? (
                <TextInput
                  mode="outlined"
                  label="CUIT"
                  placeholder="Ej.: 30-12345678-9"
                  value={cuit}
                  onChangeText={value => {
                    setCuit(value.replace(/[^0-9-]/g, '').slice(0, 13));
                    clearMessage();
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  outlineColor={theme.colors.outlineVariant}
                  activeOutlineColor={theme.colors.primary}
                  style={styles.input}
                  left={<TextInput.Icon icon="card-account-details-outline" />}
                />
              ) : null}

              <TextInput
                mode="outlined"
                label="Correo electrónico"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  clearMessage();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                outlineColor={theme.colors.outlineVariant}
                activeOutlineColor={theme.colors.primary}
                style={styles.input}
                left={<TextInput.Icon icon="email-outline" />}
              />

              <TextInput
                mode="outlined"
                label="Número de teléfono"
                placeholder="Ej.: 299 123 4567"
                value={phone}
                onChangeText={value => {
                  setPhone(value.replace(/[^0-9+ ]/g, '').slice(0, 18));
                  clearMessage();
                }}
                keyboardType="phone-pad"
                inputMode="tel"
                outlineColor={theme.colors.outlineVariant}
                activeOutlineColor={theme.colors.primary}
                style={styles.input}
                left={<TextInput.Icon icon="phone-outline" />}
              />

          

             
            </>
          ) : (
            <TextInput
              mode="outlined"
              label="Correo electrónico"
              placeholder="nombre@ejemplo.com"
              value={username}
              onChangeText={value => {
                setUsername(value);
                clearMessage();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
            />
          )}

          <TextInput
            mode="outlined"
            label={
              mode === 'signup'
                ? 'Crear contraseña'
                : 'Contraseña'
            }
            placeholder={
              mode === 'signup'
                ? 'Mínimo 8 caracteres'
                : 'Ingresá tu contraseña'
            }
            value={password}
            onChangeText={value => {
              setPassword(value);
              clearMessage();
            }}
            secureTextEntry={!showPassword}
            autoComplete={
              mode === 'signup'
                ? 'new-password'
                : 'current-password'
            }
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                onPress={() =>
                  setShowPassword(current => !current)
                }
              />
            }
          />

          {mode === 'signin' ? (
            <View style={styles.optionsRow}>
              <View style={styles.rememberWrap}>
                <Checkbox
                  status={
                    rememberMe
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() =>
                    setRememberMe(current => !current)
                  }
                />

                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                  }}
                >
                  Recordarme
                </Text>
              </View>

              <Button
                mode="text"
                compact
                onPress={recoverPassword}
              >
                Recuperar contraseña
              </Button>
            </View>
          ) : (
            <View style={styles.termsWrap}>
              <Text
                variant="bodySmall"
                style={[
                  styles.terms,
                  {
                    color:
                      theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                Al crear una cuenta aceptás los términos y la
                política de privacidad.
              </Text>

              <Button
                compact
                mode="text"
                onPress={() =>
                  router.push({
                    pathname: '/safety',
                    params: { section: 'policies' },
                  })
                }
              >
                Leer políticas
              </Button>
            </View>
          )}

          {message ? (
            <Surface
              accessibilityRole="alert"
              elevation={0}
              style={[
                styles.messageCard,
                {
                  backgroundColor:
                    theme.colors.surfaceVariant,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />

              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurface,
                  flex: 1,
                }}
              >
                {message}
              </Text>
            </Surface>
          ) : null}

          <Button
            mode="contained"
            loading={submitting}
            disabled={submitting}
            contentStyle={styles.buttonContent}
            style={styles.button}
            onPress={submit}
          >
            {mode === 'signin'
              ? 'Iniciar sesión'
              : accountType === 'organization'
                ? 'Registrar organización'
                : 'Crear cuenta'}
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

  fieldGroup: {
    gap: 8,
  },

  twoColumns: {
    flexDirection: 'row',
    gap: 10,
  },

  column: {
    flex: 1,
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
