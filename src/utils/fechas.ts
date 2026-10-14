import {
  format,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

export function hoy(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function desplazarDia(fechaStr: string, delta: number): string {
  const d = parseISO(fechaStr)
  return format(addDays(d, delta), 'yyyy-MM-dd')
}

export function formatearFechaLarga(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    // Ej: "miércoles, 14 de octubre"
    return format(d, "EEEE, d 'de' MMMM", { locale: es })
  } catch {
    return fechaStr
  }
}

export function formatearDiaMes(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, 'EEE dd/MM', { locale: es })
  } catch {
    return fechaStr
  }
}

export function formatearFechaCorta(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, "d 'de' MMM", { locale: es })
  } catch {
    return fechaStr
  }
}

export function generarListaDias(desdeStr: string, hastaStr: string): string[] {
  try {
    const dInicio = parseISO(desdeStr)
    const dFin = parseISO(hastaStr)
    const lista: string[] = []
    let actual = dInicio
    while (actual <= dFin) {
      lista.push(format(actual, 'yyyy-MM-dd'))
      actual = addDays(actual, 1)
    }
    return lista
  } catch {
    return [desdeStr]
  }
}

export const generarDiasRango = generarListaDias

// --- Helpers para el selector de calendario ---

export interface DiaGrid {
  fecha: string
  numero: number
  enMesActual: boolean
  esHoy: boolean
}

export function obtenerMesAnio(fecha: Date): string {
  try {
    const texto = format(fecha, 'MMMM yyyy', { locale: es })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  } catch {
    return ''
  }
}

export function desplazarMes(fecha: Date, delta: number): Date {
  return delta > 0 ? addMonths(fecha, delta) : subMonths(fecha, Math.abs(delta))
}

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

export function inicioYFinMesActual(): { desde: string; hasta: string } {
  const ahora = new Date()
  return {
    desde: format(startOfMonth(ahora), 'yyyy-MM-dd'),
    hasta: format(endOfMonth(ahora), 'yyyy-MM-dd'),
  }
}
