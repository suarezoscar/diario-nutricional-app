import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha a representación textual larga en español (ej. "miércoles, 14 de octubre").
 *
 * @param fechaStr - Fecha en formato `YYYY-MM-DD`.
 * @returns Texto legible con el día de la semana y el mes en español.
 */
export function formatearFechaLarga(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, "EEEE, d 'de' MMMM", { locale: es })
  } catch {
    return fechaStr
  }
}

/**
 * Formatea una fecha al estilo abreviado día/mes con nombre del día (ej. "mié. 14/10").
 *
 * @param fechaStr - Fecha en formato `YYYY-MM-DD`.
 * @returns Cadena con abreviatura del día y números `dd/MM`.
 */
export function formatearDiaMes(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, 'EEE dd/MM', { locale: es })
  } catch {
    return fechaStr
  }
}

/**
 * Formatea una fecha a estilo corto legible (ej. "14 de oct").
 *
 * @param fechaStr - Fecha en formato `YYYY-MM-DD`.
 * @returns Cadena corta con día y mes abreviado.
 */
export function formatearFechaCorta(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, "d 'de' MMM", { locale: es })
  } catch {
    return fechaStr
  }
}

/**
 * Formatea una fecha a su representación formal española completa para informes (ej. "14 de octubre de 2026").
 *
 * @param fechaStr - Fecha en formato `YYYY-MM-DD`.
 * @returns Cadena con día, mes completo y año.
 */
export function formatearFechaEspanolaCompleta(fechaStr: string): string {
  try {
    const d = parseISO(fechaStr)
    return format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return fechaStr
  }
}

/**
 * Desglosa y formatea una fecha específicamente para las cabeceras de columnas del reporte PDF.
 *
 * @param fechaStr - Fecha en formato `YYYY-MM-DD`.
 * @returns Objeto con el nombre del día de la semana capitalizado y la fecha numérica `dd/MM/yyyy`.
 */
export function formatearFechaPdf(fechaStr: string): { diaSemana: string; fechaNumero: string } {
  try {
    const d = parseISO(fechaStr)
    const diaSem = format(d, 'EEEE', { locale: es })
    const fechaNum = format(d, 'dd/MM/yyyy')
    const diaCapitalizado = diaSem.charAt(0).toUpperCase() + diaSem.slice(1)
    return { diaSemana: diaCapitalizado, fechaNumero: fechaNum }
  } catch {
    return { diaSemana: fechaStr, fechaNumero: '' }
  }
}

/**
 * Devuelve el nombre del mes y año capitalizado (ej. "Octubre 2026") para el título del calendario.
 *
 * @param fecha - Objeto Date del mes a representar.
 * @returns Cadena capitalizada con mes y año.
 */
export function obtenerMesAnio(fecha: Date): string {
  try {
    const texto = format(fecha, 'MMMM yyyy', { locale: es })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  } catch {
    return ''
  }
}
