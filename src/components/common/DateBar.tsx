import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import { formatearFechaLarga, hoy } from '../../utils/fechas'

interface DateBarProps {
  fecha: string
  cargando?: boolean
  onCambiarDia: (delta: number) => void
  onIrAHoy: () => void
}

export const DateBar: React.FC<DateBarProps> = ({
  fecha,
  cargando,
  onCambiarDia,
  onIrAHoy,
}) => {
  const esHoy = fecha === hoy()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onCambiarDia(-1)}
        activeOpacity={0.6}
        accessibilityLabel="Día anterior"
      >
        <FontAwesome name="chevron-left" size={16} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.centerSection}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatearFechaLarga(fecha)}</Text>
          {cargando && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.spinner}
            />
          )}
        </View>
        {!esHoy && (
          <TouchableOpacity style={styles.todayBadge} onPress={onIrAHoy} activeOpacity={0.7}>
            <Text style={styles.todayBadgeText}>Ir a Hoy</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onCambiarDia(1)}
        activeOpacity={0.6}
        accessibilityLabel="Día siguiente"
      >
        <FontAwesome name="chevron-right" size={16} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  centerSection: {
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spinner: {
    marginLeft: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  todayBadge: {
    marginTop: 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
})
