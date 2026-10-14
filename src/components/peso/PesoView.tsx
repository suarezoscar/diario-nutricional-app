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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Tarjeta de métricas */}
        {estadisticas && (
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ÚLTIMO PESO</Text>
                <Text style={styles.statVal}>{estadisticas.ultimoPeso} kg</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VARIACIÓN</Text>
                <Text
                  style={[
                    styles.statVal,
                    estadisticas.diferencia < 0
                      ? styles.statValDown
                      : estadisticas.diferencia > 0
                      ? styles.statValUp
                      : null,
                  ]}
                >
                  {estadisticas.diferencia > 0 ? `+${estadisticas.diferencia}` : estadisticas.diferencia} kg
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>MÍN / MÁX</Text>
                <Text style={styles.statValSmall}>
                  {estadisticas.min} / {estadisticas.max}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Gráfica de evolución */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="line-chart" size={16} color={theme.colors.primary} style={styles.headerIcon} />
            <Text style={styles.cardTitle}>Evolución de peso</Text>
          </View>
          {cargando ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <WeightChart data={chartData} />
          )}
        </Card>

        {/* Formulario de registro con selector de día */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="plus-circle" size={16} color={theme.colors.primary} style={styles.headerIcon} />
            <Text style={styles.cardTitle}>Registrar peso</Text>
          </View>

          {/* Selector de fecha para el registro */}
          <View style={styles.dateSelectorSection}>
            <Text style={styles.dateSelectorLabel}>Fecha del registro:</Text>
            <View style={styles.dateSelectorRow}>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowCalendarModal(true)}
                activeOpacity={0.7}
                accessibilityLabel="Seleccionar día para registrar peso"
              >
                <FontAwesome name="calendar-o" size={14} color={theme.colors.primary} style={styles.calendarIcon} />
                <Text style={styles.datePickerBtnText}>
                  {fechaPeso === hoy()
                    ? `Hoy (${formatearFechaCorta(fechaPeso)})`
                    : formatearFechaLarga(fechaPeso)}
                </Text>
                <FontAwesome name="caret-down" size={12} color={theme.colors.textMuted} style={styles.caretIcon} />
              </TouchableOpacity>

              {fechaPeso !== hoy() && (
                <TouchableOpacity
                  style={styles.todayQuickBtn}
                  onPress={() => setFechaPeso(hoy())}
                  activeOpacity={0.7}
                  accessibilityLabel="Volver a la fecha de hoy"
                >
                  <Text style={styles.todayQuickBtnText}>Ir a Hoy</Text>
                </TouchableOpacity>
              )}
            </View>

            {pesos[fechaPeso] !== undefined && (
              <View style={styles.existingNotice}>
                <FontAwesome name="info-circle" size={12} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.existingNoticeText}>
                  Registrado ese día:{' '}
                  <Text style={styles.existingNoticeBold}>{pesos[fechaPeso]} kg</Text> (al guardar se actualizará)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder={pesos[fechaPeso] !== undefined ? `Actual: ${pesos[fechaPeso]}` : 'Ej: 72.5'}
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="decimal-pad"
              value={nuevoPeso}
              onChangeText={setNuevoPeso}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity
              style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
              onPress={handleGuardar}
              disabled={guardando}
              activeOpacity={0.7}
            >
              {guardando ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Historial cronológico inverso */}
        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="history" size={16} color={theme.colors.primary} style={styles.headerIcon} />
            <Text style={styles.cardTitle}>Historial ({chartData.length})</Text>
          </View>

          {chartData.length === 0 && !cargando && (
            <Text style={styles.emptyText}>No hay registros de peso guardados todavía.</Text>
          )}

          {[...chartData].reverse().map(item => (
            <View key={item.fecha} style={styles.historyRow}>
              <TouchableOpacity
                style={styles.historyInfo}
                onPress={() => onSeleccionarDia?.(item.fecha)}
                activeOpacity={onSeleccionarDia ? 0.7 : 1}
              >
                <Text style={styles.historyDate}>{formatearFechaLarga(item.fecha)}</Text>
                <Text style={styles.historyWeight}>{item.peso} kg</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmarBorrado(item.fecha, item.peso)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <FontAwesome name="trash-o" size={15} color={theme.colors.error} />
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
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryLight,
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
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statValDown: {
    color: theme.colors.primary,
  },
  statValUp: {
    color: theme.colors.error,
  },
  statValSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
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
    color: theme.colors.text,
  },
  dateSelectorSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dateSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
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
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  caretIcon: {
    marginLeft: 4,
  },
  todayQuickBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  todayQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  existingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  existingNoticeText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  existingNoticeBold: {
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: theme.colors.white,
    elevation: 2,
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
    color: theme.colors.textMuted,
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
    borderBottomColor: theme.colors.border,
  },
  historyInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.md,
  },
  historyDate: {
    fontSize: 13,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  historyWeight: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
  },
})
