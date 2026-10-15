import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  hoy,
  desplazarDia,
  obtenerMesAnio,
  desplazarMes,
  obtenerDiasMesGrid,
  inicioYFinMesActual,
  type DiaGrid,
} from '../../../utils/fechas'

export interface RangoFechas {
  desde: string
  hasta: string
}

export interface UseCalendarModalParams {
  visible: boolean
  modo: 'single' | 'range'
  fechaSeleccionada?: string
  rangoSeleccionado?: RangoFechas
  onSeleccionarFecha?: (fecha: string) => void
  onSeleccionarRango?: (rango: RangoFechas) => void
  onClose: () => void
}

/**
 * Hook de lógica de negocio y navegación de fechas para CalendarModal.
 *
 * @param params - Configuración del modo (single o range) y callbacks de selección.
 * @returns Datos calculados del grid, mes activo y manejadores de interacción.
 */
export function useCalendarModal({
  visible,
  modo,
  fechaSeleccionada,
  rangoSeleccionado,
  onSeleccionarFecha,
  onSeleccionarRango,
  onClose,
}: UseCalendarModalParams) {
  const fechaHoy = hoy()
  const [fechaMesRef, setFechaMesRef] = useState<Date>(() => new Date())
  const [rangoInterno, setRangoInterno] = useState<RangoFechas>(() => ({
    desde: rangoSeleccionado?.desde || desplazarDia(fechaHoy, -6),
    hasta: rangoSeleccionado?.hasta || fechaHoy,
  }))

  useEffect(() => {
    if (visible) {
      if (modo === 'single' && fechaSeleccionada) {
        try {
          const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number)
          setFechaMesRef(new Date(anio, mes - 1, dia))
        } catch {
          setFechaMesRef(new Date())
        }
      } else if (modo === 'range' && rangoSeleccionado) {
        setRangoInterno(rangoSeleccionado)
        try {
          const [anio, mes, dia] = rangoSeleccionado.hasta.split('-').map(Number)
          setFechaMesRef(new Date(anio, mes - 1, dia))
        } catch {
          setFechaMesRef(new Date())
        }
      }
    }
  }, [visible, modo, fechaSeleccionada, rangoSeleccionado])

  const diasGrid = useMemo(() => obtenerDiasMesGrid(fechaMesRef), [fechaMesRef])
  const mesAnioTexto = useMemo(() => obtenerMesAnio(fechaMesRef), [fechaMesRef])

  const cambiarMes = useCallback((delta: number) => {
    setFechaMesRef(prev => desplazarMes(prev, delta))
  }, [])

  const handlePressDia = useCallback(
    (dia: DiaGrid) => {
      if (modo === 'single') {
        onSeleccionarFecha?.(dia.fecha)
        onClose()
        return
      }

      if (!rangoInterno.desde || (rangoInterno.desde && rangoInterno.hasta)) {
        setRangoInterno({ desde: dia.fecha, hasta: '' })
      } else {
        if (dia.fecha < rangoInterno.desde) {
          setRangoInterno({ desde: dia.fecha, hasta: rangoInterno.desde })
        } else {
          setRangoInterno({ desde: rangoInterno.desde, hasta: dia.fecha })
        }
      }
    },
    [modo, onSeleccionarFecha, onClose, rangoInterno],
  )

  const aplicarPreset = useCallback(
    (diasAtras: number) => {
      setRangoInterno({
        desde: desplazarDia(fechaHoy, -diasAtras + 1),
        hasta: fechaHoy,
      })
    },
    [fechaHoy],
  )

  const aplicarPresetMes = useCallback(() => {
    setRangoInterno(inicioYFinMesActual())
  }, [])

  const handleConfirmarRango = useCallback(() => {
    if (!rangoInterno.desde) return
    onSeleccionarRango?.({
      desde: rangoInterno.desde,
      hasta: rangoInterno.hasta || rangoInterno.desde,
    })
    onClose()
  }, [rangoInterno, onSeleccionarRango, onClose])

  const calcularDiasEnRango = useCallback(() => {
    if (!rangoInterno.desde || !rangoInterno.hasta) return 1
    const d1 = new Date(rangoInterno.desde).getTime()
    const d2 = new Date(rangoInterno.hasta).getTime()
    return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }, [rangoInterno])

  return {
    diasGrid,
    mesAnioTexto,
    rangoInterno,
    cambiarMes,
    handlePressDia,
    aplicarPreset,
    aplicarPresetMes,
    handleConfirmarRango,
    calcularDiasEnRango,
  }
}
