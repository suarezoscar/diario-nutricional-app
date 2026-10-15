import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../HistoricoView.styles'

export interface HistoricoFiltrosRowProps {
  presetActivo: number
  onCambiarPreset: (dias: number) => void
  onAbrirCalendario: () => void
  onAbrirPdf: () => void
}

/**
 * Fila superior de filtros rápidos para el histórico nutricional.
 * Ofrece botones de presets por días (7, 14, 30), filtro por rango libre y acceso directo a exportación PDF.
 *
 * @param props - Preset seleccionado actualmente y manejadores de interacción.
 * @returns Fila horizontal con botones de selección y exportación.
 */
export const HistoricoFiltrosRow: React.FC<HistoricoFiltrosRowProps> = React.memo(({
  presetActivo,
  onCambiarPreset,
  onAbrirCalendario,
  onAbrirPdf,
}) => {
  const { colors } = useTheme()

  return (
    <View style={styles.presetsRow}>
      {[7, 14, 30].map(d => (
        <TouchableOpacity
          key={d}
          style={[
            styles.presetBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            presetActivo === d && { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
          ]}
          onPress={() => onCambiarPreset(d)}
          activeOpacity={0.7}
          accessibilityLabel={`Filtrar últimos ${d} días`}
        >
          <Text
            style={[
              styles.presetBtnText,
              { color: colors.textMuted },
              presetActivo === d && { color: colors.primary, fontWeight: '700' },
            ]}
          >
            {d}d
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.presetBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
          presetActivo === 0 && { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
        ]}
        onPress={onAbrirCalendario}
        activeOpacity={0.7}
        accessibilityLabel="Filtrar por rango de fechas en calendario"
      >
        <View style={styles.customPresetContent}>
          <FontAwesome
            name="calendar"
            size={11}
            color={presetActivo === 0 ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.presetBtnText,
              { color: colors.textMuted },
              presetActivo === 0 && { color: colors.primary, fontWeight: '700' },
            ]}
          >
            Rango
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pdfBtn, { backgroundColor: colors.primary }]}
        onPress={onAbrirPdf}
        activeOpacity={0.7}
        accessibilityLabel="Exportar rango actual a documento PDF"
      >
        <FontAwesome name="file-pdf-o" size={13} color="#ffffff" />
        <Text style={styles.pdfBtnText}>PDF</Text>
      </TouchableOpacity>
    </View>
  )
})
