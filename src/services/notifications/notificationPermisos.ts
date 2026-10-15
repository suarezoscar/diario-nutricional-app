import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

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
 *
 * @returns Booleano indicando si el permiso está concedido.
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
 *
 * @returns Booleano indicando si el permiso fue concedido.
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
