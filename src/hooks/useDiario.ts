import { useState, useEffect, useCallback, useRef } from 'react'
import { hoy, desplazarDia } from '../utils/fechas'
import { cargarDia, guardarDia } from '../services/registroService'
import type { Registro } from '../types'

export function useDiario(userId: string, fechaInicial?: string) {
  const [fecha, setFecha] = useState<string>(fechaInicial || hoy())
  const [datos, setDatos] = useState<Partial<Registro>>({})
  const [datosAnterior, setDatosAnterior] = useState<Partial<Registro>>({})
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const datosRef = useRef(datos)
  datosRef.current = datos

  // Cargar registro y día anterior al cambiar de fecha
  useEffect(() => {
    let cancelado = false
    async function cargar() {
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
    }
  }, [userId, fecha])

  const cambiarDia = useCallback((delta: number) => {
    setFecha(prev => desplazarDia(prev, delta))
  }, [])

  const irAHoy = useCallback(() => {
    setFecha(hoy())
  }, [])

  const actualizarCampo = useCallback(
    (campo: keyof Registro, valor: string | boolean) => {
      setDatos(prev => ({
        ...prev,
        [campo]: valor,
      }))
    },
    [],
  )

  const guardar = useCallback(async () => {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      await guardarDia(userId, fecha, datosRef.current)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      setErrorGuardado(msg)
      console.error(msg)
    } finally {
      setGuardando(false)
    }
  }, [userId, fecha])

  const establecerFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha)
  }, [])

  return {
    fecha,
    datos,
    datosAnterior,
    cargando,
    guardando,
    errorGuardado,
    cambiarDia,
    irAHoy,
    establecerFecha,
    actualizarCampo,
    guardar,
  }
}
