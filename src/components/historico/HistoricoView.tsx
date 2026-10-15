import React, { useState, useCallback } from 'react'
import { View, ScrollView } from 'react-native'
import { DiaResumenCard } from './DiaResumenCard'
import { HistoricoSkeleton } from './HistoricoSkeleton'
import { ExportarPdfModal } from '../diario/ExportarPdfModal'
import { CalendarModal } from '../common/CalendarModal'
import { useHistorico } from '../../hooks/useHistorico'
import { useTheme } from '../../context/ThemeContext'
import { styles } from './HistoricoView.styles'
import { HistoricoFiltrosRow } from './components/HistoricoFiltrosRow'
import { HistoricoMetricasCard } from './components/HistoricoMetricasCard'

export interface HistoricoViewProps {
  userId: string
  nombreUsuario: string
  onEditarDia: (fecha: string) => void
  showPdfModalExterno?: boolean
  onCerrarPdfModalExterno?: () => void
}

/**
 * Pantalla de histórico de registros nutricionales.
 * Permite filtrar por diferentes períodos temporales, analizar estadísticas agregadas,
 * exportar a PDF y navegar a cualquier fecha pasada para su edición.
 *
 * @param props - Identificador de usuario, nombre, callbacks de edición y control modal.
 * @returns Vista de histórico con filtros, métricas y lista de días.
 */
export const HistoricoView: React.FC<HistoricoViewProps> = ({
  userId,
  nombreUsuario,
  onEditarDia,
  showPdfModalExterno,
  onCerrarPdfModalExterno,
}) => {
  const { colors } = useTheme()
  const { desde, hasta, dias, metricas, cargando, establecerPreset, setDesde, setHasta } = useHistorico(userId)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false)
  const [presetActivo, setPresetActivo] = useState<number>(14)

  const cambiarPreset = useCallback((diasCount: number) => {
    setPresetActivo(diasCount)
    establecerPreset(diasCount)
  }, [establecerPreset])

  const aplicarRangoPersonalizado = useCallback((rango: { desde: string; hasta: string }) => {
    setPresetActivo(0)
    setDesde(rango.desde)
    setHasta(rango.hasta)
  }, [setDesde, setHasta])

  const handleAbrirCalendario = useCallback(() => setShowCustomRangeModal(true), [])
  const handleCerrarCalendario = useCallback(() => setShowCustomRangeModal(false), [])
  const handleAbrirPdf = useCallback(() => setShowPdfModal(true), [])
  const handleCerrarPdf = useCallback(() => {
    setShowPdfModal(false)
    onCerrarPdfModalExterno?.()
  }, [onCerrarPdfModalExterno])

  const modalPdfVisible = showPdfModal || !!showPdfModalExterno

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HistoricoFiltrosRow
          presetActivo={presetActivo}
          onCambiarPreset={cambiarPreset}
          onAbrirCalendario={handleAbrirCalendario}
          onAbrirPdf={handleAbrirPdf}
        />

        <HistoricoMetricasCard
          desde={desde}
          hasta={hasta}
          totalDias={dias.length}
          metricas={metricas}
        />

        {cargando ? (
          <HistoricoSkeleton />
        ) : (
          <View style={styles.listContainer}>
            {[...dias].reverse().map(dia => (
              <DiaResumenCard key={dia.key} dia={dia} onEditar={onEditarDia} />
            ))}
          </View>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCustomRangeModal}
        modo="range"
        titulo="Filtrar Histórico"
        rangoSeleccionado={{ desde, hasta }}
        onSeleccionarRango={aplicarRangoPersonalizado}
        onClose={handleCerrarCalendario}
      />

      <ExportarPdfModal
        visible={modalPdfVisible}
        userId={userId}
        nombreUsuario={nombreUsuario}
        rangoInicial={{ desde, hasta }}
        onClose={handleCerrarPdf}
      />
    </View>
  )
}
