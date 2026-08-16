import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Text, useTheme } from 'react-native-paper';

type ActionListIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ActionListItemProps = {
  // este titulo describe la accion principal.
  title: string;
  // este subtitulo aporta contexto adicional.
  description?: string;
  // este icono identifica la accion de forma rapida.
  icon: ActionListIconName;
  // esta bandera resalta el item activo.
  active?: boolean;
  // esta accion se dispara al tocar la fila.
  onPress: () => void;
};

export function ActionListItem({ title, description, icon, active = false, onPress }: ActionListItemProps) {
  const theme = useTheme();

  // este item sirve para menus, perfiles y accesos rapidos.
  return (
    <List.Item
      onPress={onPress}
      title={
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      }
      description={
        description ? (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : undefined
      }
      left={props => (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
            },
          ]}>
          <MaterialCommunityIcons name={icon} size={22} color={active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} />
        </View>
      )}
      right={() => <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />}
      style={[
        styles.container,
        {
          borderLeftColor: active ? theme.colors.primaryContainer : 'transparent',
          backgroundColor: theme.colors.surface,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // esta fila deja una altura tactil consistente.
  container: {
    borderLeftWidth: 4,
    paddingVertical: 8,
  },
  // este bloque de icono equilibra la composicion.
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  // este titulo sostiene la jerarquia del menu.
  title: {
    fontWeight: '700',
  },
  // este subtitulo baja el contraste sin perder legibilidad.
  description: {
    marginTop: 2,
  },
});
