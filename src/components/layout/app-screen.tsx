import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppScreenProps = {
  // este contenido se usa para montar pantallas con o sin scroll.
  children: ReactNode;
  // este footer queda fijo al final de la pantalla.
  footer?: ReactNode;
  // este estilo permite ajustar el contenedor interno desde cada view.
  contentStyle?: StyleProp<ViewStyle>;
  // cuando esta activo, el contenido principal usa scroll vertical.
  scrollable?: boolean;
};

export function AppScreen({ children, footer, contentStyle, scrollable = true }: AppScreenProps) {
  const theme = useTheme();

  // este contenedor unifica fondo, safe area y espaciado base.
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.surface} elevation={0}>
        <View style={styles.frame}>
          {scrollable ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.content, contentStyle]}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, contentStyle]}>{children}</View>
          )}

          {footer ? (
            <View style={styles.footer}>
              <View style={styles.footerInner}>{footer}</View>
            </View>
          ) : null}
        </View>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // esta raiz ocupa toda la pantalla y evita cortes en notch y gesture areas.
  root: {
    flex: 1,
  },
  // esta superficie mantiene el fondo coherente con el theme.
  surface: {
    flex: 1,
  },
  // este marco mantiene el footer en la parte inferior de la pantalla.
  frame: {
    flex: 1,
  },
  // este scroll ocupa el espacio central disponible.
  scroll: {
    flex: 1,
  },
  // este contenedor concentra el contenido principal de cada pantalla.
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  // este espacio se usa para acciones fijas o barras inferiores.
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  footerInner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
});
