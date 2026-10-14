import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
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
  cargando,
  estadoGuardado,
  onCambiarDia,
  onIrAHoy,
  onAbrirCalendario,
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
              color={theme.colors.primary}
              style={styles.calendarIcon}
            />
            <Text style={styles.dateText}>{formatearFechaLarga(fecha)}</Text>
            {cargando && (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.spinner}
              />
            )}
            <FontAwesome
              name="caret-down"
              size={12}
              color={theme.colors.textMuted}
              style={styles.caretIcon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.subRow}>
          {!esHoy && (
            <TouchableOpacity style={styles.todayBadge} onPress={onIrAHoy} activeOpacity={0.7}>
              <Text style={styles.todayBadgeText}>Ir a Hoy</Text>
            </TouchableOpacity>
          )}

          {estadoGuardado === 'guardando' && (
            <View style={styles.saveBadge}>
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.miniSpinner} />
              <Text style={styles.saveBadgeText}>Guardando...</Text>
            </View>
          )}

          {estadoGuardado === 'guardado' && (
            <View style={styles.saveBadgeSuccess}>
              <FontAwesome name="check" size={10} color={theme.colors.primary} style={styles.checkIcon} />
              <Text style={styles.saveBadgeSuccessText}>Guardado</Text>
            </View>
          )}
        </View>
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
  spinner: {
    marginLeft: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  todayBadge: {
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
    color: theme.colors.textMuted,
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
    color: theme.colors.primary,
  },
})
