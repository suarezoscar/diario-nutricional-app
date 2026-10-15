import React, { useCallback } from 'react'
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { CalendarModal } from '../common/CalendarModal'
import { styles } from './ExportarPdfModal.styles'
import { useExportarPdf } from './hooks/useExportarPdf'
import { ExportarPdfRangoSelector } from './components/ExportarPdfRangoSelector'

export interface ExportarPdfModalProps {
  visible: boolean
  userId: string
  nombreUsuario: string
  rangoInicial?: { desde: string; hasta: string }
  onClose: () => void
}

/**
 * Modal para configurar y generar reportes nutricionales en formato PDF profesional.
 * Ofrece atajos rápidos de período, selector interactivo de rango y opciones de impresión directa o compartir.
 *
 * @param props - Estados de visibilidad, identificación del usuario y callbacks de cierre.
 * @returns Ventana modal interactiva con controles de exportación PDF.
 */
export const ExportarPdfModal: React.FC<ExportarPdfModalProps> = ({
  visible,
  userId,
  nombreUsuario,
  rangoInicial,
  onClose,
}) => {
  const { colors } = useTheme()
  const p = useExportarPdf({ userId, nombreUsuario, rangoInicial, onClose })

  const handleAbrirCalendario = useCallback(() => p.setShowCalendar(true), [p])
  const handleCerrarCalendario = useCallback(() => p.setShowCalendar(false), [p])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <FontAwesome name="file-pdf-o" size={20} color={colors.primary} style={styles.icon} />
              <Text style={[styles.title, { color: colors.text }]}>Exportar Resumen PDF</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityLabel="Cerrar modal de exportación PDF"
            >
              <FontAwesome name="times" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Genera un documento PDF profesional con todas tus comidas, agua y ejercicio en formato horizontal.
          </Text>

          <ExportarPdfRangoSelector
            desde={p.desde}
            hasta={p.hasta}
            dias={p.calcularDias()}
            onAplicarRapido={p.aplicarRangoRapido}
            onAplicarMes={p.aplicarMesActual}
            onAbrirCalendario={handleAbrirCalendario}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.printBtn,
                { backgroundColor: colors.primary },
                p.generando !== null && styles.actionBtnDisabled,
              ]}
              onPress={() => p.handleAccion('imprimir')}
              disabled={p.generando !== null}
              activeOpacity={0.8}
              accessibilityLabel="Imprimir reporte directamente"
            >
              {p.generando === 'imprimir' ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <FontAwesome name="print" size={16} color="#ffffff" style={styles.btnIcon} />
                  <Text style={styles.printBtnText}>Imprimir</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.shareBtn,
                { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
                p.generando !== null && styles.actionBtnDisabled,
              ]}
              onPress={() => p.handleAccion('compartir')}
              disabled={p.generando !== null}
              activeOpacity={0.8}
              accessibilityLabel="Compartir archivo PDF"
            >
              {p.generando === 'compartir' ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <FontAwesome name="share-alt" size={16} color={colors.primary} style={styles.btnIcon} />
                  <Text style={[styles.shareBtnText, { color: colors.primary }]}>Compartir</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CalendarModal
        visible={p.showCalendar}
        modo="range"
        titulo="Seleccionar rango para PDF"
        rangoSeleccionado={{ desde: p.desde, hasta: p.hasta }}
        onSeleccionarRango={p.handleSeleccionarRango}
        onClose={handleCerrarCalendario}
      />
    </Modal>
  )
}
