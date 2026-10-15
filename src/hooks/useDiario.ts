import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { hoy, desplazarDia } from '../utils/fechas'
import { cargarDia, guardarDia } from '../services/registroService'
import { guardarCacheHoyYSincronizarWidget } from '../services/widgetService'
import { sincronizarNotificaciones } from '../services/notificationService'
import type { Registro } from '../types'

/**
 * Estado del ciclo de guardado en segundo plano.
 */
export type EstadoGuardado = 'al_dia' | 'guardando' | 'guardado' | 'error'

/**
 * Custom Hook que encapsula la lógica de negocio completa del diario nutricional:
 * - Carga asíncrona del día actual y día anterior para comparativa.
 * - Autoguardado debounced (1200ms) al escribir en cualquier campo.
 * - Vaciado forzado (*auto-flush*) de cambios pendientes antes de cambiar de fecha o desmontar,
 *   garantizando que nunca se guarden datos de un día en la fecha de otro.
 * - Control de peticiones concurrentes (requestId) para prevenir que el skeleton quede bloqueado.
 * - Transición de días fluida (`cambiarDia`, `irAHoy`, `establecerFecha`).
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

  const fechaRef = useRef(fecha)
  fechaRef.current = fecha

  const datosRef = useRef(datos)
  datosRef.current = datos

  // fechaDeDatosRef almacena de forma determinista a qué fecha corresponden EXACTAMENTE
  // los datos que residen en datosRef.current. Esto previene que se guarden datos del día A
  // en el documento del día B durante transiciones rápidas de fecha o autoguardados pendientes.
  const fechaDeDatosRef = useRef<string>(fechaInicial || hoy())

  const hayCambiosPendientesRef = useRef(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetEstadoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef<number>(0)

  // Función interna para persistir en Firestore
  const persistirDatos = useCallback(
    async (fechaDestino: string, datosAGuardar: Partial<Registro>) => {
      if (!fechaDestino) return

      setGuardando(true)
      setEstadoGuardado('guardando')
      setErrorGuardado(null)

      try {
        await guardarDia(userId, fechaDestino, datosAGuardar)
        if (fechaDeDatosRef.current === fechaDestino) {
          hayCambiosPendientesRef.current = false
        }
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

  // Guardado manual explícito
  const guardar = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    await persistirDatos(fechaDeDatosRef.current, datosRef.current)
  }, [persistirDatos])

  // Cargar registro y día anterior al cambiar de fecha
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current
    let cancelado = false

    async function cargar() {
      // 1. Si había cambios pendientes del día que se estaba editando, vaciarlos de forma segura
      // guardando estrictamente en la fecha que le corresponde a dichos datos (fechaDeDatosRef.current).
      if (hayCambiosPendientesRef.current) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
          autoSaveTimerRef.current = null
        }
        const fechaAFlushear = fechaDeDatosRef.current
        const datosAFlushear = datosRef.current
        hayCambiosPendientesRef.current = false
        try {
          await persistirDatos(fechaAFlushear, datosAFlushear)
        } catch (e) {
          console.error('Error al vaciar cambios pendientes al cambiar de fecha:', e)
        }
      }

      // Si durante el guardado anterior se disparó otra navegación, abortar este flujo desfasado
      if (cancelado || currentRequestId !== requestIdRef.current) {
        return
      }

      setCargando(true)

      try {
        const diaPrev = desplazarDia(fecha, -1)
        const [doc, docAnt] = await Promise.all([
          cargarDia(userId, fecha),
          cargarDia(userId, diaPrev),
        ])

        if (!cancelado && currentRequestId === requestIdRef.current) {
          const docNormalizado: Partial<Registro> = { ...doc, userId, fecha }
          fechaDeDatosRef.current = fecha
          datosRef.current = docNormalizado
          setDatos(docNormalizado)
          setDatosAnterior(docAnt)
          hayCambiosPendientesRef.current = false
          setEstadoGuardado('al_dia')

          if (fecha === hoy()) {
            void guardarCacheHoyYSincronizarWidget(docNormalizado)
            void sincronizarNotificaciones(docNormalizado)
          }
        }
      } catch (err) {
        if (!cancelado && currentRequestId === requestIdRef.current) {
          console.error('Error al cargar día:', err)
          // Fallback seguro con registro vacío para la fecha solicitada para evitar que la UI quede congelada
          const docFallback: Partial<Registro> = { userId, fecha }
          fechaDeDatosRef.current = fecha
          datosRef.current = docFallback
          setDatos(docFallback)
          setDatosAnterior({})
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => {
      cancelado = true
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      if (resetEstadoTimerRef.current) {
        clearTimeout(resetEstadoTimerRef.current)
        resetEstadoTimerRef.current = null
      }
    }
  }, [userId, fecha, persistirDatos])

  // Guardar cambios pendientes al desmontar el hook (ej: cambiar de pestaña en navegación)
  useEffect(() => {
    return () => {
      if (hayCambiosPendientesRef.current) {
        void guardarDia(userId, fechaDeDatosRef.current, datosRef.current)
      }
    }
  }, [userId])

  const cambiarDia = useCallback((delta: number) => {
    setFecha(prev => desplazarDia(prev, delta))
  }, [])

  const irAHoy = useCallback(() => {
    setFecha(hoy())
  }, [])

  const establecerFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha)
  }, [])

  const actualizarCampo = useCallback(
    (campo: keyof Registro, valor: string | boolean) => {
      const fechaObjetivo = fechaDeDatosRef.current
      setDatos(prev => {
        const actualizados: Partial<Registro> = {
          ...prev,
          userId,
          fecha: fechaObjetivo,
          [campo]: valor,
        }
        datosRef.current = actualizados
        return actualizados
      })

      hayCambiosPendientesRef.current = true
      setEstadoGuardado('guardando')

      if (resetEstadoTimerRef.current) {
        clearTimeout(resetEstadoTimerRef.current)
        resetEstadoTimerRef.current = null
      }

      // Disparar guardado automático tras 1200ms de inactividad
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        void persistirDatos(fechaObjetivo, datosRef.current)
      }, 1200)
    },
    [userId, persistirDatos],
  )

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  )
}
