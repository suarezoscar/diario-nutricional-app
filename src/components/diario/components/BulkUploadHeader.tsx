import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../BulkUploadModal.styles'

export interface BulkUploadHeaderProps {
  topPadding: number
  onClose: () => void
}

/**
 * Encabezado superior para el modal de subida masiva.
 *
 * @param props - Espaciado superior dinámico por safe area y manejador de cierre.
 * @returns Encabezado con título e icono de cámara retro y botón de descarte.
 */
export const BulkUploadHeader: React.FC<BulkUploadHeaderProps> = React.memo(({
  topPadding,
  onClose,
}) => {
  const { colors } = useTheme()

  return (
    <View style={[styles.header, { paddingTop: topPadding + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerTitleWrap}>
        <FontAwesome name="camera-retro" size={18} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Subida múltiple (IA)</Text>
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeBtn}
        activeOpacity={0.7}
        accessibilityLabel="Cerrar subida múltiple"
      >
        <FontAwesome name="times" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  )
})
