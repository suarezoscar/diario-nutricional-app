import React from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import { usePulseAnim } from '../../hooks/usePulseAnim'

/**
 * Componente Skeleton para la vista de Histórico.
 * Simula las tarjetas DiaResumenCard durante la carga de rangos de fechas,
 * manteniendo consistencia visual y de animación con el Diario.
 */
export const HistoricoSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  // Simulación de 4 tarjetas de días del rango
  const diasPlaceholder = [1, 2, 3, 4]

  return (
    <View style={styles.container}>
      {diasPlaceholder.map((item, idx) => (
        <Animated.View
          key={item}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pulseAnim,
            },
          ]}
        >
          {/* Cabecera del día: fecha simulada + botón editar simulado */}
          <View style={styles.header}>
            <View
              style={[
                styles.datePlaceholder,
                {
                  backgroundColor: colors.border,
                  width: idx === 0 ? 160 : idx === 1 ? 140 : 170,
                },
              ]}
            />
            <View
              style={[
                styles.editBtnPlaceholder,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            />
          </View>

          {/* Fila simulada de comidas (pills) */}
          <View style={styles.mealsRow}>
            {[1, 2, 3, 4, 5].map(pill => (
              <View
                key={pill}
                style={[
                  styles.mealPillPlaceholder,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
            ))}
          </View>

          {/* Fila inferior simulada con Agua y Ejercicio */}
          <View style={styles.footerRow}>
            <View style={[styles.metricPlaceholder, { backgroundColor: colors.border, width: 48 }]} />
            <View style={[styles.metricPlaceholder, { backgroundColor: colors.border, width: 56 }]} />
            <View style={[styles.metricPlaceholder, { backgroundColor: colors.border, width: 90 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    elevation: 2,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  datePlaceholder: {
    height: 14,
    borderRadius: 4,
  },
  editBtnPlaceholder: {
    width: 50,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  mealPillPlaceholder: {
    flex: 1,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: 2,
  },
  metricPlaceholder: {
    height: 12,
    borderRadius: 4,
  },
})
