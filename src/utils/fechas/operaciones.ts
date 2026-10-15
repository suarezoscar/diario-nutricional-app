import { format, parseISO, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

/**
 * Obtiene la fecha actual en la zona horaria local formateada como `YYYY-MM-DD`.
 *
 * @returns Cadena de fecha en formato ISO simple `YYYY-MM-DD`.
 */
export function hoy(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Desplaza una fecha determinada un número relativo de días hacia adelante o hacia atrás.
 *
 * @param fechaStr - Fecha base en formato `YYYY-MM-DD`.
 * @param delta - Número de días a sumar (positivo) o restar (negativo).
 * @returns Nueva fecha calculada en formato `YYYY-MM-DD`.
 */
export function desplazarDia(fechaStr: string, delta: number): string {
  const d = parseISO(fechaStr)
  return format(addDays(d, delta), 'yyyy-MM-dd')
}

/**
 * Desplaza una fecha de referencia un número entero de meses.
 *
 * @param fecha - Fecha de partida.
 * @param delta - Número de meses a sumar o restar.
 * @returns Nuevo objeto Date resultante.
 */
export function desplazarMes(fecha: Date, delta: number): Date {
  return delta > 0 ? addMonths(fecha, delta) : subMonths(fecha, Math.abs(delta))
}

/**
 * Genera un arreglo cronológico de fechas en formato `YYYY-MM-DD` comprendidas entre `desde` y `hasta`.
 *
 * @param desdeStr - Fecha de inicio del intervalo (`YYYY-MM-DD`).
 * @param hastaStr - Fecha de fin del intervalo (`YYYY-MM-DD`).
 * @returns Array con todas las fechas consecutivas del intervalo.
 */
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

/**
 * Alias de generarListaDias para rangos de fechas.
 */
export const generarDiasRango = generarListaDias

/**
 * Obtiene el rango exacto de inicio y fin del mes actual.
 *
 * @returns Objeto con las cadenas `desde` y `hasta` en formato `YYYY-MM-DD`.
 */
export function inicioYFinMesActual(): { desde: string; hasta: string } {
  const ahora = new Date()
  return {
    desde: format(startOfMonth(ahora), 'yyyy-MM-dd'),
    hasta: format(endOfMonth(ahora), 'yyyy-MM-dd'),
  }
}
