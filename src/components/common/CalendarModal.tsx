import React, { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import {
  hoy,
  desplazarDia,
  obtenerMesAnio,
  desplazarMes,
  obtenerDiasMesGrid,
  formatearFechaCorta,
  inicioYFinMesActual,
  type DiaGrid,
} from '../../utils/fechas'

export interface RangoFechas {
  desde: string
  hasta: string
}

interface CalendarModalProps {
  visible: boolean
  modo: 'single' | 'range'
  fechaSeleccionada?: string
  rangoSeleccionado?: RangoFechas
  titulo?: string
  onSeleccionarFecha?: (fecha: string) => void
  onSeleccionarRango?: (rango: RangoFechas) => void
  onClose: () => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

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
  const fechaHoy = hoy()
  const [fechaMesRef, setFechaMesRef] = useState<Date>(() => new Date())
  const [rangoInterno, setRangoInterno] = useState<RangoFechas>(() => ({
    desde: rangoSeleccionado?.desde || desplazarDia(fechaHoy, -6),
    hasta: rangoSeleccionado?.hasta || fechaHoy,
  }))

  useEffect(() => {
    if (visible) {
      if (modo === 'single' && fechaSeleccionada) {
        try {
          const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number)
          setFechaMesRef(new Date(anio, mes - 1, dia))
        } catch {
          setFechaMesRef(new Date())
        }
      } else if (modo === 'range' && rangoSeleccionado) {
        setRangoInterno(rangoSeleccionado)
        try {
          const [anio, mes, dia] = rangoSeleccionado.hasta.split('-').map(Number)
          setFechaMesRef(new Date(anio, mes - 1, dia))
        } catch {
          setFechaMesRef(new Date())
        }
      }
    }
  }, [visible, modo, fechaSeleccionada, rangoSeleccionado])

  const diasGrid = useMemo(() => {
    return obtenerDiasMesGrid(fechaMesRef)
  }, [fechaMesRef])

  const mesAnioTexto = useMemo(() => {
    return obtenerMesAnio(fechaMesRef)
  }, [fechaMesRef])

  const cambiarMes = (delta: number) => {
    setFechaMesRef(prev => desplazarMes(prev, delta))
  }

  const handlePressDia = (dia: DiaGrid) => {
    if (modo === 'single') {
      onSeleccionarFecha?.(dia.fecha)
      onClose()
      return
    }

    // Modo Rango
    if (!rangoInterno.desde || (rangoInterno.desde && rangoInterno.hasta)) {
      setRangoInterno({ desde: dia.fecha, hasta: '' })
    } else {
      if (dia.fecha < rangoInterno.desde) {
        setRangoInterno({ desde: dia.fecha, hasta: rangoInterno.desde })
      } else {
        setRangoInterno({ desde: rangoInterno.desde, hasta: dia.fecha })
      }
    }
  }

  const aplicarPreset = (diasAtras: number) => {
    const nuevoRango = {
      desde: desplazarDia(fechaHoy, -diasAtras + 1),
      hasta: fechaHoy,
    }
    setRangoInterno(nuevoRango)
  }

  const aplicarPresetMes = () => {
    const rangoMes = inicioYFinMesActual()
    setRangoInterno(rangoMes)
  }

  const handleConfirmarRango = () => {
    if (!rangoInterno.desde) return
    const rangoFinal = {
      desde: rangoInterno.desde,
      hasta: rangoInterno.hasta || rangoInterno.desde,
    }
    onSeleccionarRango?.(rangoFinal)
    onClose()
  }

  const calcularDiasEnRango = () => {
    if (!rangoInterno.desde || !rangoInterno.hasta) return 1
    const d1 = new Date(rangoInterno.desde).getTime()
    const d2 = new Date(rangoInterno.hasta).getTime()
    return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <FontAwesome name="calendar" size={18} color={theme.colors.primary} style={styles.titleIcon} />
              <Text style={styles.title}>
                {titulo || (modo === 'single' ? 'Seleccionar día' : 'Rango de fechas')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <FontAwesome name="times" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Atajos de rango rápido en modo 'range' */}
          {modo === 'range' && (
            <View style={styles.presetsRow}>
              <TouchableOpacity style={styles.pill} onPress={() => aplicarPreset(7)} activeOpacity={0.7}>
                <Text style={styles.pillText}>7d</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill} onPress={() => aplicarPreset(14)} activeOpacity={0.7}>
                <Text style={styles.pillText}>14d</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill} onPress={() => aplicarPreset(30)} activeOpacity={0.7}>
                <Text style={styles.pillText}>30d</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill} onPress={aplicarPresetMes} activeOpacity={0.7}>
                <Text style={styles.pillText}>Este mes</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resumen del rango seleccionado */}
          {modo === 'range' && (
            <View style={styles.rangeSummary}>
              <Text style={styles.rangeText}>
                {rangoInterno.desde ? formatearFechaCorta(rangoInterno.desde) : '—'} ➔{' '}
                {rangoInterno.hasta ? formatearFechaCorta(rangoInterno.hasta) : 'Selecciona fin'}
              </Text>
              {!!rangoInterno.hasta && (
                <View style={styles.rangeBadge}>
                  <Text style={styles.rangeBadgeText}>{calcularDiasEnRango()} días</Text>
                </View>
              )}
            </View>
          )}

          {/* Navegación del mes */}
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn} onPress={() => cambiarMes(-1)} activeOpacity={0.6}>
              <FontAwesome name="chevron-left" size={14} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{mesAnioTexto}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={() => cambiarMes(1)} activeOpacity={0.6}>
              <FontAwesome name="chevron-right" size={14} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Días de la semana */}
          <View style={styles.weekDaysRow}>
            {DIAS_SEMANA.map((d, i) => (
              <Text key={i} style={styles.weekDayText}>
                {d}
              </Text>
            ))}
          </View>

          {/* Grid de días */}
          <View style={styles.daysGrid}>
            {diasGrid.map(dia => {
              const esSingle = modo === 'single' && dia.fecha === fechaSeleccionada
              const esInicioRango = modo === 'range' && dia.fecha === rangoInterno.desde
              const esFinRango = modo === 'range' && dia.fecha === rangoInterno.hasta
              const enRango =
                modo === 'range' &&
                rangoInterno.desde &&
                rangoInterno.hasta &&
                dia.fecha > rangoInterno.desde &&
                dia.fecha < rangoInterno.hasta

              return (
                <View
                  key={dia.fecha}
                  style={[
                    styles.dayCell,
                    enRango && styles.dayCellInRange,
                    esInicioRango && rangoInterno.hasta && styles.dayCellStartRange,
                    esFinRango && styles.dayCellEndRange,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      esSingle && styles.dayButtonSelected,
                      (esInicioRango || esFinRango) && styles.dayButtonSelected,
                      dia.esHoy && !esSingle && !esInicioRango && !esFinRango && styles.dayButtonToday,
                    ]}
                    onPress={() => handlePressDia(dia)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        !dia.enMesActual && styles.dayNumberDim,
                        (esSingle || esInicioRango || esFinRango) && styles.dayNumberSelected,
                        dia.esHoy && !esSingle && !esInicioRango && !esFinRango && styles.dayNumberToday,
                      ]}
                    >
                      {dia.numero}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>

          {/* Botones de acción (modo rango) */}
          {modo === 'range' && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleConfirmarRango}
                activeOpacity={0.8}
              >
                <FontAwesome name="check" size={14} color={theme.colors.white} style={styles.btnIcon} />
                <Text style={styles.applyBtnText}>Aplicar rango</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    elevation: 8,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  pill: {
    flex: 1,
    backgroundColor: theme.colors.primarySoft,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rangeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rangeBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  rangeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  navBtn: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellInRange: {
    backgroundColor: theme.colors.primarySoft,
  },
  dayCellStartRange: {
    backgroundColor: theme.colors.primarySoft,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  dayCellEndRange: {
    backgroundColor: theme.colors.primarySoft,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  dayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayButtonToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
  },
  dayNumber: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dayNumberDim: {
    color: theme.colors.textMuted,
    opacity: 0.35,
  },
  dayNumberSelected: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  btnIcon: {
    marginRight: 6,
  },
  applyBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
})
