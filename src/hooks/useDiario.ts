import { useState, useEffect, useCallback, useRef } from 'react'
import { hoy, desplazarDia } from '../utils/fechas'
import { cargarDia, guardarDia } from '../services/registroService'
import type { Registro } from '../types'

export function useDiario(userId: string) {
  const [fecha, setFecha] = useState<string>(hoy())
  const [datos, setDatos] = useState<Partial<Registro>>({})
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const datosRef = useRef(datos)
  datosRef.current = datos

  // Cargar registro al cambiar de fecha
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setCargando(true)
      try {
        const doc = await cargarDia(userId, fecha)
        if (!cancelado) {
          setDatos(doc)
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

  return {
    fecha,
    datos,
    cargando,
    guardando,
    errorGuardado,
    cambiarDia,
    irAHoy,
    actualizarCampo,
    guardar,
  }
}
