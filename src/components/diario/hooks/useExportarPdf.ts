import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { hoy, desplazarDia, inicioYFinMesActual } from '../../../utils/fechas'
import { exportarPDFPorRango, imprimirPDFPorRango } from '../../../services/pdfService'

export interface UseExportarPdfParams {
  userId: string
  nombreUsuario: string
  rangoInicial?: { desde: string; hasta: string }
  onClose: () => void
}

/**
 * Hook para la gestión del modal de exportación a PDF.
 * Controla el rango de fechas a exportar, presets rápidos y la invocación
 * a los servicios de impresión y compartición de documentos.
 *
 * @param params - Identificador de usuario, nombre, rango inicial y callback de cierre.
 * @returns Estados del rango, indicadores de generación y manejadores de acción.
 */
export function useExportarPdf({
  userId,
  nombreUsuario,
  rangoInicial,
  onClose,
}: UseExportarPdfParams) {
  const fechaHoy = hoy()
  const [desde, setDesde] = useState(rangoInicial?.desde || desplazarDia(fechaHoy, -6))
  const [hasta, setHasta] = useState(rangoInicial?.hasta || fechaHoy)
  const [generando, setGenerando] = useState<'imprimir' | 'compartir' | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  const aplicarRangoRapido = useCallback((diasAtras: number) => {
    setDesde(desplazarDia(fechaHoy, -diasAtras + 1))
    setHasta(fechaHoy)
  }, [fechaHoy])

  const aplicarMesActual = useCallback(() => {
    const rangoMes = inicioYFinMesActual()
    setDesde(rangoMes.desde)
    setHasta(rangoMes.hasta)
  }, [])

  const calcularDias = useCallback(() => {
    if (!desde || !hasta) return 1
    const d1 = new Date(desde).getTime()
    const d2 = new Date(hasta).getTime()
    return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }, [desde, hasta])

  const handleAccion = useCallback(async (accion: 'imprimir' | 'compartir') => {
    if (!desde || !hasta) {
      Alert.alert('Fechas requeridas', 'Por favor selecciona un rango de fechas.')
      return
    }

    if (desde > hasta) {
      Alert.alert('Rango inválido', 'La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    setGenerando(accion)
    try {
      if (accion === 'imprimir') {
        await imprimirPDFPorRango({
          userId,
          nombre: nombreUsuario,
          desde,
          hasta,
        })
      } else {
        await exportarPDFPorRango({
          userId,
          nombre: nombreUsuario,
          desde,
          hasta,
        })
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el PDF'
      Alert.alert(accion === 'imprimir' ? 'Error al imprimir' : 'Error al exportar', msg)
    } finally {
      setGenerando(null)
    }
  }, [desde, hasta, userId, nombreUsuario, onClose])

  const handleSeleccionarRango = useCallback((r: { desde: string; hasta: string }) => {
    setDesde(r.desde)
    setHasta(r.hasta)
  }, [])

  return {
    desde,
    hasta,
    generando,
    showCalendar,
    setShowCalendar,
    aplicarRangoRapido,
    aplicarMesActual,
    calcularDias,
    handleAccion,
    handleSeleccionarRango,
  }
}
