import { useState, useEffect, useCallback, useMemo } from 'react'
import { hoy, desplazarDia, generarDiasRango } from '../utils/fechas'
import { cargarRango } from '../services/registroService'
import type { Registro } from '../types'

export interface DiaRangoResumen {
  key: string
  fecha: string
  datos: Partial<Registro>
}

export function useHistorico(userId: string) {
  const [hasta, setHasta] = useState<string>(hoy())
  const [desde, setDesde] = useState<string>(() => desplazarDia(hoy(), -13))
  const [registros, setRegistros] = useState<Record<string, Registro>>({})
  const [cargando, setCargando] = useState(false)

  const recargar = useCallback(async () => {
    if (desde > hasta) return
    setCargando(true)
    try {
      const mapa = await cargarRango(userId, desde, hasta)
      setRegistros(mapa)
    } catch (err) {
      console.error('Error al cargar rango histórico:', err)
    } finally {
      setCargando(false)
    }
  }, [userId, desde, hasta])

  useEffect(() => {
    recargar()
  }, [recargar])

  const establecerPreset = useCallback((dias: number) => {
    const fHasta = hoy()
    const fDesde = desplazarDia(fHasta, -(dias - 1))
    setHasta(fHasta)
    setDesde(fDesde)
  }, [])

  const dias = useMemo<DiaRangoResumen[]>(() => {
    const fechas = generarDiasRango(desde, hasta)
    return fechas.map((f: string) => ({
      key: f,
      fecha: f,
      datos: registros[f] || {},
    }))
  }, [desde, hasta, registros])

  const metricas = useMemo(() => {
    let diasConDatos = 0
    let sumaAgua = 0
    let diasConAgua = 0
    let comidasFuera = 0

    dias.forEach(d => {
      const r = d.datos
      const tieneAlgo =
        !!r.desayuno ||
        !!r.mediaManana ||
        !!r.comida ||
        !!r.merienda ||
        !!r.cena ||
        !!r.agua ||
        !!r.peso

      if (tieneAlgo) diasConDatos++

      if (r.agua) {
        const l = parseFloat(r.agua)
        if (!isNaN(l) && l > 0) {
          sumaAgua += l
          diasConAgua++
        }
      }

      if (r.desayunoFuera) comidasFuera++
      if (r.mediaMananaFuera) comidasFuera++
      if (r.comidaFuera) comidasFuera++
      if (r.meriendaFuera) comidasFuera++
      if (r.cenaFuera) comidasFuera++
    })

    const mediaAgua = diasConAgua > 0 ? +(sumaAgua / diasConAgua).toFixed(2) : 0

    return {
      totalDias: dias.length,
      diasConDatos,
      mediaAgua,
      comidasFuera,
    }
  }, [dias])

  return {
    desde,
    hasta,
    setDesde,
    setHasta,
    establecerPreset,
    dias,
    metricas,
    cargando,
    recargar,
  }
}
