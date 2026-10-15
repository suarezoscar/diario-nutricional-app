import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../UpdateModal.styles'

export interface UpdateActionsProps {
  descargando: boolean
  error?: string | null
  onInstalar: () => void
  onAbrirNavegador: () => void
  onCerrar: () => void
}

/**
 * Botones de acción para el modal de actualización de aplicación.
 *
 * @param props - Estados de descarga, error y callbacks de instalación o descarte.
 * @returns Grupo de botones accesibles para proceder con la actualización o posponerla.
 */
export const UpdateActions: React.FC<UpdateActionsProps> = React.memo(({
  descargando,
  error,
  onInstalar,
  onAbrirNavegador,
  onCerrar,
}) => {
  const { colors } = useTheme()

  if (descargando) {
    return (
      <Text style={[styles.autoInstallNotice, { color: colors.textMuted }]}>
        El instalador de Android se abrirá automáticamente en tu pantalla.
      </Text>
    )
  }

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          error ? { backgroundColor: colors.primaryLight } : null,
        ]}
        onPress={onInstalar}
        activeOpacity={0.8}
        accessibilityLabel={error ? 'Reintentar descarga de la actualización' : 'Instalar actualización ahora'}
      >
        <FontAwesome name={error ? 'refresh' : 'download'} size={16} color="#ffffff" />
        <Text style={styles.primaryButtonText}>{error ? 'Reintentar instalación' : 'Instalar ahora'}</Text>
      </TouchableOpacity>

      {error ? (
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={onAbrirNavegador}
          activeOpacity={0.7}
          accessibilityLabel="Descargar archivo APK desde el navegador"
        >
          <FontAwesome name="external-link" size={14} color={colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Descargar desde el navegador
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCerrar}
        activeOpacity={0.7}
        accessibilityLabel="Posponer actualización para más tarde"
      >
        <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Más tarde</Text>
      </TouchableOpacity>
    </View>
  )
})
