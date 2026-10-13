import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { DiaResumenCard } from './DiaResumenCard'
import { ExportarPdfModal } from '../diario/ExportarPdfModal'
import { useHistorico } from '../../hooks/useHistorico'
import { theme } from '../../utils/theme'

interface HistoricoViewProps {
  userId: string
  nombreUsuario: string
  onEditarDia: (fecha: string) => void
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  userId,
  nombreUsuario,
  onEditarDia,
}) => {
  const { desde, hasta, dias, metricas, cargando, establecerPreset } =
    useHistorico(userId)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [presetActivo, setPresetActivo] = useState<number>(14)

  const cambiarPreset = (diasCount: number) => {
    setPresetActivo(diasCount)
    establecerPreset(diasCount)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de Presets de Rango */}
        <View style={styles.presetsRow}>
          {[7, 14, 30].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.presetBtn, presetActivo === d && styles.presetBtnActivo]}
              onPress={() => cambiarPreset(d)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  presetActivo === d && styles.presetBtnTextActivo,
                ]}
              >
                Últimos {d} días
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={() => setShowPdfModal(true)}
            activeOpacity={0.7}
            accessibilityLabel="Exportar rango a PDF"
          >
            <FontAwesome name="file-pdf-o" size={14} color={theme.colors.white} />
            <Text style={styles.pdfBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de métricas agregadas */}
        <Card style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>
                {metricas.diasConDatos}/{metricas.totalDias}
              </Text>
              <Text style={styles.metricLabel}>DÍAS REGISTRADOS</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{metricas.mediaAgua} L</Text>
              <Text style={styles.metricLabel}>MEDIA AGUA/DÍA</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{metricas.comidasFuera}</Text>
              <Text style={styles.metricLabel}>COMIDAS FUERA</Text>
            </View>
          </View>
        </Card>

        {cargando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando histórico...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {[...dias].reverse().map(dia => (
              <DiaResumenCard key={dia.key} dia={dia} onEditar={onEditarDia} />
            ))}
          </View>
        )}
      </ScrollView>

      <ExportarPdfModal
        visible={showPdfModal}
        userId={userId}
        nombreUsuario={nombreUsuario}
        onClose={() => setShowPdfModal(false)}
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
  metricsCard: {
    backgroundColor: theme.colors.card,
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
