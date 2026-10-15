import React from 'react'
import { View, Text } from 'react-native'
import { Card } from '../../common/Card'
import { PesoStatsSkeleton } from '../PesoSkeleton'
import { useTheme } from '../../../context/ThemeContext'
import type { EstadisticasPeso } from '../../../hooks/usePesoHistorial'
import { styles } from '../PesoView.styles'

export interface PesoStatsCardProps {
  estadisticas: EstadisticasPeso | null
  cargando: boolean
}

/**
 * Tarjeta de estadísticas consolidadas del peso corporal.
 * Presenta el último peso registrado, la variación neta y los valores extremos (mínimo y máximo).
 *
 * @param props - Estadísticas calculadas y estado de carga.
 * @returns Componente con métricas visuales o skeleton animado.
 */
export const PesoStatsCard: React.FC<PesoStatsCardProps> = React.memo(({
  estadisticas,
  cargando,
}) => {
  const { colors } = useTheme()

  if (cargando && !estadisticas) {
    return <PesoStatsSkeleton />
  }

  if (!estadisticas) {
    return null
  }

  const colorVariacion =
    estadisticas.diferencia < 0
      ? colors.primary
      : estadisticas.diferencia > 0
      ? colors.error
      : colors.text

  return (
    <Card
      style={[
        styles.statsCard,
        { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
      ]}
    >
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.primary }]}>ÚLTIMO PESO</Text>
          <Text style={[styles.statVal, { color: colors.text }]}>{estadisticas.ultimoPeso} kg</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.primary }]}>VARIACIÓN</Text>
          <Text style={[styles.statVal, { color: colorVariacion }]}>
            {estadisticas.diferencia > 0 ? `+${estadisticas.diferencia}` : estadisticas.diferencia} kg
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.primary }]}>MÍN / MÁX</Text>
          <Text style={[styles.statValSmall, { color: colors.textMuted }]}>
            {estadisticas.min} / {estadisticas.max}
          </Text>
        </View>
      </View>
    </Card>
  )
})
