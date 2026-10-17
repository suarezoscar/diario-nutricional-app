import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { hoy, desplazarDia, obtenerFechaOperativa } from '../utils/fechas'
import { cargarDia, guardarDia } from '../services/registroService'
import { guardarCacheHoyYSincronizarWidget } from '../services/widgetService'
import { sincronizarNotificaciones } from '../services/notificationService'
import type { Registro } from '../types'
import { useDiarioPersistence, type EstadoGuardado } from './useDiarioPersistence'

export type { EstadoGuardado }

/**
 * Custom Hook que encapsula la navegación por días y datos del diario nutricional.
 *
 * @param userId - Identificador único del usuario autenticado.
 * @param fechaInicial - Fecha opcional inicial en formato `YYYY-MM-DD` (por defecto hoy).
 * @returns Objeto con el estado reactivo del diario y manejadores de acción.
 */
export function useDiario(userId: string, fechaInicial?: string) {
  const [fecha, setFecha] = useState<string>(fechaInicial || obtenerFechaOperativa())
  const [datos, setDatos] = useState<Partial<Registro>>({})
  const [datosAnterior, setDatosAnterior] = useState<Partial<Registro>>({})
  const [cargando, setCargando] = useState<boolean>(true)

  const fechaRef = useRef(fecha)
  fechaRef.current = fecha
  const datosRef = useRef(datos)
  datosRef.current = datos
  const fechaDeDatosRef = useRef<string>(fechaInicial || obtenerFechaOperativa())
  const requestIdRef = useRef<number>(0)

  const persistence = useDiarioPersistence(userId)
  const {
    guardando, estadoGuardado, errorGuardado,
    persistirDatos, programarAutoGuardado, flushearCambiosPendientes,
    limpiarTimers, setEstadoGuardado, hayCambiosPendientesRef,
  } = persistence

  const guardar = useCallback(async () => {
    limpiarTimers()
    await persistirDatos(fechaDeDatosRef.current, datosRef.current)
  }, [limpiarTimers, persistirDatos])

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current
    let cancelado = false

    async function cargar() {
      await flushearCambiosPendientes(fechaDeDatosRef.current, datosRef.current)
      if (cancelado || currentRequestId !== requestIdRef.current) return

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

          if (fecha === hoy() || fecha === obtenerFechaOperativa()) {
            void guardarCacheHoyYSincronizarWidget(docNormalizado)
            void sincronizarNotificaciones(docNormalizado)
          }
        }
      } catch (err) {
        if (!cancelado && currentRequestId === requestIdRef.current) {
          console.error('Error al cargar día:', err)
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
      limpiarTimers()
    }
  }, [userId, fecha, flushearCambiosPendientes, setEstadoGuardado, hayCambiosPendientesRef, limpiarTimers])

  useEffect(() => {
    return () => {
      if (hayCambiosPendientesRef.current) {
        void guardarDia(userId, fechaDeDatosRef.current, datosRef.current)
      }
    }
  }, [userId, hayCambiosPendientesRef])

  const cambiarDia = useCallback((delta: number) => setFecha(prev => desplazarDia(prev, delta)), [])
  const irAHoy = useCallback(() => setFecha(obtenerFechaOperativa()), [])
  const establecerFecha = useCallback((nuevaFecha: string) => setFecha(nuevaFecha), [])

  const actualizarCampo = useCallback(
    (campo: keyof Registro, valor: string | boolean) => {
      const fechaObjetivo = fechaDeDatosRef.current
      setDatos(prev => {
        const actualizados: Partial<Registro> = { ...prev, userId, fecha: fechaObjetivo, [campo]: valor }
        datosRef.current = actualizados
        return actualizados
      })
      programarAutoGuardado(fechaObjetivo, datosRef.current)
    },
    [userId, programarAutoGuardado],
  )

  return useMemo(
    () => ({
      fecha, datos, datosAnterior, cargando, guardando, estadoGuardado, errorGuardado,
      cambiarDia, irAHoy, establecerFecha, actualizarCampo, guardar,
    }),
    [
      fecha, datos, datosAnterior, cargando, guardando, estadoGuardado, errorGuardado,
      cambiarDia, irAHoy, establecerFecha, actualizarCampo, guardar,
    ],
  )
}
