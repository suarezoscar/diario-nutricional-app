import { format, parseISO, addDays } from 'date-fns'
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
