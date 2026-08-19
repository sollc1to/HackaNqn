import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider, Surface, Text, useTheme } from 'react-native-paper';

import { AppHeader, AppScreen } from '@/components';

const safetySections = [
  {
    icon: 'account-check-outline',
    title: 'Identidad y verificación',
    body: 'La insignia de verificación identifica cuentas cuya información fue revisada por la plataforma. La verificación ayuda a generar confianza, pero cada persona debe mantener sus datos actualizados y actuar de buena fe en cada intercambio.',
  },
  {
    icon: 'shield-search-outline',
    title: 'Moderación y reportes',
    body: 'Las publicaciones, perfiles y conversaciones pueden ser reportados cuando incumplen las normas. El equipo de moderación puede revisar el contenido, solicitar información adicional, limitar funciones, retirar publicaciones o suspender cuentas según la gravedad y reiteración de la conducta.',
  },
  {
    icon: 'map-marker-alert-outline',
    title: 'Encuentros presenciales',
    body: 'Coordiná las entregas en lugares seguros y, cuando sea posible, públicos y concurridos. No publiques tu domicilio exacto. Compartí datos precisos de encuentro únicamente por mensaje y solo cuando sean necesarios para concretar la entrega.',
  },
  {
    icon: 'cash-remove',
    title: 'Donaciones sin pagos',
    body: 'Las donaciones publicadas en la plataforma deben entregarse de manera gratuita. No transfieras dinero para reservar o recibir una donación. Reportá cualquier solicitud de pago, intento de estafa, reventa engañosa o condición económica no informada.',
  },
  {
    icon: 'cancel',
    title: 'Productos prohibidos o inseguros',
    body: 'No se permiten medicamentos abiertos o de entrega restringida, alimentos vencidos, sangre, armas, municiones, explosivos, sustancias peligrosas ni objetos cuya entrega sea ilegal o pueda poner en riesgo a otra persona.',
  },
  {
    icon: 'package-variant-closed-check',
    title: 'Estado de los objetos',
    body: 'Los objetos ofrecidos deben estar en buen estado, ser seguros y aptos para el uso indicado. Si son usados, la publicación debe informar con claridad marcas, desgaste, reparaciones, piezas faltantes o cualquier detalle relevante. Las fotografías deben ser actuales y representar el estado real del objeto.',
  },
  {
    icon: 'account-cancel-outline',
    title: 'Convivencia y comportamiento',
    body: 'No se toleran amenazas, discriminación, acoso, suplantación de identidad, contenido engañoso ni presión para obtener datos personales. Podés bloquear contactos y reportar comportamientos que vulneren estas reglas.',
  },
];

const policySections = [
  {
    title: 'Términos de uso',
    body: 'Cada persona es responsable de publicar información verdadera, mantener actualizado el estado de sus publicaciones y utilizar la plataforma de forma respetuosa. La plataforma puede moderar, pausar o retirar contenido y restringir cuentas que incumplan estas condiciones.',
  },
  {
    title: 'Privacidad',
    body: 'La plataforma utiliza ubicaciones aproximadas para facilitar encuentros sin exponer domicilios exactos. Los datos personales obtenidos durante un intercambio deben utilizarse exclusivamente para coordinarlo y no pueden publicarse, compartirse ni reutilizarse sin autorización.',
  },
  {
    title: 'Política de donaciones',
    body: 'Toda donación debe ser gratuita, segura, legal y coincidir con la descripción y fotografías publicadas. No se permite condicionar la entrega a pagos, favores, publicidad engañosa, reventa acordada previamente ni contraprestaciones ocultas.',
  },
  {
    title: 'Contenido y estado de los artículos',
    body: 'Los artículos deben encontrarse en condiciones adecuadas de uso. El estado declarado, las fotografías y los detalles informados deben reflejar el objeto real. Ocultar roturas, fallas relevantes o condiciones que puedan afectar la seguridad constituye un incumplimiento de las normas.',
  },
  {
    title: 'Reseñas',
    body: 'Las reseñas deben corresponder a intercambios reales y describir la experiencia de forma respetuosa. No deben incluir datos sensibles, amenazas ni ataques personales. Las reseñas pueden ser reportadas y moderadas cuando incumplen estas reglas.',
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
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
          {policyMode ? 'Reglas claras para la comunidad' : 'Cuidarnos también es parte del intercambio'}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 24 }}>
          {policyMode
            ? 'Estas reglas establecen las condiciones para publicar, donar, solicitar y coordinar intercambios dentro de la plataforma.'
            : 'Usá la plataforma de manera responsable y reportá cualquier publicación o comportamiento que pueda poner en riesgo a otra persona.'}
        </Text>
      </View>

      <Surface elevation={0} style={[styles.notice, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
          Al publicar o coordinar un intercambio aceptás estas normas. Su incumplimiento puede provocar el retiro del contenido o restricciones sobre la cuenta.
        </Text>
      </Surface>

      <View style={styles.list}>
        {sections.map((section, index) => (
          <Surface key={section.title} elevation={0} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.cardHeader}>
              {'icon' in section ? (
                <MaterialCommunityIcons name={section.icon as never} size={23} color={theme.colors.primary} />
              ) : (
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: '800' }}>{index + 1}</Text>
              )}
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '800', flex: 1 }}>{section.title}</Text>
            </View>
            <Divider />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>{section.body}</Text>
          </Surface>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 30 },
  intro: { gap: 7, paddingHorizontal: 16 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 18, marginHorizontal: 16, padding: 16 },
  list: { gap: 12, paddingHorizontal: 16 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 13 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});