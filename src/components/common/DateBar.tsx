import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { formatearFechaLarga, hoy } from '../../utils/fechas'
import type { EstadoGuardado } from '../../hooks/useDiario'
import { styles } from './DateBar.styles'

export interface DateBarProps {
  fecha: string
  cargando?: boolean
  estadoGuardado?: EstadoGuardado
  onCambiarDia: (delta: number) => void
  onIrAHoy: () => void
  onAbrirCalendario?: () => void
}

/**
 * Barra interactiva de selección y navegación rápida entre fechas.
 * Proporciona botones de día previo y posterior, acceso a calendario y un chip con atajo a "Hoy".
 *
 * @param props - Fecha seleccionada, estados de carga y manejadores de navegación.
 * @returns Elemento horizontal centrado con controles ergonómicos de fecha.
 */
export const DateBar: React.FC<DateBarProps> = React.memo(({
  fecha,
  cargando: _cargando,
  estadoGuardado: _estadoGuardado,
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
