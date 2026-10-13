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
