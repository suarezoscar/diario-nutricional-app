import { useState, useCallback, useRef } from 'react'
import { guardarDia } from '../services/registroService'
import { guardarCacheHoyYSincronizarWidget } from '../services/widgetService'
import { sincronizarNotificaciones } from '../services/notificationService'
import { hoy } from '../utils/fechas'
import type { Registro } from '../types'

/**
 * Estado del ciclo de guardado en segundo plano.
 */
export type EstadoGuardado = 'al_dia' | 'guardando' | 'guardado' | 'error'

/**
 * Custom Hook que encapsula la persistencia, autoguardado debounced y sincronización
 * del diario nutricional.
 *
 * @param userId - Identificador único del usuario autenticado.
 * @returns Estado de guardado y funciones de persistencia.
 */
export function useDiarioPersistence(userId: string) {
  const [guardando, setGuardando] = useState<boolean>(false)
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('al_dia')
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const hayCambiosPendientesRef = useRef(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetEstadoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistirDatos = useCallback(
    async (fechaDestino: string, datosAGuardar: Partial<Registro>) => {
      if (!fechaDestino) return

      setGuardando(true)
      setEstadoGuardado('guardando')
      setErrorGuardado(null)

      try {
        await guardarDia(userId, fechaDestino, datosAGuardar)
        hayCambiosPendientesRef.current = false
        setEstadoGuardado('guardado')

        if (fechaDestino === hoy()) {
          void guardarCacheHoyYSincronizarWidget(datosAGuardar)
          void sincronizarNotificaciones(datosAGuardar)
        }

        if (resetEstadoTimerRef.current) clearTimeout(resetEstadoTimerRef.current)
        resetEstadoTimerRef.current = setTimeout(() => {
          setEstadoGuardado('al_dia')
        }, 2500)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al guardar cambios'
        setErrorGuardado(msg)
        setEstadoGuardado('error')
        console.error('Error al autoguardar día:', err)
      } finally {
        setGuardando(false)
      }
    },
    [userId],
  )

  const guardar = useCallback(
    async (fecha: string, datos: Partial<Registro>) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      await persistirDatos(fecha, datos)
    },
    [persistirDatos],
  )

  const programarAutoGuardado = useCallback(
    (fecha: string, datos: Partial<Registro>) => {
      hayCambiosPendientesRef.current = true
      setEstadoGuardado('guardando')

      if (resetEstadoTimerRef.current) {
        clearTimeout(resetEstadoTimerRef.current)
        resetEstadoTimerRef.current = null
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        void persistirDatos(fecha, datos)
      }, 1200)
    },
    [persistirDatos],
  )

  const flushearCambiosPendientes = useCallback(
    async (fecha: string, datos: Partial<Registro>) => {
      if (hayCambiosPendientesRef.current) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
          autoSaveTimerRef.current = null
        }
        hayCambiosPendientesRef.current = false
        try {
          await persistirDatos(fecha, datos)
        } catch (e) {
          console.error('Error al vaciar cambios pendientes:', e)
        }
      }
    },
    [persistirDatos],
  )

  const limpiarTimers = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    if (resetEstadoTimerRef.current) {
      clearTimeout(resetEstadoTimerRef.current)
      resetEstadoTimerRef.current = null
    }
  }, [])

  return {
    guardando,
    estadoGuardado,
    setEstadoGuardado,
    errorGuardado,
    hayCambiosPendientesRef,
    persistirDatos,
    guardar,
    programarAutoGuardado,
    flushearCambiosPendientes,
    limpiarTimers,
  }
}
