import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';

type AppHeaderProps = {
  // este titulo define la identidad de la pantalla actual.
  title: string;
  // este subtitulo ayuda cuando la pantalla necesita mas contexto.
  subtitle?: string;
  // esta accion permite volver a la pantalla anterior.
  onBackPress?: () => void;
  // esta accion secundaria suele usarse para guardar o abrir menus.
  onRightPress?: () => void;
  // este icono marca la accion secundaria del header.
  rightIcon?: string;
  // este contenido opcional reemplaza el icono secundario.
  rightContent?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  onBackPress,
  onRightPress,
  rightIcon,
  rightContent,
}: AppHeaderProps) {
  const theme = useTheme();

  // este header usa paper para mantener una jerarquia visual consistente.
  return (
    <Appbar.Header
      elevated={false}
      mode="center-aligned"
      style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outlineVariant }]}>
      {onBackPress ? (
        <Appbar.BackAction onPress={onBackPress} accessibilityLabel="Volver" />
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={[styles.title, { color: theme.colors.onSurface }]}
        subtitleStyle={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      />

      {rightContent ? (
        rightContent
      ) : rightIcon ? (
        <Appbar.Action icon={rightIcon} onPress={onRightPress} accessibilityLabel="Acción de la pantalla" />
      ) : (
        <View style={styles.sideSpacer} />
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  // estos espacios laterales mantienen el titulo centrado.
  sideSpacer: {
    width: 48,
  },
  // este header agrega una linea sutil como separacion.
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // este titulo usa una jerarquia mas fuerte que el default de paper.
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  // este subtitulo acompana sin competir con el titulo principal.
  subtitle: {
    fontSize: 13,
    marginTop: -2,
  },
});
