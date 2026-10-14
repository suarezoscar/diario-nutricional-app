import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { CalendarModal } from '../common/CalendarModal'
import { WeightChart } from './WeightChart'
import { usePesoHistorial } from '../../hooks/usePesoHistorial'
import { hoy, formatearFechaLarga, formatearFechaCorta } from '../../utils/fechas'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'

interface PesoViewProps {
  userId: string
  onSeleccionarDia?: (fecha: string) => void
}

/**
 * Vista principal de evolución y registro del peso corporal.
 * Permite visualizar métricas históricas, gráfica de evolución y registrar
 * el peso para cualquier día seleccionado (por defecto hoy).
 */
export const PesoView: React.FC<PesoViewProps> = ({ userId, onSeleccionarDia }) => {
  const { colors } = useTheme()
  const { chartData, estadisticas, pesos, cargando, guardando, guardar, borrar } =
    usePesoHistorial(userId)

  const [nuevoPeso, setNuevoPeso] = useState('')
  const [fechaPeso, setFechaPeso] = useState(hoy())
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleGuardar = async () => {
    const val = parseFloat(nuevoPeso.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      Alert.alert('Valor inválido', 'Introduce un peso numérico válido en kg.')
      return
    }
    await guardar(fechaPeso, val)
    setNuevoPeso('')
  }

  const confirmarBorrado = (fecha: string, valor: number) => {
    Alert.alert(
      'Eliminar registro',
      `¿Deseas eliminar el registro de ${valor} kg del ${formatearFechaLarga(fecha)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => borrar(fecha) },
      ],
    )
  }

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Tarjeta de métricas */}
        {estadisticas && (
          <Card
            style={[
              styles.statsCard,
              { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.primary }]}>ÚLTIMO PESO</Text>
                <Text style={[styles.statVal, { color: colors.text }]}>{estadisticas.ultimoPeso} kg</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.primary }]}>VARIACIÓN</Text>
                <Text
                  style={[
                    styles.statVal,
                    estadisticas.diferencia < 0
                      ? { color: colors.primary }
                      : estadisticas.diferencia > 0
                      ? { color: colors.error }
                      : { color: colors.text },
                  ]}
                >
                  {estadisticas.diferencia > 0 ? `+${estadisticas.diferencia}` : estadisticas.diferencia} kg
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.primary }]}>MÍN / MÁX</Text>
                <Text style={[styles.statValSmall, { color: colors.textMuted }]}>
                  {estadisticas.min} / {estadisticas.max}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Gráfica de evolución */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="line-chart" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Evolución de peso</Text>
          </View>
          {cargando ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <WeightChart data={chartData} />
          )}
        </Card>

        {/* Formulario de registro con selector de día */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="plus-circle" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Registrar peso</Text>
          </View>

          {/* Selector de fecha para el registro */}
          <View style={[styles.dateSelectorSection, { borderBottomColor: colors.border }]}>
            <Text style={[styles.dateSelectorLabel, { color: colors.textMuted }]}>Fecha del registro:</Text>
            <View style={styles.dateSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.datePickerBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() => setShowCalendarModal(true)}
                activeOpacity={0.7}
                accessibilityLabel="Seleccionar día para registrar peso"
              >
                <FontAwesome name="calendar-o" size={14} color={colors.primary} style={styles.calendarIcon} />
                <Text style={[styles.datePickerBtnText, { color: colors.text }]}>
                  {fechaPeso === hoy()
                    ? `Hoy (${formatearFechaCorta(fechaPeso)})`
                    : formatearFechaLarga(fechaPeso)}
                </Text>
                <FontAwesome name="caret-down" size={12} color={colors.textMuted} style={styles.caretIcon} />
              </TouchableOpacity>

              {fechaPeso !== hoy() && (
                <TouchableOpacity
                  style={[
                    styles.todayQuickBtn,
                    { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
                  ]}
                  onPress={() => setFechaPeso(hoy())}
                  activeOpacity={0.7}
                  accessibilityLabel="Volver a la fecha de hoy"
                >
                  <Text style={[styles.todayQuickBtnText, { color: colors.primary }]}>Ir a Hoy</Text>
                </TouchableOpacity>
              )}
            </View>

            {pesos[fechaPeso] !== undefined && (
              <View style={[styles.existingNotice, { backgroundColor: colors.primarySoft }]}>
                <FontAwesome name="info-circle" size={12} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.existingNoticeText, { color: colors.text }]}>
                  Registrado ese día:{' '}
                  <Text style={[styles.existingNoticeBold, { color: colors.primaryDark }]}>{pesos[fechaPeso]} kg</Text> (al guardar se actualizará)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formRow}>
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
              placeholder={pesos[fechaPeso] !== undefined ? `Actual: ${pesos[fechaPeso]}` : 'Ej: 72.5'}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={nuevoPeso}
              onChangeText={setNuevoPeso}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }, guardando && styles.saveBtnDisabled]}
              onPress={handleGuardar}
              disabled={guardando}
              activeOpacity={0.7}
            >
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Historial cronológico inverso */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="history" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Historial ({chartData.length})</Text>
          </View>

          {chartData.length === 0 && !cargando && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No hay registros de peso guardados todavía.
            </Text>
          )}

          {[...chartData].reverse().map(item => (
            <View key={item.fecha} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.historyInfo}
                onPress={() => onSeleccionarDia?.(item.fecha)}
                activeOpacity={onSeleccionarDia ? 0.7 : 1}
              >
                <Text style={[styles.historyDate, { color: colors.text }]}>{formatearFechaLarga(item.fecha)}</Text>
                <Text style={[styles.historyWeight, { color: colors.primary }]}>{item.peso} kg</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmarBorrado(item.fecha, item.peso)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <FontAwesome name="trash-o" size={15} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Modal para selección de fecha del peso */}
      <CalendarModal
        visible={showCalendarModal}
        modo="single"
        fechaSeleccionada={fechaPeso}
        titulo="Seleccionar día del peso"
        onSeleccionarFecha={f => {
          setFechaPeso(f)
          setShowCalendarModal(false)
        }}
        onClose={() => setShowCalendarModal(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 160,
  },
  statsCard: {
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValSmall: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateSelectorSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  dateSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    gap: 8,
  },
  calendarIcon: {
    marginRight: 2,
  },
  datePickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  caretIcon: {
    marginLeft: 4,
  },
  todayQuickBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  todayQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  existingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  existingNoticeText: {
    fontSize: 12,
  },
  existingNoticeBold: {
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.md,
  },
  historyDate: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  historyWeight: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: theme.spacing.xs,
  },
})
