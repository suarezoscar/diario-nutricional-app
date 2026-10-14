import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import { formatearFechaLarga, hoy } from '../../utils/fechas'
import type { EstadoGuardado } from '../../hooks/useDiario'

interface DateBarProps {
  fecha: string
  cargando?: boolean
  estadoGuardado?: EstadoGuardado
  onCambiarDia: (delta: number) => void
  onIrAHoy: () => void
  onAbrirCalendario?: () => void
}

export const DateBar: React.FC<DateBarProps> = ({
  fecha,
  estadoGuardado,
  onCambiarDia,
  onIrAHoy,
  onAbrirCalendario,
}) => {
  const { colors } = useTheme()
  const esHoy = fecha === hoy()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.background }]}
        onPress={() => onCambiarDia(-1)}
        activeOpacity={0.6}
        accessibilityLabel="Día anterior"
      >
        <FontAwesome name="chevron-left" size={16} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.centerSection}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={onAbrirCalendario}
          disabled={!onAbrirCalendario}
          activeOpacity={0.7}
          accessibilityLabel="Abrir calendario para cambiar fecha"
        >
          <View style={styles.dateRow}>
            <FontAwesome
              name="calendar-o"
              size={14}
              color={colors.primary}
              style={styles.calendarIcon}
            />
            <Text style={[styles.dateText, { color: colors.text }]}>{formatearFechaLarga(fecha)}</Text>
            <FontAwesome
              name="caret-down"
              size={12}
              color={colors.textMuted}
              style={styles.caretIcon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.subRow}>
          {!esHoy && (
            <TouchableOpacity
              style={[styles.todayBadge, { backgroundColor: colors.primarySoft }]}
              onPress={onIrAHoy}
              activeOpacity={0.7}
            >
              <Text style={[styles.todayBadgeText, { color: colors.primary }]}>Ir a Hoy</Text>
            </TouchableOpacity>
          )}

          {estadoGuardado === 'guardando' && (
            <View style={styles.saveBadge}>
              <ActivityIndicator size="small" color={colors.primary} style={styles.miniSpinner} />
              <Text style={[styles.saveBadgeText, { color: colors.textMuted }]}>Guardando...</Text>
            </View>
          )}

          {estadoGuardado === 'guardado' && (
            <View style={styles.saveBadgeSuccess}>
              <FontAwesome name="check" size={10} color={colors.primary} style={styles.checkIcon} />
              <Text style={[styles.saveBadgeSuccessText, { color: colors.primary }]}>Guardado</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.background }]}
        onPress={() => onCambiarDia(1)}
        activeOpacity={0.6}
        accessibilityLabel="Día siguiente"
      >
        <FontAwesome name="chevron-right" size={16} color={colors.text} />
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
    borderBottomWidth: 1,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  centerSection: {
    alignItems: 'center',
  },
  dateButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIcon: {
    marginRight: 2,
  },
  caretIcon: {
    marginLeft: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 22,
    marginTop: 4,
  },
  todayBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  saveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniSpinner: {
    transform: [{ scale: 0.7 }],
  },
  saveBadgeText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  saveBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checkIcon: {
    marginRight: 1,
  },
  saveBadgeSuccessText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
