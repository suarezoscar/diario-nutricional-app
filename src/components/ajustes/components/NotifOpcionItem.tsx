import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { styles } from '../AjustesView.styles'

export interface NotifOpcionItemProps {
  titulo: string
  descripcion: string
  activo: boolean
  onToggle: () => void
  accessibilityLabel: string
}

/**
 * Elemento de interruptor (switch) táctil para una opción de notificación.
 *
 * @param props - Título, descripción, estado activo y manejador de alternancia.
 * @returns Fila interactiva accesible con botón de estado.
 */
export const NotifOpcionItem: React.FC<NotifOpcionItemProps> = React.memo(({
  titulo,
  descripcion,
  activo,
  onToggle,
  accessibilityLabel,
}) => {
  const { colors } = useTheme()

  return (
    <View style={[styles.notifOptionItem, { borderBottomColor: colors.border }]}>
      <View style={styles.notifOptionInfo}>
        <Text style={[styles.notifOptionTitle, { color: colors.text }]}>{titulo}</Text>
        <Text style={[styles.notifOptionDesc, { color: colors.textMuted }]}>{descripcion}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.notifSwitchBtn,
          { borderColor: colors.border, backgroundColor: colors.background },
          activo && {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <FontAwesome
          name={activo ? 'check-circle' : 'circle-o'}
          size={14}
          color={activo ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            styles.notifSwitchText,
            { color: colors.textMuted },
            activo && { color: colors.primary, fontWeight: '700' },
          ]}
        >
          {activo ? 'Activo' : 'Inactivo'}
        </Text>
      </TouchableOpacity>
    </View>
  )
})
