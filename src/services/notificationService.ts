import * as Notifications from 'expo-notifications'
import { COMIDAS } from '../config/comidas'
import { cargarConfiguracion } from './configService'
import { cargarCacheHoyWidget } from './widgetService'
import type { Registro } from '../types'
import {
  verificarPermisoNotificaciones,
  configurarNotificaciones,
  solicitarPermisoNotificaciones,
  enviarNotificacionPrueba,
  CANAL_RECORDATORIOS_ID,
} from './notifications/notificationPermisos'
import {
  cancelarRecordatorioComida,
  cancelarTodosLosRecordatorios,
  programarRecordatoriosComidas,
  programarRecordatorioFinJornada,
} from './notifications/notificationProgramacion'

export {
  CANAL_RECORDATORIOS_ID,
  configurarNotificaciones,
  verificarPermisoNotificaciones,
  solicitarPermisoNotificaciones,
  enviarNotificacionPrueba,
  cancelarRecordatorioComida,
  cancelarTodosLosRecordatorios,
  programarRecordatoriosComidas,
  programarRecordatorioFinJornada,
}

/**
 * Función central de sincronización:
 * Evalúa la configuración del usuario y el estado de las comidas de hoy,
 * reprogramando o cancelando los recordatorios correspondientes.
 *
 * @param datosHoyOpcional - Datos del registro de hoy si ya se conocen en memoria.
 */
export async function sincronizarNotificaciones(
  datosHoyOpcional?: Partial<Registro> | null,
): Promise<void> {
  try {
    const permitido = await verificarPermisoNotificaciones()
    if (!permitido) return

    const cfg = await cargarConfiguracion()
    const datosHoy = datosHoyOpcional ?? (await cargarCacheHoyWidget())

    if (cfg.notificaciones.recordatorioComidas) {
      await programarRecordatoriosComidas(cfg.horarios, datosHoy)
    } else {
      for (const comida of COMIDAS) {
        await Notifications.cancelScheduledNotificationAsync(`recordatorio_comida_${comida.clave}`).catch(() => {})
      }
    }

    if (cfg.notificaciones.recordatorioFinJornada) {
      await programarRecordatorioFinJornada(cfg.notificaciones.horaFinJornada, datosHoy)
    } else {
      await Notifications.cancelScheduledNotificationAsync('recordatorio_fin_jornada').catch(() => {})
    }
  } catch (err) {
    console.warn('Error al sincronizar notificaciones:', err)
  }
}
