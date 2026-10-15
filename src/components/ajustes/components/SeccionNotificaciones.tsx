import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import type { NotificacionesConfig } from '../../../services/configService'
import { styles } from '../AjustesView.styles'
import { NotifOpcionItem } from './NotifOpcionItem'

export interface SeccionNotificacionesProps {
  notificaciones: NotificacionesConfig
  onToggleComidas: () => void
  onToggleFinJornada: () => void
  onModificarHoraFin: (delta: number) => void
  onProbarNotificacion: () => void
}

/**
 * Sección para la configuración y prueba de recordatorios de comidas y fin de jornada.
 *
 * @param props - Configuración de notificaciones y manejadores para alternar avisos y horas.
 * @returns Tarjeta de ajustes con opciones de avisos y stepper de horario.
 */
export const SeccionNotificaciones: React.FC<SeccionNotificacionesProps> = React.memo(({
  notificaciones,
  onToggleComidas,
  onToggleFinJornada,
  onModificarHoraFin,
  onProbarNotificacion,
}) => {
  const { colors } = useTheme()
  const algunaActiva = notificaciones.recordatorioComidas || notificaciones.recordatorioFinJornada

  return (
    <Card>
      <View style={styles.cardHeaderBetween}>
        <View style={styles.cardHeader}>
          <FontAwesome name="bell-o" size={16} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Notificaciones</Text>
        </View>
        <View
          style={[
            styles.badgeEstadoNotif,
            algunaActiva
              ? { backgroundColor: colors.primarySoft }
              : { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.badgeEstadoNotifText,
              algunaActiva ? { color: colors.primary } : { color: colors.textMuted },
            ]}
          >
            {algunaActiva ? 'Activas' : 'Desactivadas'}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
        Programa recordatorios locales en tu móvil para registrar comidas a tiempo o al finalizar tu día.
      </Text>

      <NotifOpcionItem
        titulo="Avisar al terminar cada comida"
        descripcion="Te avisa al finalizar el horario si aún no la has anotado."
        activo={notificaciones.recordatorioComidas}
        onToggle={onToggleComidas}
        accessibilityLabel="Alternar recordatorio de fin de comida"
      />

      <NotifOpcionItem
        titulo="Resumen al final de la jornada"
        descripcion="Aviso con la lista de comidas pendientes hoy."
        activo={notificaciones.recordatorioFinJornada}
        onToggle={onToggleFinJornada}
        accessibilityLabel="Alternar recordatorio de fin de jornada"
      />

      {notificaciones.recordatorioFinJornada && (
        <View style={[styles.horaFinRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.horaFinLabelWrap}>
            <FontAwesome name="moon-o" size={13} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.horaFinLabel, { color: colors.text }]}>Hora del aviso final:</Text>
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => onModificarHoraFin(-30)}
              accessibilityRole="button"
              accessibilityLabel="Restar 30 minutos a la hora del aviso final"
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {notificaciones.horaFinJornada || '22:00'}
            </Text>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => onModificarHoraFin(30)}
              accessibilityRole="button"
              accessibilityLabel="Sumar 30 minutos a la hora del aviso final"
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.testNotifBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        onPress={onProbarNotificacion}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Enviar notificación de prueba ahora"
      >
        <FontAwesome name="paper-plane-o" size={12} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[styles.testNotifBtnText, { color: colors.primary }]}>
          Enviar notificación de prueba ahora
        </Text>
      </TouchableOpacity>
    </Card>
  )
})
