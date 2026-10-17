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
import { sincronizarNotificaciones } from '../../../services/notificationService'
import type { ClaveComida } from '../../../types'
import { ajustarHora } from '../utils/ajustarHora'
import { validarCambioHorario } from '../utils/validarHorarios'
import { useAjustesNotificaciones } from './useAjustesNotificaciones'

export { ajustarHora }

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

  const notifActions = useAjustesNotificaciones(notificaciones, persistirNotificaciones)

  const modificarHorario = useCallback((comida: ClaveComida, campo: 'inicio' | 'fin', delta: number) => {
    const actual = horarios[comida][campo]
    const nuevaHora = ajustarHora(actual, delta)

    const validacion = validarCambioHorario(comida, campo, nuevaHora, horarios)
    if (!validacion.esValido) {
      if (validacion.error) {
        Alert.alert('Horario no permitido', validacion.error)
      }
      return
    }

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
    ...notifActions,
    modificarHorario,
    restablecerValoresPorDefecto,
  }
}
