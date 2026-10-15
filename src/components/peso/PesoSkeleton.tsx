import React from 'react'
import { View, Animated } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { usePulseAnim } from '../../hooks/usePulseAnim'
import { styles } from './PesoSkeleton.styles'

/**
 * Skeleton para la tarjeta de métricas clave de peso (Último, Variación, Mín/Máx).
 *
 * @returns Bloque con animación pulsante que simula las 3 métricas superiores.
 */
export const PesoStatsSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <Animated.View
      style={[
        styles.statsCardSkeleton,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.primaryLight,
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={styles.statsRow}>
        {[1, 2, 3].map(box => (
          <View key={box} style={styles.statBox}>
            <View style={[styles.statLabelPlaceholder, { backgroundColor: colors.border }]} />
            <View style={[styles.statValPlaceholder, { backgroundColor: colors.border }]} />
          </View>
        ))}
      </View>
    </Animated.View>
  )
})

/**
 * Skeleton para la gráfica de evolución en PesoView.
 * Replica los 170px de altura y simula la rejilla y puntos de WeightChart.
 *
 * @returns Contenedor animado con columnas y rejillas ficticias.
 */
export const WeightChartSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />

      <View style={styles.chartContent}>
        {[30, 65, 45, 80, 60, 95].map((height, idx) => (
          <View key={idx} style={styles.chartCol}>
            <View
              style={[
                styles.chartPoint,
                { backgroundColor: colors.primary, borderColor: colors.card },
              ]}
            />
            <View
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor: colors.primarySoft,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </Animated.View>
  )
})

/**
 * Skeleton para el historial de peso mientras se cargan los registros.
 *
 * @returns Lista simulada de 3 filas con animación de pulso.
 */
export const PesoHistorialSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <Animated.View style={{ opacity: pulseAnim }}>
      {[1, 2, 3].map(item => (
        <View key={item} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
          <View style={styles.historyInfo}>
            <View
              style={[
                styles.historyDatePlaceholder,
                {
                  backgroundColor: colors.border,
                  width: item === 1 ? 160 : item === 2 ? 135 : 175,
                },
              ]}
            />
            <View
              style={[
                styles.historyWeightPlaceholder,
                { backgroundColor: colors.primarySoft },
              ]}
            />
          </View>
          <View style={[styles.deleteBtnPlaceholder, { backgroundColor: colors.border }]} />
        </View>
      ))}
    </Animated.View>
  )
})
