import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

type CategoryChipProps = {
  // este texto describe la categoria visible.
  label: string;
  // este estado marca la categoria seleccionada.
  selected?: boolean;
  // este icono opcional acompana el chip.
  icon?: string;
  // esta accion se ejecuta al tocar el chip.
  onPress: () => void;
};

export function CategoryChip({ label, selected = false, icon, onPress }: CategoryChipProps) {
  const theme = useTheme();

  // este chip sigue la logica de filtros rapidos del sistema visual.
  return (
    <Chip
      icon={icon}
      selected={selected}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
        },
      ]}
      textStyle={[
        styles.text,
        {
          color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
        },
      ]}>
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  // este chip conserva una forma suave y tactil.
  chip: {
    minHeight: 40,
  },
  // este texto prioriza legibilidad y contraste.
  text: {
    fontWeight: '600',
  },
});
