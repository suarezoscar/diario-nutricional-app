import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { styles } from './CalendarModal.styles'
import { useCalendarModal, type RangoFechas } from './hooks/useCalendarModal'
import { CalendarPresetsRow } from './components/CalendarPresetsRow'
import { CalendarDaysGrid } from './components/CalendarDaysGrid'

export type { RangoFechas }

export interface CalendarModalProps {
  visible: boolean
  modo: 'single' | 'range'
  fechaSeleccionada?: string
  rangoSeleccionado?: RangoFechas
  titulo?: string
  onSeleccionarFecha?: (fecha: string) => void
  onSeleccionarRango?: (rango: RangoFechas) => void
  onClose: () => void
}

/**
 * Modal universal de selección de fecha (día individual o intervalo de fechas).
 * Incluye presets rápidos, navegación mensual fluida y estados accesibles.
 *
 * @param props - Propiedades de visualización, modo y manejadores de evento.
 * @returns Ventana modal superpuesta con vista de calendario.
 */
export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  modo,
  fechaSeleccionada,
  rangoSeleccionado,
  titulo,
  onSeleccionarFecha,
  onSeleccionarRango,
  onClose,
}) => {
  const { colors } = useTheme()
  const c = useCalendarModal({
    visible,
    modo,
    fechaSeleccionada,
    rangoSeleccionado,
    onSeleccionarFecha,
    onSeleccionarRango,
    onClose,
  })

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <FontAwesome name="calendar" size={18} color={colors.primary} style={styles.titleIcon} />
              <Text style={[styles.title, { color: colors.text }]}>
                {titulo || (modo === 'single' ? 'Seleccionar día' : 'Rango de fechas')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityLabel="Cerrar calendario"
            >
              <FontAwesome name="times" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {modo === 'range' && (
            <CalendarPresetsRow
              rangoInterno={c.rangoInterno}
              diasEnRango={c.calcularDiasEnRango()}
              onAplicarPreset={c.aplicarPreset}
              onAplicarPresetMes={c.aplicarPresetMes}
            />
          )}

          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: colors.background }]}
              onPress={() => c.cambiarMes(-1)}
              activeOpacity={0.6}
              accessibilityLabel="Mes anterior"
            >
              <FontAwesome name="chevron-left" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>{c.mesAnioTexto}</Text>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: colors.background }]}
              onPress={() => c.cambiarMes(1)}
              activeOpacity={0.6}
              accessibilityLabel="Mes siguiente"
            >
              <FontAwesome name="chevron-right" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>

          <CalendarDaysGrid
            diasGrid={c.diasGrid}
            modo={modo}
            fechaSeleccionada={fechaSeleccionada}
            rangoInterno={c.rangoInterno}
            onPressDia={c.handlePressDia}
          />

          {modo === 'range' && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={c.handleConfirmarRango}
                activeOpacity={0.8}
              >
                <FontAwesome name="check" size={14} color="#ffffff" style={styles.btnIcon} />
                <Text style={styles.applyBtnText}>Aplicar rango</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}
