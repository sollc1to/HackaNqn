import { StyleSheet } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';

export type SegmentedOption = {
  // este valor identifica la opcion seleccionada.
  value: string;
  // este texto se muestra al usuario.
  label: string;
};

type SegmentedControlProps = {
  // estas opciones forman el grupo segmentado.
  options: SegmentedOption[];
  // este valor marca la opcion activa.
  value: string;
  // esta accion actualiza la opcion activa.
  onValueChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onValueChange }: SegmentedControlProps) {
  const theme = useTheme();

  // este control replica el cambio entre oferta y pedido del diseño.
  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      buttons={options}
      style={styles.container}
      density="regular"
      theme={{
        colors: {
          secondaryContainer: theme.colors.primaryContainer,
          onSecondaryContainer: theme.colors.onPrimaryContainer,
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  // este contenedor ayuda a mantener bordes suaves y limpios.
  container: {
    borderRadius: 8,
  },
});
