import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'

/**
 * Componente Skeleton con animación pulsante para mostrar mientras
 * se cargan los datos del diario de un día, reemplazando spinners invasivos.
 */
export const DiarioSkeleton: React.FC = () => {
  const { colors } = useTheme()
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulseAnim])

  // Simulación de 5 tarjetas de comida
  const comidasPlaceholder = [1, 2, 3, 4, 5]

  return (
    <View style={styles.container}>
      {comidasPlaceholder.map((item) => (
        <Animated.View
          key={item}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
          ]}
        >
          {/* Cabecera de la tarjeta: icono + título y botones */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
              <View style={[styles.titlePlaceholder, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.buttonPlaceholder, { backgroundColor: colors.border }]} />
              <View style={[styles.camButtonPlaceholder, { backgroundColor: colors.primarySoft }]} />
            </View>
          </View>

          {/* Bloque simulador del TextInput */}
          <View style={[styles.inputPlaceholder, { backgroundColor: colors.background }]}>
            <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '80%' }]} />
            <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '45%' }]} />
          </View>
        </Animated.View>
      ))}

      {/* Tarjeta de Agua simulada */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
            <View style={[styles.titlePlaceholder, { backgroundColor: colors.border, width: 90 }]} />
          </View>
        </View>
        <View style={styles.aguaRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((vaso) => (
            <View key={vaso} style={[styles.vasoPlaceholder, { backgroundColor: colors.primarySoft }]} />
          ))}
        </View>
      </Animated.View>

      {/* Tarjeta de Ejercicio simulada */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
            <View style={[styles.titlePlaceholder, { backgroundColor: colors.border, width: 140 }]} />
          </View>
        </View>
        <View style={[styles.inputPlaceholder, { backgroundColor: colors.background }]}>
          <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '65%' }]} />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
  },
  titlePlaceholder: {
    width: 110,
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  buttonPlaceholder: {
    width: 48,
    height: 22,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
  camButtonPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
  },
  inputPlaceholder: {
    minHeight: 64,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    gap: 8,
    justifyContent: 'center',
  },
  linePlaceholder: {
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  aguaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  vasoPlaceholder: {
    width: 26,
    height: 32,
    borderRadius: 6,
    backgroundColor: theme.colors.primarySoft,
  },
})
