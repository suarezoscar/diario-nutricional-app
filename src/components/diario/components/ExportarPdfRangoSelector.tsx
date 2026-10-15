import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { formatearFechaCorta } from '../../../utils/fechas'
import { styles } from '../ExportarPdfModal.styles'

export interface ExportarPdfRangoSelectorProps {
  desde: string
  hasta: string
  dias: number
  onAplicarRapido: (diasAtras: number) => void
  onAplicarMes: () => void
  onAbrirCalendario: () => void
}

/**
 * Selector de rango y accesos directos para la exportación de documentos PDF.
 *
 * @param props - Fechas del rango, total de días y manejadores de evento.
 * @returns Bloque interactivo con píldoras de presets y caja de selección de fechas.
 */
export const ExportarPdfRangoSelector: React.FC<ExportarPdfRangoSelectorProps> = React.memo(({
  desde,
  hasta,
  dias,
  onAplicarRapido,
  onAplicarMes,
  onAbrirCalendario,
}) => {
  const { colors } = useTheme()

  return (
    <>
      <Text style={[styles.labelRango, { color: colors.text }]}>Atajos rápidos:</Text>
      <View style={styles.pillsRow}>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarRapido(7)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>7 días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarRapido(14)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>14 días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={() => onAplicarRapido(30)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>30 días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primarySoft }]}
          onPress={onAplicarMes}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>Este mes</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.labelRango, { color: colors.text }]}>Rango de fechas a incluir:</Text>
      <TouchableOpacity
        style={[styles.dateSelectorBox, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={onAbrirCalendario}
        activeOpacity={0.75}
        accessibilityLabel="Abrir calendario para seleccionar rango de fechas"
      >
        <View style={styles.dateSelectorLeft}>
          <View style={[styles.calendarIconCircle, { backgroundColor: colors.primarySoft }]}>
            <FontAwesome name="calendar" size={18} color={colors.primary} />
          </View>
          <View style={styles.dateSelectorTexts}>
            <Text style={[styles.dateSelectorRange, { color: colors.text }]}>
              {formatearFechaCorta(desde)} ➔ {formatearFechaCorta(hasta)}
            </Text>
            <Text style={[styles.dateSelectorHint, { color: colors.textMuted }]}>Toca para cambiar en el calendario</Text>
          </View>
        </View>
        <View style={[styles.dateSelectorBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.dateSelectorBadgeText, { color: colors.primary }]}>{dias} días</Text>
        </View>
      </TouchableOpacity>
    </>
  )
})
