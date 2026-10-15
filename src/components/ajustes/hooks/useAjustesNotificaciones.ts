import { useCallback } from 'react'
import { Alert } from 'react-native'
import type { NotificacionesConfig } from '../../../services/configService'
import {
  solicitarPermisoNotificaciones,
  enviarNotificacionPrueba,
} from '../../../services/notificationService'
import { ajustarHora } from '../utils/ajustarHora'

/**
 * Hook auxiliar para gestionar las acciones y permisos de notificaciones en Ajustes.
 *
 * @param notificaciones - Configuración actual de notificaciones.
 * @param persistirNotificaciones - Función para persistir la nueva configuración.
 * @returns Manejadores para activar/desactivar recordatorios y probar alertas.
 */
export function useAjustesNotificaciones(
  notificaciones: NotificacionesConfig,
  persistirNotificaciones: (nuevas: NotificacionesConfig) => Promise<void>,
) {
  const toggleRecordatorioComidas = useCallback(async () => {
    if (!notificaciones.recordatorioComidas) {
      const permitido = await solicitarPermisoNotificaciones()
      if (!permitido) {
        Alert.alert(
          'Permiso de notificaciones',
          'Para recibir recordatorios debes activar las notificaciones en los ajustes del dispositivo.',
          [{ text: 'Entendido' }],
        )
        return
      }
      await persistirNotificaciones({ ...notificaciones, recordatorioComidas: true })
    } else {
      await persistirNotificaciones({ ...notificaciones, recordatorioComidas: false })
    }
  }, [notificaciones, persistirNotificaciones])

  const toggleRecordatorioFinJornada = useCallback(async () => {
    if (!notificaciones.recordatorioFinJornada) {
      const permitido = await solicitarPermisoNotificaciones()
      if (!permitido) {
        Alert.alert(
          'Permiso de notificaciones',
          'Para recibir recordatorios debes activar las notificaciones en los ajustes del dispositivo.',
          [{ text: 'Entendido' }],
        )
        return
      }
      await persistirNotificaciones({ ...notificaciones, recordatorioFinJornada: true })
    } else {
      await persistirNotificaciones({ ...notificaciones, recordatorioFinJornada: false })
    }
  }, [notificaciones, persistirNotificaciones])

  const modificarHoraFinJornada = useCallback((delta: number) => {
    const actual = notificaciones.horaFinJornada || '22:00'
    const nuevaHora = ajustarHora(actual, delta)
    void persistirNotificaciones({ ...notificaciones, horaFinJornada: nuevaHora })
  }, [notificaciones, persistirNotificaciones])

  const handleProbarNotificacion = useCallback(async () => {
    try {
      await enviarNotificacionPrueba()
      Alert.alert(
        'Notificación enviada',
        'La notificación aparecerá en tu teléfono en un instante. Púlsala para comprobar que abre el día de hoy.',
        [{ text: 'Genial' }],
      )
    } catch {
      Alert.alert(
        'Permiso denegado',
        'No se pudo enviar la notificación. Asegúrate de permitir las notificaciones en los ajustes de tu teléfono.',
      )
    }
  }, [])

  return {
    toggleRecordatorioComidas,
    toggleRecordatorioFinJornada,
    modificarHoraFinJornada,
    handleProbarNotificacion,
  }
}
