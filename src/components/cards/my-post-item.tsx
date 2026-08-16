import { StyleSheet, View } from 'react-native';
import { Avatar, Chip, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';

type MyPostItemProps = {
  // este titulo resume la publicacion.
  title: string;
  // este tipo ayuda a distinguir entre oferta y pedido.
  postType: 'offer' | 'request';
  // este estado define el tono visual de la publicacion.
  status: 'active' | 'completed' | 'inactive';
  // este resumen agrega contexto rapido al item.
  subtitle: string;
  // este detalle pequeño muestra la actividad asociada.
  meta: string;
  // este icono reemplaza la miniatura cuando no hay imagen real.
  icon: string;
  // esta accion se dispara al tocar la tarjeta.
  onPress?: () => void;
};

export function MyPostItem({ title, postType, status, subtitle, meta, icon, onPress }: MyPostItemProps) {
  const theme = useTheme();

  const typeLabel = postType === 'offer' ? 'oferta' : 'pedido';
  const statusLabel = status === 'active' ? 'activa' : status === 'completed' ? 'completada' : 'inactiva';
  const statusColor =
    status === 'active'
      ? theme.colors.primaryContainer
      : status === 'completed'
        ? theme.colors.secondary
        : theme.colors.onSurfaceVariant;

  // esta tarjeta replica el listado compacto del panel de mis publicaciones.
  return (
    <TouchableRipple onPress={onPress} borderless style={styles.ripple}>
      <Surface
        style={[
          styles.card,
          {
            borderColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
          },
        ]}
        elevation={0}>
        <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Avatar.Icon size={48} icon={icon} color={theme.colors.primaryContainer} style={{ backgroundColor: 'transparent' }} />
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Chip compact style={styles.typeChip} textStyle={styles.typeText}>
              {typeLabel}
            </Chip>
            <View style={styles.statusWrap}>
              <View style={[styles.dot, { backgroundColor: statusColor }]} />
              <Text variant="labelSmall" style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {title}
          </Text>

          <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {subtitle}
          </Text>

          <Text variant="labelSmall" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </Surface>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  // este ripple mantiene un area tactil amable.
  ripple: {
    borderRadius: 16,
  },
  // esta card usa una composicion horizontal compacta.
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  // esta miniatura mantiene una proporción consistente.
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este bloque central sostiene toda la informacion textual.
  body: {
    flex: 1,
    gap: 6,
  },
  // esta fila ubica el tipo y el estado.
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  // este chip marca el tipo de publicacion.
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAE8E7',
  },
  // este texto del chip evita mayusculas visuales innecesarias.
  typeText: {
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'none',
  },
  // este contenedor alinea punto y estado.
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // este punto replica el indicador simple del diseño.
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  // este estado debe leerse rapido.
  statusText: {
    fontWeight: '700',
    textTransform: 'none',
  },
  // este titulo aporta la jerarquia principal.
  title: {
    fontWeight: '700',
  },
  // este subtitulo acompana sin invadir.
  subtitle: {
    lineHeight: 18,
  },
  // este meta cierra el item con un dato util.
  meta: {
    fontWeight: '500',
  },
});
