import React from 'react'
import { Modal, View, Text, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import type { InfoActualizacion } from '../../services/updateService'
import { styles } from './UpdateModal.styles'
import { UpdateProgressBar } from './components/UpdateProgressBar'
import { UpdateActions } from './components/UpdateActions'

export interface UpdateModalProps {
  visible: boolean
  info: InfoActualizacion | null
  descargando: boolean
  progreso: number
  error?: string | null
  onInstalar: () => void
  onCerrar: () => void
  onAbrirNavegador: () => void
}

/**
 * Modal para notificar la disponibilidad de una nueva versión de la aplicación.
 * Muestra notas de la versión, progreso de descarga y opciones de instalación asistida.
 *
 * @param props - Información de versión, progreso de descarga y manejadores de evento.
 * @returns Ventana modal interactiva de actualización.
 */
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
  const { colors } = useTheme()

  if (!visible || !info) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
              <FontAwesome name="arrow-circle-up" size={28} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>Actualización disponible</Text>
              <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{info.versionNueva}</Text>
              </View>
            </View>
          </View>

          {info.notas ? (
            <ScrollView style={[styles.notesContainer, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
              <Text style={[styles.notesLabel, { color: colors.textMuted }]}>Novedades:</Text>
              <Text style={[styles.notesText, { color: colors.text }]}>{info.notas}</Text>
            </ScrollView>
          ) : (
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Hay una nueva versión disponible con mejoras de rendimiento y corrección de errores.
            </Text>
          )}

          {descargando && <UpdateProgressBar progreso={progreso} />}

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorSoft }]}>
              <FontAwesome name="exclamation-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <UpdateActions
            descargando={descargando}
            error={error}
            onInstalar={onInstalar}
            onAbrirNavegador={onAbrirNavegador}
            onCerrar={onCerrar}
          />
        </View>
      </View>
    </Modal>
  )
}
