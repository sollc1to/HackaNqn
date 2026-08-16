import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

type AppSearchInputProps = Omit<ComponentProps<typeof TextInput>, 'mode' | 'left' | 'right'> & {
  // este callback limpia el contenido actual.
  onClear?: () => void;
};

export function AppSearchInput({ value, onClear, style, ...props }: AppSearchInputProps) {
  const theme = useTheme();
  const hasValue = Boolean(value && String(value).length > 0);

  // este input usa el patron de busqueda del diseño base.
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        value={value}
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        outlineColor={theme.colors.outlineVariant}
        activeOutlineColor={theme.colors.primaryContainer}
        left={<TextInput.Icon icon="magnify" />}
        right={
          hasValue && onClear ? <TextInput.Icon icon="close" onPress={onClear} /> : undefined
        }
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // este contenedor evita que el input pegue con los bordes laterales.
  container: {
    width: '100%',
  },
  // esta altura respeta el objetivo minimo de toque.
  input: {
    minHeight: 48,
  },
});
