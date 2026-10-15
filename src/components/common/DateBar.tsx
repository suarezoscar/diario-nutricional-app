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

export const DateBar: React.FC<DateBarProps> = React.memo(({
  fecha,
  cargando: _cargando,
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
          {/* Chip central fijo: "Hoy" si estamos en el día actual, o botón "Ir a Hoy" si es otro día */}
          {esHoy ? (
            <View
              style={[
                styles.dayChip,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.dayChipText, { color: colors.primary }]}>Hoy</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.dayChip,
                styles.dayChipButton,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
              onPress={onIrAHoy}
              activeOpacity={0.7}
              accessibilityLabel="Ir al día de hoy"
            >
              <FontAwesome name="history" size={10} color={colors.primary} style={styles.historyIcon} />
              <Text style={[styles.dayChipText, { color: colors.primary }]}>Ir a Hoy</Text>
            </TouchableOpacity>
          )}

          {/* Indicador de estado de guardado posicionado de forma absoluta para no desplazar el chip central */}
          {estadoGuardado === 'guardando' && (
            <View style={styles.statusAbsolute}>
              <ActivityIndicator size="small" color={colors.primary} style={styles.miniSpinner} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>Guardando...</Text>
            </View>
          )}

          {estadoGuardado === 'guardado' && (
            <View style={styles.statusAbsolute}>
              <FontAwesome name="check" size={10} color={colors.primary} style={styles.checkIcon} />
              <Text style={[styles.statusSuccessText, { color: colors.primary }]}>Guardado</Text>
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
})

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
    flex: 1,
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
    height: 24,
    marginTop: 4,
    width: '100%',
    position: 'relative',
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    height: 22,
  },
  dayChipButton: {
    // Estilo interactivo consistente
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  historyIcon: {
    marginRight: 4,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusAbsolute: {
    position: 'absolute',
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniSpinner: {
    transform: [{ scale: 0.65 }],
  },
  statusText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  checkIcon: {
    marginRight: 2,
  },
  statusSuccessText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
