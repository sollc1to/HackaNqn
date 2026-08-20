import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

import { formatDate, localDateToIso } from '@/utils/date';

type AppDatePickerProps = {
  label: string;
  value?: string;
  onChange: (iso: string | undefined) => void;
  error?: boolean;
  helperText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function AppDatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  minimumDate = new Date(),
  maximumDate,
}: AppDatePickerProps) {
  const theme = useTheme();
  const initial = value ? new Date(value) : maximumDate ?? minimumDate;
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const days = useMemo(() => {
    const firstWeekDay = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(firstWeekDay).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [month]);

  const selectedKey = value ? new Date(value).toDateString() : '';
  const min = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate());
  const max = maximumDate ? new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate()) : undefined;

  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        value={value ? formatDate(value) : ''}
        placeholder="Seleccioná una fecha"
        editable={false}
        error={error}
        onPressIn={() => setVisible(true)}
        left={<TextInput.Icon icon="calendar-outline" onPress={() => setVisible(true)} />}
        right={
          value ? <TextInput.Icon icon="close" accessibilityLabel="Quitar fecha" onPress={() => onChange(undefined)} /> : undefined
        }
        outlineColor={theme.colors.outlineVariant}
        activeOutlineColor={theme.colors.primary}
        accessibilityLabel={`${label}. ${value ? formatDate(value) : 'Sin seleccionar'}`}
      />
      {helperText ? (
        <Text variant="bodySmall" style={{ color: error ? theme.colors.error : theme.colors.onSurfaceVariant }}>
          {helperText}
        </Text>
      ) : null}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.monthHeader}>
              <IconButton
                icon="chevron-left"
                onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                accessibilityLabel="Mes anterior"
              />
              <Text variant="titleMedium" style={styles.monthTitle}>
                {new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(month)}
              </Text>
              <IconButton
                icon="chevron-right"
                onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                accessibilityLabel="Mes siguiente"
              />
            </View>
            <View style={styles.calendarGrid}>
              {weekDays.map((day, index) => (
                <Text key={`${day}-${index}`} variant="labelMedium" style={[styles.weekDay, { color: theme.colors.onSurfaceVariant }]}>
                  {day}
                </Text>
              ))}
              {days.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const date = new Date(month.getFullYear(), month.getMonth(), day);
                const disabled = date < min || (max ? date > max : false);
                const selected = date.toDateString() === selectedKey;
                return (
                  <TouchableRipple
                    key={date.toISOString()}
                    borderless
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={new Intl.DateTimeFormat('es-AR', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    }).format(date)}
                    accessibilityState={{ disabled, selected }}
                    onPress={() => {
                      const localKey = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`;
                      onChange(localDateToIso(localKey));
                      setVisible(false);
                    }}
                    style={[styles.dayCell, selected && { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: selected ? theme.colors.onPrimary : disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface }}>
                      {day}
                    </Text>
                  </TouchableRipple>
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  dialog: { width: '92%', maxWidth: 420, alignSelf: 'center', borderRadius: 24 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { textTransform: 'capitalize', fontWeight: '800' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 8 },
  weekDay: { width: '14.285%', textAlign: 'center', paddingVertical: 8, fontWeight: '800' },
  dayCell: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
});
