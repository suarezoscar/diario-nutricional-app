import React from 'react'
import { View, Text } from 'react-native'
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
import type { PuntoPeso } from '../../types'
import { styles } from './WeightChart.styles'
import {
  useWeightChartGeometry,
  CHART_W,
  CHART_H,
  PAD_L,
  PAD_R,
} from './hooks/useWeightChartGeometry'

export interface WeightChartProps {
  data: PuntoPeso[]
}

/**
 * Gráfica vectorial SVG de evolución temporal del peso corporal.
 * Presenta curvas fluidas, gradientes de relleno y rejillas de referencia métrica.
 *
 * @param props - Historial cronológico de registros de peso.
 * @returns Componente SVG escalable con la gráfica de evolución o mensaje de estado vacío.
 */
export const WeightChart: React.FC<WeightChartProps> = React.memo(({ data }) => {
  const { colors } = useTheme()
  const geometry = useWeightChartGeometry(data)

  if (!geometry) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Sin datos suficientes para la gráfica.
        </Text>
      </View>
    )
  }

  const { gridLines, points, fillPoints, circles, xLabels } = geometry

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} width="100%" height={CHART_H}>
        <Defs>
          <LinearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {gridLines.map(g => (
          <React.Fragment key={g.label}>
            <Line
              x1={PAD_L}
              y1={g.y}
              x2={CHART_W - PAD_R}
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

        <Polygon points={fillPoints} fill="url(#pesoGrad)" />
        <Polyline
          points={points}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {circles.map(c => (
          <Circle
            key={c.fecha}
            cx={c.cx}
            cy={c.cy}
            r="3.5"
            fill={colors.card}
            stroke={colors.primary}
            strokeWidth="2"
          />
        ))}

        {xLabels.map(l => (
          <SvgText
            key={l.fecha}
            x={l.x}
            y={CHART_H - 4}
            fontSize="10"
            fill={colors.textMuted}
            textAnchor="middle"
          >
            {l.fechaCorta}
          </SvgText>
        ))}
      </Svg>
    </View>
  )
})
