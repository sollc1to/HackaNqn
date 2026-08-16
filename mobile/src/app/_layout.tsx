import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperTheme } from '@/theme/paper-theme';
import { AppDataProvider } from '@/state/app-data-context';

// esta raiz deja el theme visual listo para todas las views nuevas.
export default function RootLayout() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={paperTheme}
        settings={{
          // este renderer de iconos permite que paper use los glyphs de expo.
          icon: props => <MaterialCommunityIcons {...props} />,
        }}>
        <AppDataProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: paperTheme.colors.background },
              headerShown: false,
            }}
          />
        </AppDataProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
