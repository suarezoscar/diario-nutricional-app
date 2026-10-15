import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../UpdateModal.styles'

export interface UpdateProgressBarProps {
  progreso: number
}

/**
 * Sección de progreso de descarga para el modal de actualización de versión.
 *
 * @param props - Porcentaje actual de descarga completado (0 a 100).
 * @returns Barra de progreso visual con porcentaje numérico y etiqueta contextual.
 */
export const UpdateProgressBar: React.FC<UpdateProgressBarProps> = React.memo(({ progreso }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.text }]}>Descargando actualización...</Text>
        <Text style={[styles.progressPercent, { color: colors.primary }]}>{progreso}%</Text>
      </View>
      <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progreso}%` }]} />
      </View>
      <View style={styles.statusRow}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.textMuted }]}>
          {progreso >= 100 ? 'Iniciando instalador...' : 'Descargando paquete de actualización...'}
        </Text>
      </View>
    </View>
  )
})
