import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { AppScreen } from '@/components';

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.brandRow}>
        <Surface style={[styles.logo, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <MaterialCommunityIcons name="hand-heart-outline" size={26} color={theme.colors.primary} />
        </Surface>
        <Text variant="titleMedium" style={[styles.brand, { color: theme.colors.onSurface }]}>
          Nexo Solidario
        </Text>
      </View>

      <View style={styles.hero}>
        <Surface style={[styles.symbol, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <MaterialCommunityIcons name="hand-heart" size={72} color={theme.colors.primary} />
        </Surface>

        <View style={styles.copy}>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            Ayuda que encuentra a quien la necesita
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Una red local para ofrecer y solicitar donaciones en Neuquén de forma clara y segura.
          </Text>
        </View>

        <Surface
          elevation={0}
          style={[
            styles.trustCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color={theme.colors.onSurfaceVariant} />
          <View style={styles.trustCopy}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
              Comunidad de Neuquén
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Personas y organizaciones verificadas cerca tuyo
            </Text>
          </View>
        </Surface>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          contentStyle={styles.buttonContent}
          style={styles.button}
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}>
          Crear una cuenta
        </Button>
        <Button
          mode="outlined"
          textColor={theme.colors.onSurface}
          contentStyle={styles.buttonContent}
          style={[styles.button, { borderColor: theme.colors.outlineVariant }]}
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'signin' } })}>
          Iniciar sesión
        </Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: '800',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 36,
  },
  symbol: {
    width: 148,
    height: 148,
    borderRadius: 44,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    maxWidth: 360,
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 42,
  },
  subtitle: {
    maxWidth: 360,
    textAlign: 'center',
    lineHeight: 25,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  trustCopy: {
    flex: 1,
    gap: 2,
  },
  actions: {
    gap: 12,
  },
  buttonContent: {
    minHeight: 52,
  },
  button: {
    borderRadius: 14,
  },
});
