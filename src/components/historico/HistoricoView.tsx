import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { DiaResumenCard } from './DiaResumenCard'
import { HistoricoSkeleton } from './HistoricoSkeleton'
import { ExportarPdfModal } from '../diario/ExportarPdfModal'
import { CalendarModal } from '../common/CalendarModal'
import { useHistorico } from '../../hooks/useHistorico'
import { useTheme } from '../../context/ThemeContext'
import { formatearFechaCorta } from '../../utils/fechas'
import { theme } from '../../utils/theme'

interface HistoricoViewProps {
  userId: string
  nombreUsuario: string
  onEditarDia: (fecha: string) => void
  showPdfModalExterno?: boolean
  onCerrarPdfModalExterno?: () => void
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  userId,
  nombreUsuario,
  onEditarDia,
  showPdfModalExterno,
  onCerrarPdfModalExterno,
}) => {
  const { colors } = useTheme()
  const { desde, hasta, dias, metricas, cargando, establecerPreset, setDesde, setHasta } =
    useHistorico(userId)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false)
  const [presetActivo, setPresetActivo] = useState<number>(14)

  const cambiarPreset = (diasCount: number) => {
    setPresetActivo(diasCount)
    establecerPreset(diasCount)
  }

  const aplicarRangoPersonalizado = (rango: { desde: string; hasta: string }) => {
    setPresetActivo(0)
    setDesde(rango.desde)
    setHasta(rango.hasta)
  }

  const modalPdfVisible = showPdfModal || !!showPdfModalExterno

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de Presets de Rango + Calendario + PDF */}
        <View style={styles.presetsRow}>
          {[7, 14, 30].map(d => (
            <TouchableOpacity
              key={d}
              style={[
                styles.presetBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                presetActivo === d && { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
              ]}
              onPress={() => cambiarPreset(d)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  { color: colors.textMuted },
                  presetActivo === d && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {d}d
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botón Calendario Rango Personalizado */}
          <TouchableOpacity
            style={[
              styles.presetBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              presetActivo === 0 && { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
            ]}
            onPress={() => setShowCustomRangeModal(true)}
            activeOpacity={0.7}
            accessibilityLabel="Filtrar por rango de fechas en calendario"
          >
            <View style={styles.customPresetContent}>
              <FontAwesome
                name="calendar"
                size={11}
                color={presetActivo === 0 ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.presetBtnText,
                  { color: colors.textMuted },
                  presetActivo === 0 && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                Rango
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botón Exportar PDF */}
          <TouchableOpacity
            style={[styles.pdfBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowPdfModal(true)}
            activeOpacity={0.7}
            accessibilityLabel="Exportar rango a PDF"
          >
            <FontAwesome name="file-pdf-o" size={13} color="#ffffff" />
            <Text style={styles.pdfBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador del rango actual */}
        <View style={[styles.rangoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FontAwesome name="calendar-check-o" size={13} color={colors.primary} />
          <Text style={[styles.rangoBannerText, { color: colors.text }]}>
            {formatearFechaCorta(desde)} ➔ {formatearFechaCorta(hasta)}
          </Text>
          <View style={[styles.rangoDiasBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.rangoDiasBadgeText, { color: colors.primary }]}>{dias.length} días</Text>
          </View>
        </View>

        {/* Tarjeta de métricas agregadas */}
        <Card style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: colors.primary }]}>
                {metricas.diasConDatos}/{metricas.totalDias}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DÍAS REGISTRADOS</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: colors.primary }]}>{metricas.mediaAgua} L</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MEDIA AGUA/DÍA</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: colors.primary }]}>{metricas.comidasFuera}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>COMIDAS FUERA</Text>
            </View>
          </View>
        </Card>

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

      {/* Calendario para rango del histórico */}
      <CalendarModal
        visible={showCustomRangeModal}
        modo="range"
        titulo="Filtrar Histórico"
        rangoSeleccionado={{ desde, hasta }}
        onSeleccionarRango={aplicarRangoPersonalizado}
        onClose={() => setShowCustomRangeModal(false)}
      />

      {/* Exportar PDF del rango actual */}
      <ExportarPdfModal
        visible={modalPdfVisible}
        userId={userId}
        nombreUsuario={nombreUsuario}
        rangoInicial={{ desde, hasta }}
        onClose={() => {
          setShowPdfModal(false)
          onCerrarPdfModalExterno?.()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  presetBtnActivo: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryLight,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  presetBtnTextActivo: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
  },
  pdfBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  customPresetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rangoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangoBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rangoDiasBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rangoDiasBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  metricsCard: {
    marginBottom: theme.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  listContainer: {
    gap: 2,
  },
})
