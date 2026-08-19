import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { AppScreen } from '@/components';

const highlights = [
  
];

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.brandRow}>
        <View style={styles.brandIdentity}>
          <Surface
            style={[
              styles.logo,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
            elevation={0}>
            <MaterialCommunityIcons
              name="hand-heart-outline"
              size={24}
              color={theme.colors.primary}
            />
          </Surface>

          <View>
            <Text
              variant="titleMedium"
              style={[styles.brand, { color: theme.colors.onSurface }]}>
              Nexo Solidario
            </Text>
         
          </View>
        </View>

  
      </View>

      <View style={styles.hero}>
        <View style={styles.visualArea}>
          <View
            style={[
              styles.decorCircleLarge,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          />
          <View
            style={[
              styles.decorCircleSmall,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          />

          <Surface
            elevation={1}
            style={[
              styles.mainSymbol,
              { backgroundColor: theme.colors.surface },
            ]}>
            <View
              style={[
                styles.symbolInner,
                { backgroundColor: theme.colors.primaryContainer },
              ]}>
              <MaterialCommunityIcons
                name="hand-heart"
                size={68}
                color={theme.colors.primary}
              />
            </View>
          </Surface>

        </View>

        <View style={styles.copy}>
          <Text
            variant="displaySmall"
            style={[styles.title, { color: theme.colors.onSurface }]}>
Ayudar nos conecta.     
     </Text>

          <Text
            variant="bodyLarge"
            style={[
              styles.subtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}>
            Publicá, encontrá y coordiná.
          </Text>
        </View>

        <View style={styles.highlightsRow}>
          {highlights.map(item => (
            <Surface
              key={item.label}
              elevation={0}
              style={[
                styles.highlight,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}>
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color={theme.colors.primary}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '700',
                }}>
                {item.label}
              </Text>
            </Surface>
          ))}
        </View>

        <Surface
          elevation={0}
          style={[
            styles.communityCard,
            {
              backgroundColor: theme.colors.surfaceVariant,
            },
          ]}>
          <View
            style={[
              styles.communityIcon,
              { backgroundColor: theme.colors.primaryContainer },
            ]}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={24}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.communityCopy}>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onSurface,
                fontWeight: '800',
              }}>
              Una red para la comunidad.
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                lineHeight: 19,
              }}>
              Publicaciones pensadaspara resolver necesidades reales de la comunidad.
            </Text>
          </View>
        </Surface>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="account-plus-outline"
          contentStyle={styles.buttonContent}
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: '/auth',
              params: { mode: 'signup' },
            })
          }>
          Quiero sumarme
        </Button>

        <Button
          mode="text"
          icon="login"
          textColor={theme.colors.onSurface}
          contentStyle={styles.buttonContent}
          style={styles.secondaryButton}
          onPress={() =>
            router.push({
              pathname: '/auth',
              params: { mode: 'signin' },
            })
          }>
          Ya tengo una cuenta
        </Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  locationBadge: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
  },

  visualArea: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  decorCircleLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.55,
  },

  decorCircleSmall: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    right: 28,
    top: 12,
    opacity: 0.5,
  },

  mainSymbol: {
    width: 138,
    height: 138,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  symbolInner: {
    width: 108,
    height: 108,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingCardLeft: {
    position: 'absolute',
    left: 0,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 3,
  },

  floatingCardRight: {
    position: 'absolute',
    right: 0,
    top: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 3,
  },

  miniIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    alignItems: 'flex-start',
    gap: 12,
  },

  title: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.1,
  },

  subtitle: {
    lineHeight: 25,
    maxWidth: 390,
  },

  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },

  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
  },

  communityIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  communityCopy: {
    flex: 1,
    gap: 3,
  },

  actions: {
    gap: 8,
  },

  buttonContent: {
    minHeight: 52,
  },

  primaryButton: {
    borderRadius: 16,
  },

  secondaryButton: {
    borderRadius: 16,
  },
});