import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { COMIDAS } from '../config/comidas'
import { cargarConfiguracion, type HorariosConfig, type NotificacionesConfig } from './configService'
import { cargarCacheHoyWidget } from './widgetService'
import { estaComidaAnotada, obtenerComidasPendientes, formatearListaPendientes } from '../utils/widgetUtils'
import type { ClaveComida, Registro } from '../types'

export const CANAL_RECORDATORIOS_ID = 'recordatorios-comidas'

/**
 * Inicializa el canal de notificaciones en Android y el comportamiento de visualización en primer plano.
 */
export async function configurarNotificaciones(): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CANAL_RECORDATORIOS_ID, {
        name: 'Recordatorios de Comidas',
        description: 'Avisos para registrar comidas y resumen de comidas pendientes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1b5e20',
        sound: 'default',
      })
    }
  } catch (err) {
    console.warn('Error al configurar canal de notificaciones:', err)
  }
}

/**
 * Comprueba si la aplicación tiene permiso concedido para emitir notificaciones locales.
 */
export async function verificarPermisoNotificaciones(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

/**
 * Solicita activamente el permiso de notificaciones al usuario si aún no ha sido concedido.
 */
export async function solicitarPermisoNotificaciones(): Promise<boolean> {
  try {
    const { status: existente } = await Notifications.getPermissionsAsync()
    if (existente === 'granted') return true

    const { status: nuevo } = await Notifications.requestPermissionsAsync()
    return nuevo === 'granted'
  } catch (err) {
    console.warn('Error al solicitar permisos de notificaciones:', err)
    return false
  }
}

/**
 * Desglosa una cadena "HH:mm" en hora y minuto numéricos.
 */
function parsearHoraMinuto(horaStr: string): { hora: number; minuto: number } {
  const [h, m] = (horaStr || '12:00').split(':').map(Number)
  return {
    hora: isNaN(h) ? 12 : Math.max(0, Math.min(23, h)),
    minuto: isNaN(m) ? 0 : Math.max(0, Math.min(59, m)),
  }
}

/**
 * Cancela el recordatorio específico de una comida (por ejemplo tras registrarla).
 */
export async function cancelarRecordatorioComida(clave: ClaveComida): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`recordatorio_comida_${clave}`)
  } catch {
    // Ignorar si no estaba programada
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
 * El aviso se programa para dispararse al término del horario de cada comida.
 */
export async function programarRecordatoriosComidas(
  horarios: HorariosConfig,
  datosHoy?: Partial<Registro> | null,
): Promise<void> {
  for (const comida of COMIDAS) {
    const id = `recordatorio_comida_${comida.clave}`
    const anotada = estaComidaAnotada(comida.clave, comida.claveFuera, datosHoy)

    // Si ya está anotada o marcada como fuera de casa hoy, cancelamos el recordatorio
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
 * Avisa indicando exactamente qué comidas faltan por registrar hoy.
 */
export async function programarRecordatorioFinJornada(
  horaFinJornada: string,
  datosHoy?: Partial<Registro> | null,
): Promise<void> {
  const id = 'recordatorio_fin_jornada'
  const pendientes = obtenerComidasPendientes('cena', datosHoy)

  // Si todas las comidas del día están anotadas, cancelamos el aviso para no molestar
  if (pendientes.length === 0) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    return
  }

  const { hora, minuto } = parsearHoraMinuto(horaFinJornada)
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

/**
 * Función central de sincronización:
 * Evalúa la configuración del usuario y el estado de las comidas de hoy,
 * reprogramando o cancelando los recordatorios correspondientes.
 */
export async function sincronizarNotificaciones(
  datosHoyOpcional?: Partial<Registro> | null,
): Promise<void> {
  try {
    const permitido = await verificarPermisoNotificaciones()
    if (!permitido) return

    const cfg = await cargarConfiguracion()
    const datosHoy = datosHoyOpcional ?? (await cargarCacheHoyWidget())

    // 1. Recordatorio por cada comida
    if (cfg.notificaciones.recordatorioComidas) {
      await programarRecordatoriosComidas(cfg.horarios, datosHoy)
    } else {
      for (const comida of COMIDAS) {
        await Notifications.cancelScheduledNotificationAsync(`recordatorio_comida_${comida.clave}`).catch(() => {})
      }
    }

    // 2. Recordatorio fin de jornada
    if (cfg.notificaciones.recordatorioFinJornada) {
      await programarRecordatorioFinJornada(cfg.notificaciones.horaFinJornada, datosHoy)
    } else {
      await Notifications.cancelScheduledNotificationAsync('recordatorio_fin_jornada').catch(() => {})
    }
  } catch (err) {
    console.warn('Error al sincronizar notificaciones:', err)
  }
}

/**
 * Envía una notificación de prueba al instante (1 segundo) para verificar permisos y sonido.
 */
export async function enviarNotificacionPrueba(): Promise<void> {
  const permitido = await solicitarPermisoNotificaciones()
  if (!permitido) {
    throw new Error('Permisos de notificación no concedidos.')
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🥗 Diario Nutricional',
      body: '¡Las notificaciones están funcionando! Toca aquí para abrir tu diario de hoy.',
      data: { url: 'diarionutricional://hoy' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CANAL_RECORDATORIOS_ID,
    },
  })
}
