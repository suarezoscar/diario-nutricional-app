import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { theme } from '../../utils/theme'

interface EjercicioCardProps {
  ejercicio: string
  onCambiarEjercicio: (valor: string) => void
  onFocusInput?: () => void
}

/**
 * Tarjeta para el registro de ejercicio y actividad física del día en el Diario.
 */
export const EjercicioCard: React.FC<EjercicioCardProps> = ({
  ejercicio,
  onCambiarEjercicio,
  onFocusInput,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
    onFocusInput?.()
  }

  return (
    <Card>
      <View style={styles.header}>
        <FontAwesome name="heartbeat" size={16} color={theme.colors.primary} style={styles.icon} />
        <Text style={styles.title}>Ejercicio y actividad física</Text>
      </View>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder="Ej: 45 min paseo a buen ritmo, 30 min natación..."
        placeholderTextColor={theme.colors.textMuted}
        value={ejercicio}
        onChangeText={onCambiarEjercicio}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        multiline
      />
    </Card>
  )
}

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
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: theme.colors.focusSoft,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
})
