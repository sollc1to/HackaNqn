import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableRipple, useTheme } from 'react-native-paper';

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function RatingStars({ value, onChange, size = 22 }: RatingStarsProps) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={`Puntaje: ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map(star =>
        onChange ? (
          <TouchableRipple
            key={star}
            borderless
            accessibilityRole="button"
            accessibilityLabel={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            accessibilityState={{ selected: star === value }}
            onPress={() => onChange(star)}
            style={styles.starButton}>
            <MaterialCommunityIcons
              name={star <= value ? 'star' : 'star-outline'}
              size={size}
              color={star <= value ? '#9A6700' : theme.colors.onSurfaceVariant}
            />
          </TouchableRipple>
        ) : (
          <MaterialCommunityIcons
            key={star}
            name={star <= Math.round(value) ? 'star' : 'star-outline'}
            size={size}
            color={star <= Math.round(value) ? '#9A6700' : theme.colors.onSurfaceVariant}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' }, starButton: { borderRadius: 999, padding: 4 } });
