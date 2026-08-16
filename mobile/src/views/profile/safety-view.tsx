import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider, Surface, Text, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen } from '@/components';

const safetySections = [
  {
    icon: 'account-check-outline',
    title: 'Identidad y verificación',
    body: 'Una insignia indica una revisión de identidad y, para organizaciones, documentación básica. En esta demostración el proceso es simulado y las organizaciones ficticias se identifican expresamente; no implica garantía sobre cada intercambio.',
  },
  {
    icon: 'shield-search-outline',
    title: 'Moderación y reportes',
    body: 'Cada reporte exige un motivo, se guarda con fecha y queda en estado “recibido”. Un backend de producción deberá enviarlo a una cola de moderación, preservar evidencia, comunicar la resolución y permitir apelaciones.',
  },
  {
    icon: 'map-marker-alert-outline',
    title: 'Encuentros presenciales',
    body: 'Coordiná en lugares públicos y con luz. Avisale a alguien de confianza. No publiques tu domicilio exacto; compartí el punto final por mensaje solo cuando sea indispensable.',
  },
  {
    icon: 'cash-remove',
    title: 'Estafas y reventa',
    body: 'Nexo Solidario no exige pagos para recibir una donación. No transfieras dinero, no compartas códigos de verificación y reportá solicitudes de pago, reventa o información que no coincida con la publicación.',
  },
  {
    icon: 'cancel',
    title: 'Productos prohibidos o regulados',
    body: 'No se permiten medicamentos abiertos, alimentos vencidos, sangre, armas, municiones, explosivos, sustancias peligrosas ni productos cuya entrega incumpla normas sanitarias o legales.',
  },
  {
    icon: 'account-cancel-outline',
    title: 'Bloqueo y convivencia',
    body: 'Podés bloquear un contacto desde la conversación. No se toleran amenazas, discriminación, acoso, suplantación de identidad ni presión para compartir datos personales.',
  },
];

const policySections = [
  {
    title: 'Términos de uso',
    body: 'Las personas son responsables de describir los artículos con veracidad, mantener el estado actualizado y coordinar de forma respetuosa. La plataforma puede pausar o retirar contenido que incumpla estas reglas.',
  },
  {
    title: 'Privacidad',
    body: 'La interfaz solicita una ubicación aproximada y evita mostrar domicilios exactos. Los datos personales solo deben usarse para coordinar el intercambio. Una versión productiva necesitará consentimiento, plazos de conservación y mecanismos de acceso o eliminación de datos.',
  },
  {
    title: 'Política de donaciones',
    body: 'Las donaciones deben ser gratuitas, seguras, legales y coincidir con su descripción. No se permite condicionar la entrega a pagos, favores, publicidad engañosa o reventa previamente acordada.',
  },
  {
    title: 'Reseñas',
    body: 'Las reseñas deben describir un intercambio real, sin datos sensibles ni ataques personales. Se pueden reportar y moderar. El puntaje no reemplaza las medidas de seguridad.',
  },
];

export function SafetyView() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const policyMode = (Array.isArray(params.section) ? params.section[0] : params.section) === 'policies';
  const sections = policyMode ? policySections : safetySections;

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader title={policyMode ? 'Términos y políticas' : 'Confianza y seguridad'} onBackPress={() => router.back()} />
      <View style={styles.intro}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>{policyMode ? 'Reglas claras para la comunidad' : 'Cuidarnos también es parte del intercambio'}</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 24 }}>{policyMode ? 'Resumen funcional para el MVP. Antes de producción debe revisarlo un equipo legal local.' : 'Estas señales reducen riesgos, pero no reemplazan el criterio personal ni un proceso de moderación real.'}</Text>
      </View>
      <Surface elevation={0} style={[styles.notice, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>Nexo Solidario es una demostración. Las organizaciones y respuestas automáticas se identifican como ficticias o simuladas.</Text>
      </Surface>
      <View style={styles.list}>
        {sections.map((section, index) => (
          <Surface key={section.title} elevation={0} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.cardHeader}>{'icon' in section ? <MaterialCommunityIcons name={section.icon as never} size={23} color={theme.colors.primary} /> : <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: '800' }}>{index + 1}</Text>}<Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800', flex: 1 }}>{section.title}</Text></View>
            <Divider />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>{section.body}</Text>
          </Surface>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ content: { gap: 18, paddingBottom: 30 }, intro: { gap: 7, paddingHorizontal: 16 }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 18, marginHorizontal: 16, padding: 16 }, list: { gap: 12, paddingHorizontal: 16 }, card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 13 }, cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 } });
