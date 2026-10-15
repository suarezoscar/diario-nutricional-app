import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { PesoHistorialSkeleton } from '../PesoSkeleton'
import { useTheme } from '../../../context/ThemeContext'
import { formatearFechaLarga } from '../../../utils/fechas'
import type { PuntoPeso } from '../../../types'
import { styles } from '../PesoView.styles'

const HIT_SLOP_8 = Object.freeze({ top: 8, bottom: 8, left: 8, right: 8 })

export interface PesoHistorialListProps {
  chartData: PuntoPeso[]
  cargando: boolean
  onSeleccionarDia?: (fecha: string) => void
  onConfirmarBorrado: (fecha: string, valor: number) => void
}

/**
 * Lista cronológica inversa con el historial de pesos corporales registrados.
 * Permite navegar al día en el diario o eliminar un registro mediante diálogo de confirmación.
 *
 * @param props - Datos de la gráfica, estado de carga y manejadores de acción.
 * @returns Tarjeta con el listado de pesos y botones interactivos.
 */
export const PesoHistorialList: React.FC<PesoHistorialListProps> = React.memo(({
  chartData,
  cargando,
  onSeleccionarDia,
  onConfirmarBorrado,
}) => {
  const { colors } = useTheme()

  return (
    <Card>
      <View style={styles.cardHeader}>
        <FontAwesome name="history" size={16} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Historial ({chartData.length})</Text>
      </View>

      {cargando && chartData.length === 0 ? (
        <PesoHistorialSkeleton />
      ) : chartData.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No hay registros de peso guardados todavía.
        </Text>
      ) : (
        [...chartData].reverse().map(item => (
          <View key={item.fecha} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.historyInfo}
              onPress={() => onSeleccionarDia?.(item.fecha)}
              activeOpacity={onSeleccionarDia ? 0.7 : 1}
              accessibilityLabel={`Ver diario del ${formatearFechaLarga(item.fecha)}`}
            >
              <Text style={[styles.historyDate, { color: colors.text }]}>{formatearFechaLarga(item.fecha)}</Text>
              <Text style={[styles.historyWeight, { color: colors.primary }]}>{item.peso} kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onConfirmarBorrado(item.fecha, item.peso)}
              style={styles.deleteBtn}
              hitSlop={HIT_SLOP_8}
              activeOpacity={0.7}
              accessibilityLabel={`Eliminar registro de peso del ${formatearFechaLarga(item.fecha)}`}
            >
              <FontAwesome name="trash-o" size={15} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </Card>
  )
})
