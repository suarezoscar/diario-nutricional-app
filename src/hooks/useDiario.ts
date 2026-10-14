import { useState, useEffect, useCallback, useRef } from 'react'
import { hoy, desplazarDia } from '../utils/fechas'
import { cargarDia, guardarDia } from '../services/registroService'
import type { Registro } from '../types'

/**
 * Estado del ciclo de guardado en segundo plano.
 */
export type EstadoGuardado = 'al_dia' | 'guardando' | 'guardado' | 'error'

/**
 * Custom Hook que encapsula la lógica de negocio completa del diario nutricional:
 * - Carga asíncrona del día actual y día anterior para comparativa.
 * - Autoguardado debounced (1200ms) al escribir en cualquier campo.
 * - Vaciado forzado (*auto-flush*) de cambios pendientes antes de cambiar de fecha o desmontar.
 * - Transición de días (`cambiarDia`, `irAHoy`, `establecerFecha`).
 *
 * @param userId - Identificador único del usuario autenticado.
 * @param fechaInicial - Fecha opcional inicial en formato `YYYY-MM-DD` (por defecto hoy).
 * @returns Objeto con el estado reactivo del diario y manejadores de acción.
 */
export function useDiario(userId: string, fechaInicial?: string) {
  const [fecha, setFecha] = useState<string>(fechaInicial || hoy())
  const [datos, setDatos] = useState<Partial<Registro>>({})
  const [datosAnterior, setDatosAnterior] = useState<Partial<Registro>>({})
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('al_dia')
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const datosRef = useRef(datos)
  datosRef.current = datos

  const fechaRef = useRef(fecha)
  fechaRef.current = fecha

  const hayCambiosPendientesRef = useRef(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetEstadoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Función interna para persistir en Firestore
  const persistirDatos = useCallback(
    async (fechaDestino: string, datosAGuardar: Partial<Registro>) => {
      setGuardando(true)
      setEstadoGuardado('guardando')
      setErrorGuardado(null)

      try {
        await guardarDia(userId, fechaDestino, datosAGuardar)
        hayCambiosPendientesRef.current = false
        setEstadoGuardado('guardado')

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

  // Guardado manual explícito
  const guardar = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    await persistirDatos(fechaRef.current, datosRef.current)
  }, [persistirDatos])

  // Cargar registro y día anterior al cambiar de fecha
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      // Si había cambios pendientes del día anterior, guardarlos antes de cargar el nuevo día
      if (hayCambiosPendientesRef.current) {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        await persistirDatos(fechaRef.current, datosRef.current)
      }

      setCargando(true)
      try {
        const diaPrev = desplazarDia(fecha, -1)
        const [doc, docAnt] = await Promise.all([
          cargarDia(userId, fecha),
          cargarDia(userId, diaPrev),
        ])
        if (!cancelado) {
          setDatos(doc)
          setDatosAnterior(docAnt)
          hayCambiosPendientesRef.current = false
          setEstadoGuardado('al_dia')
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar día:', err)
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
      // Limpiar timers en desmontaje o cambio de fecha
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      if (resetEstadoTimerRef.current) clearTimeout(resetEstadoTimerRef.current)
    }
  }, [userId, fecha, persistirDatos])

  // Guardar cambios pendientes al desmontar el hook (ej: cambiar de pestaña)
  useEffect(() => {
    return () => {
      if (hayCambiosPendientesRef.current) {
        void guardarDia(userId, fechaRef.current, datosRef.current)
      }
    }
  }, [userId])

  const cambiarDia = useCallback(
    async (delta: number) => {
      if (hayCambiosPendientesRef.current) {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        await persistirDatos(fechaRef.current, datosRef.current)
      }
      setFecha(prev => desplazarDia(prev, delta))
    },
    [persistirDatos],
  )

  const irAHoy = useCallback(async () => {
    if (hayCambiosPendientesRef.current) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      await persistirDatos(fechaRef.current, datosRef.current)
    }
    setFecha(hoy())
  }, [persistirDatos])

  const establecerFecha = useCallback(
    async (nuevaFecha: string) => {
      if (hayCambiosPendientesRef.current) {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        await persistirDatos(fechaRef.current, datosRef.current)
      }
      setFecha(nuevaFecha)
    },
    [persistirDatos],
  )

  const actualizarCampo = useCallback(
    (campo: keyof Registro, valor: string | boolean) => {
      setDatos(prev => {
        const actualizados = {
          ...prev,
          [campo]: valor,
        }
        datosRef.current = actualizados
        return actualizados
      })

      hayCambiosPendientesRef.current = true
      setEstadoGuardado('guardando')

      // Disparar guardado automático tras 1200ms de inactividad
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        void persistirDatos(fechaRef.current, datosRef.current)
      }, 1200)
    },
    [persistirDatos],
  )

  return {
    fecha,
    datos,
    datosAnterior,
    cargando,
    guardando,
    estadoGuardado,
    errorGuardado,
    cambiarDia,
    irAHoy,
    establecerFecha,
    actualizarCampo,
    guardar,
  }
}
