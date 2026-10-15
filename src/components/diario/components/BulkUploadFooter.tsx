import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../BulkUploadModal.styles'

export interface BulkUploadFooterProps {
  itemsCount: number
  guardando: boolean
  onGuardar: () => void
}

/**
 * Pie de página fijo para confirmar la subida masiva de platos procesados por IA.
 *
 * @param props - Cantidad de platos listos, estado de guardado y manejador de confirmación.
 * @returns Barra inferior con botón de acción destacado.
 */
export const BulkUploadFooter: React.FC<BulkUploadFooterProps> = React.memo(({
  itemsCount,
  guardando,
  onGuardar,
}) => {
  const { colors } = useTheme()

  if (itemsCount === 0) return null

  return (
    <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.guardarBtn, { backgroundColor: colors.primary }, guardando && styles.guardarBtnDisabled]}
        onPress={onGuardar}
        disabled={guardando}
        activeOpacity={0.8}
        accessibilityLabel="Guardar todos los platos analizados en el diario"
      >
        {guardando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.guardarBtnText}>
            Guardar en mi diario ({itemsCount})
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
})
