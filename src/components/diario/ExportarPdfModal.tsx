import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import { hoy, desplazarDia, formatearFechaCorta, inicioYFinMesActual } from '../../utils/fechas'
import { exportarPDFPorRango } from '../../services/pdfService'
import { CalendarModal } from '../common/CalendarModal'

interface ExportarPdfModalProps {
  visible: boolean
  userId: string
  nombreUsuario: string
  rangoInicial?: { desde: string; hasta: string }
  onClose: () => void
}

export const ExportarPdfModal: React.FC<ExportarPdfModalProps> = ({
  visible,
  userId,
  nombreUsuario,
  rangoInicial,
  onClose,
}) => {
  const fechaHoy = hoy()
  const [desde, setDesde] = useState(rangoInicial?.desde || desplazarDia(fechaHoy, -6))
  const [hasta, setHasta] = useState(rangoInicial?.hasta || fechaHoy)
  const [generando, setGenerando] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const aplicarRangoRapido = (diasAtras: number) => {
    setDesde(desplazarDia(fechaHoy, -diasAtras + 1))
    setHasta(fechaHoy)
  }

  const aplicarMesActual = () => {
    const rangoMes = inicioYFinMesActual()
    setDesde(rangoMes.desde)
    setHasta(rangoMes.hasta)
  }

  const calcularDias = () => {
    if (!desde || !hasta) return 1
    const d1 = new Date(desde).getTime()
    const d2 = new Date(hasta).getTime()
    return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }

  const handleExportar = async () => {
    if (!desde || !hasta) {
      Alert.alert('Fechas requeridas', 'Por favor selecciona un rango de fechas.')
      return
    }

    if (desde > hasta) {
      Alert.alert('Rango inválido', 'La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    setGenerando(true)
    try {
      await exportarPDFPorRango({
        userId,
        nombre: nombreUsuario,
        desde,
        hasta,
      })
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al generar el PDF'
      Alert.alert('Error al exportar', msg)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <FontAwesome name="file-pdf-o" size={20} color={theme.colors.primary} style={styles.icon} />
              <Text style={styles.title}>Exportar Resumen PDF</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <FontAwesome name="times" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Genera un documento PDF profesional con todas tus comidas, agua y peso en formato horizontal.
          </Text>

          <Text style={styles.labelRango}>Atajos rápidos:</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(7)} activeOpacity={0.7}>
              <Text style={styles.pillText}>7 días</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(14)} activeOpacity={0.7}>
              <Text style={styles.pillText}>14 días</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(30)} activeOpacity={0.7}>
              <Text style={styles.pillText}>30 días</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={aplicarMesActual} activeOpacity={0.7}>
              <Text style={styles.pillText}>Este mes</Text>
            </TouchableOpacity>
          </View>

          {/* Selector de Rango Interactivo con Calendario */}
          <Text style={styles.labelRango}>Rango de fechas a incluir:</Text>
          <TouchableOpacity
            style={styles.dateSelectorBox}
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.75}
            accessibilityLabel="Abrir calendario para seleccionar rango de fechas"
          >
            <View style={styles.dateSelectorLeft}>
              <View style={styles.calendarIconCircle}>
                <FontAwesome name="calendar" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.dateSelectorTexts}>
                <Text style={styles.dateSelectorRange}>
                  {formatearFechaCorta(desde)} ➔ {formatearFechaCorta(hasta)}
                </Text>
                <Text style={styles.dateSelectorHint}>Toca para cambiar en el calendario</Text>
              </View>
            </View>
            <View style={styles.dateSelectorBadge}>
              <Text style={styles.dateSelectorBadgeText}>{calcularDias()} días</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportBtn, generando && styles.exportBtnDisabled]}
            onPress={handleExportar}
            disabled={generando}
            activeOpacity={0.8}
          >
            {generando ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <View style={styles.btnContent}>
                <FontAwesome name="share-alt" size={16} color={theme.colors.white} style={styles.btnIcon} />
                <Text style={styles.exportBtnText}>Generar y Compartir PDF</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Selector de Rango con Calendario Modal */}
      <CalendarModal
        visible={showCalendar}
        modo="range"
        titulo="Seleccionar rango para PDF"
        rangoSeleccionado={{ desde, hasta }}
        onSeleccionarRango={r => {
          setDesde(r.desde)
          setHasta(r.hasta)
        }}
        onClose={() => setShowCalendar(false)}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
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
    marginBottom: theme.spacing.sm,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
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
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  labelRango: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dateSelectorBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  calendarIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectorTexts: {
    gap: 2,
  },
  dateSelectorRange: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dateSelectorHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  dateSelectorBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  dateSelectorBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  exportBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: theme.spacing.sm,
  },
  exportBtnText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
})
