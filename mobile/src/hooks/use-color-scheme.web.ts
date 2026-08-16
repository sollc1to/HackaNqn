import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * este hook recalcula el esquema en web para evitar desajustes con el render estatico.
 */
export function useColorScheme() {
  // este estado marca cuando la app ya hidrato en el cliente.
  const [hasHydrated, setHasHydrated] = useState(false);

  // este efecto activa la lectura real del sistema solo despues de montar.
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // esta lectura usa el esquema nativo del dispositivo.
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  // antes de hidratar, devolvemos light para mantener la salida estable.
  return 'light';
}
