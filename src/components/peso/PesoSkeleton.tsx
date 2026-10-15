import React from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import { usePulseAnim } from '../../hooks/usePulseAnim'

/**
 * Skeleton para la tarjeta de métricas clave de peso (Último, Variación, Mín/Máx).
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
            <View
              style={[
                styles.statLabelPlaceholder,
                { backgroundColor: colors.border },
              ]}
            />
            <View
              style={[
                styles.statValPlaceholder,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
        ))}
      </View>
    </Animated.View>
  )
})

/**
 * Skeleton para la gráfica de evolución en PesoView.
 * Replica los 170px de altura y simula la rejilla y puntos de WeightChart.
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
      {/* Líneas de rejilla simuladas */}
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />
      <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />

      {/* Silueta de gráfica simulada con puntos y áreas */}
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
 */
export const PesoHistorialSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <Animated.View style={{ opacity: pulseAnim }}>
      {[1, 2, 3].map(item => (
        <View
          key={item}
          style={[styles.historyRow, { borderBottomColor: colors.border }]}
        >
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
          <View
            style={[styles.deleteBtnPlaceholder, { backgroundColor: colors.border }]}
          />
        </View>
      ))}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  statsCardSkeleton: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statLabelPlaceholder: {
    width: 65,
    height: 10,
    borderRadius: 3,
  },
  statValPlaceholder: {
    width: 50,
    height: 18,
    borderRadius: 4,
  },
  chartContainer: {
    height: 170,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    height: 1,
  },
  chartContent: {
    position: 'absolute',
    bottom: 0,
    left: theme.spacing.md,
    right: theme.spacing.md,
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartCol: {
    alignItems: 'center',
    gap: 4,
  },
  chartPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  chartBar: {
    width: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
    gap: 6,
  },
  historyDatePlaceholder: {
    height: 13,
    borderRadius: 4,
  },
  historyWeightPlaceholder: {
    height: 16,
    width: 60,
    borderRadius: 4,
  },
  deleteBtnPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: theme.spacing.sm,
  },
})
