import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Surface, Text, useTheme } from 'react-native-paper';

import { AppScreen } from '@/components';

const impactSteps = [
  { icon: 'gift-outline', label: 'Ofrecé' },
  { icon: 'account-group-outline', label: 'Conectá' },
  { icon: 'heart-outline', label: 'Ayudá' },
] as const;

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();

  // Esta portada presenta la identidad del producto y conduce a la autenticación.
  return (
    <AppScreen contentStyle={[styles.content, { backgroundColor: theme.colors.background }]}>
      <View style={styles.brand}>
        <Avatar.Icon
          size={44}
          icon="hand-heart"
          color={theme.colors.onPrimary}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.brandCopy}>
          <Text variant="titleMedium" style={[styles.brandName, { color: theme.colors.onSurface }]}>
            Nexo Solidario
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Una comunidad que se ayuda
          </Text>
        </View>
      </View>

      <Surface
        style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}
        elevation={2}>
        <View style={styles.decorLarge} />
        <View style={styles.decorSmall} />

        <View style={styles.heroIconWrap}>
          <Avatar.Icon
            size={96}
            icon="hand-heart"
            color={theme.colors.primary}
            style={[styles.heroIcon, { backgroundColor: theme.colors.surface }]}
          />
        </View>

        <View style={styles.impactRow}>
          {impactSteps.map(step => (
            <View key={step.label} style={styles.impactItem}>
              <Avatar.Icon
                size={30}
                icon={step.icon}
                color={theme.colors.onPrimary}
                style={styles.impactIcon}
              />
              <Text variant="labelMedium" style={styles.impactLabel}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </Surface>

      <View style={styles.copy}>
        <Text variant="labelLarge" style={[styles.eyebrow, { color: theme.colors.primary }]}>
          SOLIDARIDAD CERCA TUYO
        </Text>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Lo que tenés puede cambiar el día de alguien
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Publicá lo que necesitás o aquello que podés donar y conectá con personas de tu comunidad.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="account-plus-outline"
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={styles.button}
          onPress={() => router.push('/auth')}>
          Crear una cuenta
        </Button>
        <Button
          mode="outlined"
          icon="login"
          textColor={theme.colors.onSurface}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={[styles.button, { borderColor: theme.colors.outlineVariant }]}
          onPress={() => router.push('/auth')}>
          Ya tengo una cuenta
        </Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandCopy: {
    flex: 1,
  },
  brandName: {
    fontWeight: '800',
  },
  heroCard: {
    width: '100%',
    minHeight: 240,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 999,
    top: -105,
    right: -72,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  decorSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    bottom: -62,
    left: -24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  impactRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    minWidth: 72,
    alignItems: 'center',
    gap: 4,
  },
  impactIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  impactLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  copy: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  eyebrow: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
  buttonContent: {
    minHeight: 52,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    borderRadius: 14,
  },
});
