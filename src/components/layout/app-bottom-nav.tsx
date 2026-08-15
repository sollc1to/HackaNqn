import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

type BottomNavIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type BottomNavItem = {
  // esta clave identifica la seccion activa.
  key: string;
  // este texto aparece debajo del icono.
  label: string;
  // este nombre identifica el icono que se renderiza.
  icon: BottomNavIconName;
  // este indicador marca notificaciones o estados pendientes.
  badge?: number | boolean;
};

type AppBottomNavProps = {
  // estas opciones definen las pestañas visibles.
  items: BottomNavItem[];
  // esta clave indica la pestaña seleccionada.
  activeKey: string;
  // esta accion cambia la pestaña activa.
  onChange: (key: string) => void;
};

export function AppBottomNav({ items, activeKey, onChange }: AppBottomNavProps) {
  const theme = useTheme();

  // este nav usa una superficie simple con ripple tactil.
  return (
    <Surface style={[styles.container, { borderTopColor: theme.colors.outlineVariant }]} elevation={2}>
      {items.map(item => {
        const selected = item.key === activeKey;

        return (
          <TouchableRipple
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[
              styles.item,
              selected && { backgroundColor: theme.colors.primaryContainer },
            ]}
            borderless>
            <View style={styles.itemInner}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
                {item.badge ? (
                  <Badge style={styles.badge} size={8}>
                    {typeof item.badge === 'number' ? item.badge : ''}
                  </Badge>
                ) : null}
              </View>

              <Text
                variant="labelSmall"
                style={[
                  styles.label,
                  { color: selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
                ]}>
                {item.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </Surface>
  );
}

const styles = StyleSheet.create({
  // esta barra queda fija al pie de la app.
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  // cada item mantiene un area de toque amplia.
  item: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este contenedor alinea icono y texto en columna.
  itemInner: {
    alignItems: 'center',
    gap: 4,
  },
  // este wrap permite ubicar el badge sobre el icono.
  iconWrap: {
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este badge usa una posicion discreta para no robar protagonismo.
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
  },
  // este label mantiene la lectura simple en mobile.
  label: {
    fontWeight: '600',
  },
});
