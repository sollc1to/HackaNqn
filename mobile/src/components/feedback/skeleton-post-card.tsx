import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function SkeletonPostCard() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.72);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.78, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.42, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reducedMotion]);

  const blockStyle = { backgroundColor: theme.colors.surfaceVariant };
  return (
    <Surface
      elevation={0}
      accessibilityLabel="Cargando publicación"
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <Animated.View style={[styles.image, blockStyle, { opacity }]} />
      <View style={styles.body}>
        <Animated.View style={[styles.badge, blockStyle, { opacity }]} />
        <Animated.View style={[styles.title, blockStyle, { opacity }]} />
        <Animated.View style={[styles.line, blockStyle, { opacity }]} />
        <Animated.View style={[styles.shortLine, blockStyle, { opacity }]} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 158, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderRadius: 18 },
  image: { width: 108 },
  body: { flex: 1, gap: 12, padding: 14 },
  badge: { width: 76, height: 22, borderRadius: 999 },
  title: { width: '92%', height: 21, borderRadius: 6 },
  line: { width: '82%', height: 13, borderRadius: 5 },
  shortLine: { width: '58%', height: 13, borderRadius: 5 },
});
