import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { theme } from '../../utils/theme'

interface PesoCardProps {
  peso: string
  ejercicio: string
  onCambiarPeso: (valor: string) => void
  onCambiarEjercicio: (valor: string) => void
}

export const PesoCard: React.FC<PesoCardProps> = ({
  peso,
  ejercicio,
  onCambiarPeso,
  onCambiarEjercicio,
}) => {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.half}>
          <View style={styles.header}>
            <FontAwesome name="dashboard" size={14} color={theme.colors.primary} style={styles.icon} />
            <Text style={styles.title}>Peso (kg)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ej: 72.5"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            value={peso}
            onChangeText={onCambiarPeso}
          />
        </View>

        <View style={styles.half}>
          <View style={styles.header}>
            <FontAwesome name="heartbeat" size={14} color={theme.colors.primary} style={styles.icon} />
            <Text style={styles.title}>Ejercicio</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ej: 45 min paseo"
            placeholderTextColor={theme.colors.textMuted}
            value={ejercicio}
            onChangeText={onCambiarEjercicio}
          />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  half: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
})
