import { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native'
import {
  cargarConfiguracion,
  guardarConfiguracion,
  HORARIOS_POR_DEFECTO,
  CONFIGURACION_POR_DEFECTO,
  type HorariosConfig,
  type NotificacionesConfig,
} from '../../../services/configService'
import {
  solicitarPermisoNotificaciones,
  sincronizarNotificaciones,
  enviarNotificacionPrueba,
} from '../../../services/notificationService'
import type { ClaveComida } from '../../../types'

/**
 * Ajusta una cadena de hora "HH:mm" sumando o restando minutos (en pasos de 15 o 30 min).
 *
 * @param horaStr - Hora en formato "HH:mm".
 * @param deltaMinutos - Minutos a sumar o restar.
 * @returns Cadena con la nueva hora formateada "HH:mm".
 */
export function ajustarHora(horaStr: string, deltaMinutos: number): string {
  const [h, m] = horaStr.split(':').map(Number)
  let total = ((h || 0) * 60 + (m || 0) + deltaMinutos) % (24 * 60)
  if (total < 0) total += 24 * 60
  const nuevoH = Math.floor(total / 60)
  const nuevoM = total % 60
  return `${nuevoH.toString().padStart(2, '0')}:${nuevoM.toString().padStart(2, '0')}`
}

/**
 * Custom Hook que encapsula la lógica de negocio y persistencia de Ajustes.
 *
 * @returns Objeto con el estado reactivo de configuración y manejadores de acción.
 */
export function useAjustes() {
  const [horarios, setHorarios] = useState<HorariosConfig>(HORARIOS_POR_DEFECTO)
  const [notificaciones, setNotificaciones] = useState<NotificacionesConfig>(
    CONFIGURACION_POR_DEFECTO.notificaciones,
  )
  const [guardadoFeedback, setGuardadoFeedback] = useState(false)

  useEffect(() => {
    async function inicializar() {
      const cfg = await cargarConfiguracion()
      setHorarios(cfg.horarios)
      setNotificaciones(cfg.notificaciones)
    }
    void inicializar()
  }, [])

  const persistirHorarios = useCallback(async (nuevos: HorariosConfig) => {
    setHorarios(nuevos)
    const cfg = await cargarConfiguracion()
    await guardarConfiguracion({ ...cfg, horarios: nuevos })
    await sincronizarNotificaciones()
    setGuardadoFeedback(true)
    setTimeout(() => setGuardadoFeedback(false), 2000)
  }, [])

  const persistirNotificaciones = useCallback(async (nuevas: NotificacionesConfig) => {
    setNotificaciones(nuevas)
    const cfg = await cargarConfiguracion()
    await guardarConfiguracion({ ...cfg, notificaciones: nuevas })
    await sincronizarNotificaciones()
    setGuardadoFeedback(true)
    setTimeout(() => setGuardadoFeedback(false), 2000)
  }, [])

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

  const modificarHorario = useCallback((comida: ClaveComida, campo: 'inicio' | 'fin', delta: number) => {
    const actual = horarios[comida][campo]
    const nuevaHora = ajustarHora(actual, delta)
    const nuevos: HorariosConfig = {
      ...horarios,
      [comida]: { ...horarios[comida], [campo]: nuevaHora },
    }
    void persistirHorarios(nuevos)
  }, [horarios, persistirHorarios])

  const restablecerValoresPorDefecto = useCallback(() => {
    Alert.alert(
      'Restablecer horarios',
      '¿Deseas volver a los horarios recomendados por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => void persistirHorarios(HORARIOS_POR_DEFECTO),
        },
      ],
    )
  }, [persistirHorarios])

  return {
    horarios,
    notificaciones,
    guardadoFeedback,
    toggleRecordatorioComidas,
    toggleRecordatorioFinJornada,
    modificarHoraFinJornada,
    handleProbarNotificacion,
    modificarHorario,
    restablecerValoresPorDefecto,
  }
}
