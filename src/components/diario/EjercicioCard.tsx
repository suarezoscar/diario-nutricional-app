import React, { useState, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'

interface EjercicioCardProps {
  ejercicio: string
  onCambiarEjercicio: (valor: string) => void
  onFocusInput?: () => void
}

/**
 * Tarjeta para el registro de ejercicio y actividad física del día en el Diario.
 */
export const EjercicioCard: React.FC<EjercicioCardProps> = React.memo(({
  ejercicio,
  onCambiarEjercicio,
  onFocusInput,
}) => {
  const { colors } = useTheme()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocusInput?.()
  }, [onFocusInput])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  return (
    <Card>
      <View style={styles.header}>
        <FontAwesome name="heartbeat" size={16} color={colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>Ejercicio y actividad física</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
          isFocused && {
            borderColor: colors.borderFocus,
            backgroundColor: colors.focusSoft,
          },
        ]}
        placeholder="Ej: 45 min paseo a buen ritmo, 30 min natación..."
        placeholderTextColor={colors.textMuted}
        value={ejercicio}
        onChangeText={onCambiarEjercicio}
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline
      />
    </Card>
  )
})

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    minHeight: 48,
  },
})
