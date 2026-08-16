import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, IconButton, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

import { SegmentedControl } from '@/components';

function LabeledInput({
  label,
  value,
  placeholder,
  leftIcon,
}: {
  // esta etiqueta identifica el campo.
  label: string;
  // este valor rellena el input.
  value: string;
  // este texto aparece como ayuda.
  placeholder?: string;
  // este icono acompana el campo cuando aplica.
  leftIcon?: string;
}) {
  const theme = useTheme();

  // este bloque encapsula etiqueta e input para evitar repeticion.
  return (
    <View style={styles.field}>
      <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <TextInput
        mode="outlined"
        value={value}
        placeholder={placeholder}
        outlineColor={theme.colors.outlineVariant}
        activeOutlineColor={theme.colors.primaryContainer}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
      />
    </View>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  // este titulo nombra la seccion visible.
  title: string;
  // este icono identifica la seccion.
  icon: string;
  // este contenido define el cuerpo de la tarjeta.
  children: ReactNode;
}) {
  const theme = useTheme();

  // esta tarjeta se usa para agrupar bloques de formulario.
  return (
    <Surface
      style={[
        styles.sectionCard,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}
      elevation={0}>
      <View style={styles.sectionHeader}>
        <IconButton icon={icon} size={22} iconColor={theme.colors.primaryContainer} style={styles.sectionIcon} />
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
      {children}
    </Surface>
  );
}

export function PersonalDataView() {
  const router = useRouter();
  const theme = useTheme();

  // esta pantalla concentra el perfil, la seguridad y el contexto de ubicacion.
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.topBar, { backgroundColor: theme.colors.background }]} elevation={0}>
        <TouchableRipple borderless onPress={() => router.back()} style={styles.backButton}>
          <Avatar.Icon
            size={36}
            icon="arrow-left"
            color={theme.colors.onSurface}
            style={{ backgroundColor: 'transparent' }}
          />
        </TouchableRipple>

        <View style={styles.topBarSpacer} />
      </Surface>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
            Datos personales
          </Text>
          <Text variant="bodyLarge" style={[styles.pageSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Administra tu información de perfil y la seguridad de la cuenta.
          </Text>
        </View>

        <SegmentedControl
          value="personal-data"
          onValueChange={value => {
            if (value === 'my-posts') {
              router.push('./my-posts');
            }
          }}
          options={[
            { value: 'my-posts', label: 'Mis publicaciones' },
            { value: 'personal-data', label: 'Datos personales' },
          ]}
        />

        <SectionCard title="Información de perfil" icon="account-circle-outline">
          <View style={styles.avatarRow}>
            <View style={[styles.avatarWrap, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>
              <Avatar.Icon size={64} icon="account" color={theme.colors.primaryContainer} style={{ backgroundColor: 'transparent' }} />
            </View>
            <View style={styles.avatarActions}>
              <Button mode="outlined" onPress={() => undefined} style={styles.secondaryButton}>
                Cambiar foto
              </Button>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                jpg, gif o png. tamaño máximo 800 KB
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <LabeledInput label="Nombre completo" value="Elena Rodriguez" />
            <LabeledInput label="Correo electrónico" value="elena.r@example.com" />
            <LabeledInput label="Teléfono" value="+54 11 1234 5678" />
            <LabeledInput label="Ubicación (ciudad / barrio)" value="Palermo, Buenos Aires" leftIcon="map-marker-outline" />
          </View>

          <View style={styles.actionRow}>
            <Button
              mode="contained"
              buttonColor={theme.colors.primaryContainer}
              textColor={theme.colors.onPrimary}
              contentStyle={styles.primaryButtonContent}
              style={styles.primaryButton}
              onPress={() => undefined}>
              Actualizar perfil
            </Button>
          </View>
        </SectionCard>

        <SectionCard title="Seguridad" icon="lock-outline">
          <View style={styles.grid}>
            <LabeledInput label="Contraseña actual" value="••••••••" />
            <LabeledInput label="Nueva contraseña" value="" placeholder="Ingresa la nueva contraseña" />
          </View>

          <Button mode="outlined" onPress={() => undefined} style={styles.secondaryWideButton}>
            Cambiar contraseña
          </Button>
        </SectionCard>

        <Surface
          style={[
            styles.mapCard,
            {
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surface,
            },
          ]}
          elevation={0}>
          <View style={styles.mapCanvas}>
            <View style={[styles.mapLine, styles.mapLineHorizontal]} />
            <View style={[styles.mapLine, styles.mapLineDiagonalA]} />
            <View style={[styles.mapLine, styles.mapLineDiagonalB]} />
            <View style={[styles.mapDot, styles.mapDotMain, { backgroundColor: theme.colors.primaryContainer }]} />
            <View style={[styles.mapDot, styles.mapDotSecondary, { backgroundColor: theme.colors.outlineVariant }]} />

            <Surface style={styles.mapCardLabel} elevation={1}>
              <View style={[styles.mapLabelIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <IconButton icon="home-outline" size={20} iconColor={theme.colors.onPrimary} />
              </View>
              <View>
                <Text variant="titleSmall" style={[styles.mapLabelTitle, { color: theme.colors.onSurface }]}>
                  Zona principal
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Comunidad Palermo
                </Text>
              </View>
            </Surface>
          </View>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // esta raiz organiza la pantalla completa sin scroll horizontal.
  root: {
    flex: 1,
  },
  // esta barra superior deja un back limpio y minimalista.
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  // este boton conserva un area tactil clara.
  backButton: {
    borderRadius: 999,
  },
  // este spacer mantiene el back visualmente alineado.
  topBarSpacer: {
    width: 40,
    height: 40,
  },
  // este contenedor deja respirar cada bloque vertical.
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  // este bloque introduce la pantalla con jerarquia clara.
  hero: {
    gap: 6,
  },
  // este titulo concentra la seccion.
  pageTitle: {
    fontWeight: '800',
  },
  // este subtitulo explica la proposito de la pantalla.
  pageSubtitle: {
    lineHeight: 24,
  },
  // esta tarjeta reutilizable agrupa secciones del formulario.
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  // este header de seccion alinea icono y titulo.
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // este icono le da presencia a cada seccion.
  sectionIcon: {
    margin: 0,
  },
  // este titulo sostiene la jerarquia interna.
  sectionTitle: {
    fontWeight: '800',
  },
  // este bloque alinea avatar y acciones de foto.
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  // este circulo simula la foto de perfil.
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este bloque acomoda el boton y el texto auxiliar.
  avatarActions: {
    flex: 1,
    gap: 8,
  },
  // este boton secundario conserva un borde sutil.
  secondaryButton: {
    alignSelf: 'flex-start',
  },
  // esta grilla se colapsa en una sola columna en mobile.
  grid: {
    gap: 12,
  },
  // este bloque separa cada par etiqueta-campo.
  field: {
    gap: 6,
  },
  // esta etiqueta refuerza la jerarquia del formulario.
  fieldLabel: {
    fontWeight: '700',
  },
  // este grupo ayuda a separar la accion principal.
  actionRow: {
    alignItems: 'flex-end',
  },
  // este boton principal marca el guardado del perfil.
  primaryButtonContent: {
    minHeight: 48,
  },
  // este radio sigue la familia visual de la app.
  primaryButton: {
    borderRadius: 10,
  },
  // este boton ancho cubre una accion secundaria clara.
  secondaryWideButton: {
    borderRadius: 10,
  },
  // este panel imita un mapa sin depender de assets externos.
  mapCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 220,
  },
  // este canvas genera textura visual abstracta.
  mapCanvas: {
    flex: 1,
    backgroundColor: '#EEF2EC',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
  },
  // esta linea general sugiere calles sin ruido.
  mapLine: {
    position: 'absolute',
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
  },
  // esta barra horizontal actua como calle principal.
  mapLineHorizontal: {
    width: '130%',
    height: 2,
    top: '38%',
    left: '-15%',
  },
  // esta diagonal aporta variacion visual.
  mapLineDiagonalA: {
    width: '120%',
    height: 2,
    top: '56%',
    left: '-10%',
    transform: [{ rotate: '-24deg' }],
  },
  // esta segunda diagonal completa el patron.
  mapLineDiagonalB: {
    width: '120%',
    height: 2,
    top: '70%',
    left: '-10%',
    transform: [{ rotate: '18deg' }],
  },
  // este punto marca la ubicacion principal.
  mapDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // este punto resalta el centro de la ubicacion.
  mapDotMain: {
    top: '42%',
    left: '48%',
  },
  // este segundo punto agrega profundidad.
  mapDotSecondary: {
    top: '30%',
    left: '58%',
  },
  // esta tarjeta flota sobre el mapa como leyenda.
  mapCardLabel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  // este icono redondo acompana la leyenda.
  mapLabelIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // este titulo de la leyenda se mantiene compacto.
  mapLabelTitle: {
    fontWeight: '700',
  },
});
