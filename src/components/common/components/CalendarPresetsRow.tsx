import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../context/ThemeContext'
import { formatearFechaCorta } from '../../../utils/fechas'
import type { RangoFechas } from '../hooks/useCalendarModal'
import { styles } from '../CalendarModal.styles'

export interface CalendarPresetsRowProps {
  rangoInterno: RangoFechas
  diasEnRango: number
  onAplicarPreset: (diasAtras: number) => void
  onAplicarPresetMes: () => void
}

/**
 * Fila de atajos rápidos y resumen del rango para CalendarModal.
 *
 * @param props - Rango seleccionado, días totales y manejadores de presets.
 * @returns Selector de accesos directos y cápsula con el resumen del intervalo.
 */
export const CalendarPresetsRow: React.FC<CalendarPresetsRowProps> = React.memo(({
  rangoInterno,
  diasEnRango,
  onAplicarPreset,
  onAplicarPresetMes,
}) => {
  const { colors } = useTheme()

  return (
    <>
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarPreset(7)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>7d</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarPreset(14)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>14d</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarPreset(30)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>30d</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={onAplicarPresetMes}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>Este mes</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.rangeSummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.rangeText, { color: colors.text }]}>
          {rangoInterno.desde ? formatearFechaCorta(rangoInterno.desde) : '—'} ➔{' '}
          {rangoInterno.hasta ? formatearFechaCorta(rangoInterno.hasta) : 'Selecciona fin'}
        </Text>
        {!!rangoInterno.hasta && (
          <View style={[styles.rangeBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.rangeBadgeText, { color: colors.primary }]}>{diasEnRango} días</Text>
          </View>
        )}
      </View>
    </>
  )
})
