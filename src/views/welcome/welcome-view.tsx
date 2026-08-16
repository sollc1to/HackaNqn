import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Surface, Text, useTheme } from 'react-native-paper';

import { AppScreen } from '@/components';

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();

  // esta vista presenta la app con una lectura clara y un arranque simple.
  return (
    <AppScreen
      scrollable={false}
      contentStyle={[styles.content, { backgroundColor: theme.colors.background }]}>
      <View style={styles.hero}>
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <Surface style={styles.heroCard} elevation={1}>
          <View style={styles.heroArt}>
            <View style={[styles.artCircle, { backgroundColor: theme.colors.primaryContainer }]} />
            <View style={[styles.artRing, { borderColor: theme.colors.outlineVariant }]} />
            <Avatar.Icon
              size={112}
              icon="hand-heart"
              color={theme.colors.onPrimary}
              style={[styles.heroIcon, { backgroundColor: theme.colors.primaryContainer }]}
            />
          </View>
        </Surface>
      </View>

      <View style={styles.copy}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Únete. Ayuda. Prospera.
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Conecta personas que pueden ayudar con quienes lo necesitan, de forma simple, clara y organizada.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimary}
          contentStyle={styles.buttonContent}
          style={styles.button}
          onPress={() => router.push('./auth')}>
          Registrarse
        </Button>
        <Button
          mode="outlined"
          textColor={theme.colors.onSurface}
          contentStyle={styles.buttonContent}
          style={styles.button}
          onPress={() => router.push('./auth')}>
          Iniciar Sesión
        </Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  // este contenedor reparte el alto para que el hero quede arriba y las acciones abajo.
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  // este hero centra la pieza visual principal de la portada.
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  // estos circulos dan profundidad sin depender de imagenes externas.
  decorTop: {
    position: 'absolute',
    top: 12,
    right: 4,
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
  },
  // este segundo volumen sostiene el equilibrio visual inferior.
  decorBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(127, 142, 127, 0.08)',
  },
  // esta tarjeta funciona como superficie de bienvenida.
  heroCard: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  // este grupo simula una ilustracion limpia y ligera.
  heroArt: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este aro sostiene la sensacion de profundidad.
  artRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.8,
  },
  // este circulo base ancla la composicion visual.
  artCircle: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 999,
    opacity: 0.12,
  },
  // este icono representa la idea central de solidaridad.
  heroIcon: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  // este bloque recoge la promesa de la pantalla.
  copy: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  // este titulo mantiene un tono fuerte y directo.
  title: {
    textAlign: 'center',
    fontWeight: '800',
    textTransform: 'none',
  },
  // este texto explica la propuesta sin sobrecargar la pantalla.
  subtitle: {
    textAlign: 'center',
  },
  // este bloque de acciones cierra la pantalla con dos rutas claras.
  actions: {
    gap: 12,
  },
  // esta altura uniforme mejora el alcance tactil.
  buttonContent: {
    minHeight: 48,
  },
  // esta anchura permite que ambos botones respiren igual.
  button: {
    borderRadius: 8,
  },
});
