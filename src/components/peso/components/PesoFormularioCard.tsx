import React from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import { hoy, formatearFechaLarga, formatearFechaCorta } from '../../../utils/fechas'
import { styles } from '../PesoView.styles'

export interface PesoFormularioCardProps {
  fechaPeso: string
  nuevoPeso: string
  pesos: Record<string, number>
  guardando: boolean
  isFocused: boolean
  onCambiarTexto: (texto: string) => void
  onFocus: () => void
  onBlur: () => void
  onAbrirCalendario: () => void
  onIrAHoy: () => void
  onGuardar: () => void
}

/**
 * Tarjeta de formulario para registrar o actualizar el peso corporal en una fecha determinada.
 * Incluye selector de fecha rápida, aviso de sobreescritura y retroalimentación de persistencia.
 *
 * @param props - Estados del formulario, valores actuales y manejadores de acción.
 * @returns Tarjeta contenedora con campos de entrada y botón de guardado.
 */
export const PesoFormularioCard: React.FC<PesoFormularioCardProps> = React.memo(({
  fechaPeso,
  nuevoPeso,
  pesos,
  guardando,
  isFocused,
  onCambiarTexto,
  onFocus,
  onBlur,
  onAbrirCalendario,
  onIrAHoy,
  onGuardar,
}) => {
  const { colors } = useTheme()
  const pesoExistente = pesos[fechaPeso]

  return (
    <Card>
      <View style={styles.cardHeader}>
        <FontAwesome name="plus-circle" size={16} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Registrar peso</Text>
      </View>

      <View style={[styles.dateSelectorSection, { borderBottomColor: colors.border }]}>
        <Text style={[styles.dateSelectorLabel, { color: colors.textMuted }]}>Fecha del registro:</Text>
        <View style={styles.dateSelectorRow}>
          <TouchableOpacity
            style={[styles.datePickerBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={onAbrirCalendario}
            activeOpacity={0.7}
            accessibilityLabel="Seleccionar día para registrar peso"
          >
            <FontAwesome name="calendar-o" size={14} color={colors.primary} style={styles.calendarIcon} />
            <Text style={[styles.datePickerBtnText, { color: colors.text }]}>
              {fechaPeso === hoy() ? `Hoy (${formatearFechaCorta(fechaPeso)})` : formatearFechaLarga(fechaPeso)}
            </Text>
            <FontAwesome name="caret-down" size={12} color={colors.textMuted} style={styles.caretIcon} />
          </TouchableOpacity>

          {fechaPeso !== hoy() && (
            <TouchableOpacity
              style={[styles.todayQuickBtn, { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight }]}
              onPress={onIrAHoy}
              activeOpacity={0.7}
              accessibilityLabel="Volver a la fecha de hoy"
            >
              <Text style={[styles.todayQuickBtnText, { color: colors.primary }]}>Ir a Hoy</Text>
            </TouchableOpacity>
          )}
        </View>

        {pesoExistente !== undefined && (
          <View style={[styles.existingNotice, { backgroundColor: colors.primarySoft }]}>
            <FontAwesome name="info-circle" size={12} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.existingNoticeText, { color: colors.text }]}>
              Registrado ese día:{' '}
              <Text style={[styles.existingNoticeBold, { color: colors.primaryDark }]}>{pesoExistente} kg</Text> (al guardar se actualizará)
            </Text>
          </View>
        )}
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            isFocused && { borderColor: colors.borderFocus, backgroundColor: colors.focusSoft },
          ]}
          placeholder={pesoExistente !== undefined ? `Actual: ${pesoExistente}` : 'Ej: 72.5'}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={nuevoPeso}
          onChangeText={onCambiarTexto}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }, guardando && styles.saveBtnDisabled]}
          onPress={onGuardar}
          disabled={guardando}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Guardar peso"
        >
          {guardando ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </Card>
  )
})
