import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  cargarPesos,
  guardarPeso as guardarPesoService,
  borrarPeso as borrarPesoService,
  transformarChartData,
} from '../services/pesoService'
import type { PesosPorFecha, PuntoPeso } from '../types'

/**
 * Estadísticas consolidadas calculadas a partir del histórico de pesos.
 */
export interface EstadisticasPeso {
  ultimoPeso: number
  fechaUltimo: string
  min: number
  max: number
  diferencia: number
}

export function usePesoHistorial(userId: string) {
  const [pesos, setPesos] = useState<PesosPorFecha>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(async () => {
    try {
      setCargando(true)
      const mapa = await cargarPesos(userId)
      setPesos(mapa)
    } catch (err) {
      console.error('Error al cargar pesos:', err)
    } finally {
      setCargando(false)
    }
  }, [userId])

  useEffect(() => {
    recargar()
  }, [recargar])

  const guardar = useCallback(
    async (fecha: string, valor: number) => {
      setGuardando(true)
      try {
        await guardarPesoService(userId, fecha, valor)
        setPesos(prev => ({ ...prev, [fecha]: valor }))
      } finally {
        setGuardando(false)
      }
    },
    [userId],
  )

  const borrar = useCallback(
    async (fecha: string) => {
      setGuardando(true)
      try {
        await borrarPesoService(userId, fecha)
        setPesos(prev => {
          const next = { ...prev }
          delete next[fecha]
          return next
        })
      } finally {
        setGuardando(false)
      }
    },
    [userId],
  )

  const chartData = useMemo<PuntoPeso[]>(() => transformarChartData(pesos), [pesos])

  const estadisticas = useMemo(() => {
    if (chartData.length === 0) return null
    const valores = chartData.map(d => d.peso)
    const ultimo = chartData[chartData.length - 1]
    const primero = chartData[0]
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const diff = +(ultimo.peso - primero.peso).toFixed(2)

    return {
      ultimoPeso: ultimo.peso,
      fechaUltimo: ultimo.fecha,
      min,
      max,
      diferencia: diff,
    }
  }, [chartData])

  return {
    pesos,
    chartData,
    estadisticas,
    cargando,
    guardando,
    guardar,
    borrar,
    recargar,
  }
}
