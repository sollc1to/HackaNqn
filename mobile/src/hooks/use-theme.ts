/**
 * este hook traduce el esquema del sistema a la paleta local.
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  // este hook comparte la misma lectura que el esquema del dispositivo.
  const scheme = useColorScheme();
  // cuando el sistema no define un esquema, caemos en light por defecto.
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
