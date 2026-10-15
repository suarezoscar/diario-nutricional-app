import * as Notifications from 'expo-notifications'
import { COMIDAS } from '../../config/comidas'
import type { HorariosConfig } from '../configService'
import {
  estaComidaAnotada,
  obtenerComidasPendientes,
  formatearListaPendientes,
} from '../../utils/widgetUtils'
import type { ClaveComida, Registro } from '../../types'
import { CANAL_RECORDATORIOS_ID } from './notificationPermisos'

/**
 * Desglosa una cadena "HH:mm" en hora y minuto numéricos.
 *
 * @param horaStr - Cadena en formato "HH:mm".
 * @returns Objeto con hora y minuto validados.
 */
function parsearHoraMinuto(horaStr: string): { hora: number; minuto: number } {
  const [h, m] = (horaStr || '12:00').split(':').map(Number)
  return {
    hora: isNaN(h) ? 12 : Math.max(0, Math.min(23, h)),
    minuto: isNaN(m) ? 0 : Math.max(0, Math.min(59, m)),
  }
}

/**
 * Cancela el recordatorio específico de una comida.
 *
 * @param clave - Clave de la comida (desayuno, almuerzo, etc.).
 */
export async function cancelarRecordatorioComida(clave: ClaveComida): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`recordatorio_comida_${clave}`)
  } catch {
    // Ignorar si no existía
  }
}

/**
 * Cancela todos los recordatorios programados en el sistema.
 */
export async function cancelarTodosLosRecordatorios(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
  } catch (err) {
    console.warn('Error al cancelar recordatorios:', err)
  }
}

/**
 * Programa los recordatorios individuales por cada comida que no haya sido anotada hoy.
 *
 * @param horarios - Configuración de horarios de comidas.
 * @param datosHoy - Registro opcional del día de hoy.
 */
export async function programarRecordatoriosComidas(
  horarios: HorariosConfig,
  datosHoy?: Partial<Registro> | null,
): Promise<void> {
  for (const comida of COMIDAS) {
    const id = `recordatorio_comida_${comida.clave}`
    const anotada = estaComidaAnotada(comida.clave, comida.claveFuera, datosHoy)

    if (anotada) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
      continue
    }

    const { hora, minuto } = parsearHoraMinuto(horarios[comida.clave]?.fin || '12:00')
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `🥗 ¿Olvidaste anotar ${comida.titulo}?`,
        body: `Ha terminado el horario de ${comida.titulo.toLowerCase()}. Toca aquí para registrarla en tu diario.`,
        data: { url: `diarionutricional://comida?clave=${comida.clave}&accion=texto` },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hora,
        minute: minuto,
        channelId: CANAL_RECORDATORIOS_ID,
      },
    })
  }
}

/**
 * Programa el recordatorio resumen al final de la jornada.
 *
 * @param horaFinJornada - Hora en formato "HH:mm".
 * @param datosHoy - Registro opcional del día de hoy.
 */
export async function programarRecordatorioFinJornada(
  horaFinJornada: string,
  datosHoy?: Partial<Registro> | null,
): Promise<void> {
  const id = 'recordatorio_fin_jornada'
  const { hora, minuto } = parsearHoraMinuto(horaFinJornada)
  const pendientes = obtenerComidasPendientes('cena', datosHoy, hora >= 6 ? hora : 22)

  if (pendientes.length === 0) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    return
  }

  const listaTexto = formatearListaPendientes(pendientes)
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: '🌙 Recordatorio: Comidas pendientes de hoy',
      body: `Aún no has anotado: ${listaTexto}. Toca aquí para completar tu diario.`,
      data: { url: 'diarionutricional://hoy' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: CANAL_RECORDATORIOS_ID,
    },
  })
}
