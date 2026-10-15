import React from 'react'
import { View, Text } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import { formatearFechaCorta } from '../../../utils/fechas'
import type { MetricasHistorico } from '../../../hooks/useHistorico'
import { styles } from '../HistoricoView.styles'

export interface HistoricoMetricasCardProps {
  desde: string
  hasta: string
  totalDias: number
  metricas: MetricasHistorico
}

/**
 * Banner de rango de fechas y tarjeta de métricas globales del período consultado.
 *
 * @param props - Fechas del intervalo, número total de días y métricas calculadas.
 * @returns Componentes visuales con información estadística del período.
 */
export const HistoricoMetricasCard: React.FC<HistoricoMetricasCardProps> = React.memo(({
  desde,
  hasta,
  totalDias,
  metricas,
}) => {
  const { colors } = useTheme()

  return (
    <>
      <View style={[styles.rangoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FontAwesome name="calendar-check-o" size={13} color={colors.primary} />
        <Text style={[styles.rangoBannerText, { color: colors.text }]}>
          {formatearFechaCorta(desde)} ➔ {formatearFechaCorta(hasta)}
        </Text>
        <View style={[styles.rangoDiasBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.rangoDiasBadgeText, { color: colors.primary }]}>{totalDias} días</Text>
        </View>
      </View>

      <Card style={styles.metricsCard}>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {metricas.diasConDatos}/{metricas.totalDias}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DÍAS REGISTRADOS</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.primary }]}>{metricas.mediaAgua} L</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MEDIA AGUA/DÍA</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.primary }]}>{metricas.comidasFuera}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>COMIDAS FUERA</Text>
          </View>
        </View>
      </Card>
    </>
  )
})
