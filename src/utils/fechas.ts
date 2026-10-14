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

export const generarDiasRango = generarListaDias

// --- Helpers para el selector de calendario ---

export interface DiaGrid {
  fecha: string
  numero: number
  enMesActual: boolean
  esHoy: boolean
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

/**
 * Determina y clasifica la casilla de comida correspondiente según la hora y minuto del día.
 *
 * @remarks
 * Rangos establecidos:
 * - 06:00 a 10:59: Desayuno
 * - 11:00 a 13:29: Media mañana
 * - 13:30 a 16:59: Comida
 * - 17:00 a 19:59: Merienda
 * - 20:00 a 05:59: Cena
 *
 * @param hora - Hora del día (0 a 23).
 * @param minuto - Minuto de la hora (0 a 59). Por defecto 0.
 * @returns La clave de comida (`desayuno`, `mediaManana`, `comida`, `merienda`, `cena`).
 */
export function asignarComidaPorHora(hora: number, minuto: number = 0): import('../types').ClaveComida {
  const tiempoMinutos = hora * 60 + minuto

  if (tiempoMinutos >= 6 * 60 && tiempoMinutos < 11 * 60) {
    return 'desayuno'
  }
  if (tiempoMinutos >= 11 * 60 && tiempoMinutos < 13 * 60 + 30) {
    return 'mediaManana'
  }
  if (tiempoMinutos >= 13 * 60 + 30 && tiempoMinutos < 17 * 60) {
    return 'comida'
  }
  if (tiempoMinutos >= 17 * 60 && tiempoMinutos < 20 * 60) {
    return 'merienda'
  }
  return 'cena'
}

export interface InfoFechaFoto {
  fecha: string
  hora: number
  minuto: number
  horaFormateada: string
}

/**
 * Extrae la fecha y hora de captura de un elemento fotográfico inspeccionando múltiples fuentes con fallback seguro.
 *
 * @remarks
 * Prioridad de resolución:
 * 1. Metadatos EXIF (`DateTimeOriginal`, `DateTimeDigitized`, `DateTime`).
 * 2. Patrones temporales en el nombre de archivo (cámaras Android/iOS, capturas, WhatsApp).
 * 3. Fecha de modificación en el sistema de archivos local (`expo-file-system`).
 * 4. Fecha y hora actuales como último recurso de seguridad.
 *
 * @param asset - Objeto con la URI, nombre de archivo opcional y metadatos EXIF opcionales.
 * @returns Promesa que resuelve a la fecha (`YYYY-MM-DD`), hora numérica, minuto y hora formateada (`HH:mm`).
 */
export async function extraerFechaYHoraDeFoto(asset: {
  uri: string
  fileName?: string | null
  exif?: Record<string, any> | null
}): Promise<InfoFechaFoto> {
  // 1. Intentar extraer de EXIF
  if (asset.exif) {
    const rawExifDate =
      asset.exif.DateTimeOriginal ||
      asset.exif.DateTimeDigitized ||
      asset.exif.DateTime ||
      asset.exif['{Exif}']?.DateTimeOriginal ||
      asset.exif['{TIFF}']?.DateTime

    if (typeof rawExifDate === 'string') {
      const match = rawExifDate.match(/(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2})/)
      if (match) {
        const [, y, m, d, hh, mm] = match
        const h = parseInt(hh, 10)
        const min = parseInt(mm, 10)
        return {
          fecha: `${y}-${m}-${d}`,
          hora: h,
          minuto: min,
          horaFormateada: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        }
      }
    }
  }

  // 2. Intentar extraer del nombre del archivo (ej. IMG_20261014_143000.jpg)
  if (asset.fileName) {
    const matchTime = asset.fileName.match(
      /(?:IMG_|PXL_|VID_|PHOTO_)?(20\d{2})[-_]?(\d{2})[-_]?(\d{2})[_-](\d{2})(\d{2})/,
    )
    if (matchTime) {
      const [, y, m, d, hh, mm] = matchTime
      const h = parseInt(hh, 10)
      const min = parseInt(mm, 10)
      return {
        fecha: `${y}-${m}-${d}`,
        hora: h,
        minuto: min,
        horaFormateada: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      }
    }

    const matchDateOnly = asset.fileName.match(/(?:IMG-|WA-)?(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/)
    if (matchDateOnly) {
      const [, y, m, d] = matchDateOnly
      const ahora = new Date()
      const h = ahora.getHours()
      const min = ahora.getMinutes()
      return {
        fecha: `${y}-${m}-${d}`,
        hora: h,
        minuto: min,
        horaFormateada: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      }
    }
  }

  // 3. Intentar extraer con FileSystem
  try {
    const FileSystem = await import('expo-file-system')
    const info = await FileSystem.getInfoAsync(asset.uri)
    if (info.exists && (info as any).modificationTime) {
      const ts = (info as any).modificationTime
      const modDate = new Date(ts > 1e11 ? ts : ts * 1000)
      if (!isNaN(modDate.getTime())) {
        const y = modDate.getFullYear()
        const m = String(modDate.getMonth() + 1).padStart(2, '0')
        const d = String(modDate.getDate()).padStart(2, '0')
        const h = modDate.getHours()
        const min = modDate.getMinutes()
        return {
          fecha: `${y}-${m}-${d}`,
          hora: h,
          minuto: min,
          horaFormateada: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        }
      }
    }
  } catch {
    // Fallback silencioso
  }

  // 4. Fallback a fecha y hora actual
  const ahora = new Date()
  const y = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  const h = ahora.getHours()
  const min = ahora.getMinutes()
  return {
    fecha: `${y}-${m}-${d}`,
    hora: h,
    minuto: min,
    horaFormateada: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
  }
}
