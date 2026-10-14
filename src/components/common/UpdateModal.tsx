import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import type { InfoActualizacion } from '../../services/updateService'

interface UpdateModalProps {
  visible: boolean
  info: InfoActualizacion | null
  descargando: boolean
  progreso: number
  error?: string | null
  onInstalar: () => void
  onCerrar: () => void
  onAbrirNavegador: () => void
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  info,
  descargando,
  progreso,
  error,
  onInstalar,
  onCerrar,
  onAbrirNavegador,
}) => {
  if (!visible || !info) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome name="arrow-circle-up" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Actualización disponible</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{info.versionNueva}</Text>
              </View>
            </View>
          </View>

          {/* Notas de la versión */}
          {info.notas ? (
            <ScrollView style={styles.notesContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.notesLabel}>Novedades:</Text>
              <Text style={styles.notesText}>{info.notas}</Text>
            </ScrollView>
          ) : (
            <Text style={styles.description}>
              Hay una nueva versión disponible con mejoras de rendimiento y corrección de errores.
            </Text>
          )}

          {/* Estado de descarga o error */}
          {descargando && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Descargando actualización...</Text>
                <Text style={styles.progressPercent}>{progreso}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progreso}%` }]} />
              </View>
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.statusText}>
                  {progreso >= 100
                    ? 'Iniciando instalador...'
                    : 'Descargando paquete de actualización...'}
                </Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <FontAwesome name="exclamation-circle" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.actions}>
            {descargando ? (
              <Text style={styles.autoInstallNotice}>
                El instalador de Android se abrirá automáticamente en tu pantalla.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, error ? styles.retryButton : null]}
                  onPress={onInstalar}
                  activeOpacity={0.8}
                >
                  <FontAwesome
                    name={error ? 'refresh' : 'download'}
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.primaryButtonText}>
                    {error ? 'Reintentar instalación' : 'Instalar ahora'}
                  </Text>
                </TouchableOpacity>

                {error ? (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onAbrirNavegador}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="external-link" size={14} color={theme.colors.primary} />
                    <Text style={styles.secondaryButtonText}>Descargar desde el navegador</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCerrar}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Más tarde</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginTop: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  notesContainer: {
    maxHeight: 120,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  autoInstallNotice: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.errorSoft,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.error,
    lineHeight: 16,
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primaryLight,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
})
