import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns'
import { hoy } from './operaciones'

export interface DiaGrid {
  fecha: string
  numero: number
  enMesActual: boolean
  esHoy: boolean
}

/**
 * Calcula la cuadrícula completa de días para renderizar un calendario mensual con semanas de lunes a domingo.
 *
 * @param fechaRef - Fecha que define el mes a visualizar.
 * @returns Array de objetos `DiaGrid` listos para renderizar en filas semanales de 7 días.
 */
export function obtenerDiasMesGrid(fechaRef: Date): DiaGrid[] {
  const inicioMes = startOfMonth(fechaRef)
  const finMes = endOfMonth(fechaRef)
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 1 }) // Lunes
  const finGrid = endOfWeek(finMes, { weekStartsOn: 1 }) // Domingo

  const dias = eachDayOfInterval({ start: inicioGrid, end: finGrid })
  const hoyStr = hoy()

  return dias.map(d => {
    const fechaStr = format(d, 'yyyy-MM-dd')
    return {
      fecha: fechaStr,
      numero: d.getDate(),
      enMesActual: isSameMonth(d, fechaRef),
      esHoy: fechaStr === hoyStr,
    }
  })
}
