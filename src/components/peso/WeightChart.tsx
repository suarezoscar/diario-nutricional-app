import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Polyline,
  Line,
  Circle,
  Text as SvgText,
} from 'react-native-svg'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import type { PuntoPeso } from '../../types'

interface WeightChartProps {
  data: PuntoPeso[]
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const { colors } = useTheme()

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Sin datos suficientes para la gráfica.
        </Text>
      </View>
    )
  }

  const W = 340
  const H = 170
  const PAD_L = 38
  const PAD_R = 14
  const PAD_T = 16
  const PAD_B = 26
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const values = data.map(d => d.peso)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1
  const yMin = minV - range * 0.2
  const yMax = maxV + range * 0.2
  const ySpan = yMax - yMin

  const scaleX = (i: number) =>
    PAD_L + (i / Math.max(data.length - 1, 1)) * plotW
  const scaleY = (v: number) =>
    PAD_T + (1 - (v - yMin) / ySpan) * plotH

  // Rejilla de 4 líneas
  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const v = yMin + (ySpan / 3) * i
    return { y: scaleY(v), label: v.toFixed(1) }
  })

  // Coordenadas
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`).join(' ')
  const fillPoints = [
    `${PAD_L},${scaleY(yMin)}`,
    ...data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`),
    `${scaleX(data.length - 1)},${scaleY(yMin)}`,
  ].join(' ')

  // Etiquetas X
  const step = Math.max(1, Math.ceil(data.length / 5))
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <Defs>
          <LinearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Líneas horizontales de rejilla */}
        {gridLines.map(g => (
          <React.Fragment key={g.label}>
            <Line
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke={colors.border}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <SvgText
              x={PAD_L - 6}
              y={g.y + 3}
              fontSize="10"
              fill={colors.textMuted}
              textAnchor="end"
            >
              {g.label}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Área sombreada y línea */}
        <Polygon points={fillPoints} fill="url(#pesoGrad)" />
        <Polyline
          points={points}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos de datos */}
        {data.map((d, i) => (
          <Circle
            key={d.fecha}
            cx={scaleX(i)}
            cy={scaleY(d.peso)}
            r="3.5"
            fill={colors.card}
            stroke={colors.primary}
            strokeWidth="2"
          />
        ))}

        {/* Etiquetas fecha eje X */}
        {xLabels.map(d => {
          const idx = data.indexOf(d)
          const partes = d.fecha.split('-')
          const fechaCorta = `${partes[2]}/${partes[1]}`
          return (
            <SvgText
              key={d.fecha}
              x={scaleX(idx)}
              y={H - 4}
              fontSize="10"
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {fechaCorta}
            </SvgText>
          )
        })}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
})
