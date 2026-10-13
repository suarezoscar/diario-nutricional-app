import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import { hoy, desplazarDia } from '../../utils/fechas'
import { exportarPDFPorRango } from '../../services/pdfService'

interface ExportarPdfModalProps {
  visible: boolean
  userId: string
  nombreUsuario: string
  onClose: () => void
}

export const ExportarPdfModal: React.FC<ExportarPdfModalProps> = ({
  visible,
  userId,
  nombreUsuario,
  onClose,
}) => {
  const fechaHoy = hoy()
  const [desde, setDesde] = useState(desplazarDia(fechaHoy, -6))
  const [hasta, setHasta] = useState(fechaHoy)
  const [generando, setGenerando] = useState(false)

  const aplicarRangoRapido = (diasAtras: number) => {
    setDesde(desplazarDia(fechaHoy, -diasAtras + 1))
    setHasta(fechaHoy)
  }

  const handleExportar = async () => {
    if (!desde || !hasta) {
      Alert.alert('Fechas requeridas', 'Por favor introduce fecha de inicio y fin.')
      return
    }

    if (desde > hasta) {
      Alert.alert('Rango inválido', 'La fecha "Desde" no puede ser posterior a "Hasta".')
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
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FontAwesome name="times" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Genera un documento PDF con todos tus platos, agua y peso en formato horizontal para tu nutricionista o archivo personal.
          </Text>

          <Text style={styles.labelRango}>Atajos rápidos:</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(7)}>
              <Text style={styles.pillText}>7 días</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(14)}>
              <Text style={styles.pillText}>14 días</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={() => aplicarRangoRapido(30)}>
              <Text style={styles.pillText}>30 días</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputsRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Desde (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={desde}
                onChangeText={setDesde}
                placeholder="2026-10-01"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={10}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Hasta (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={hasta}
                onChangeText={setHasta}
                placeholder="2026-10-14"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={10}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.exportBtn, generando && styles.exportBtnDisabled]}
            onPress={handleExportar}
            disabled={generando}
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
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    elevation: 5,
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
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
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
