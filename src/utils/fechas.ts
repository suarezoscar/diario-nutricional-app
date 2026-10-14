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

/**
 * Asigna una comida según la hora y minuto del día:
 * - 06:00 a 10:59: Desayuno
 * - 11:00 a 13:29: Media mañana
 * - 13:30 a 16:59: Comida
 * - 17:00 a 19:59: Merienda
 * - 20:00 a 05:59: Cena
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
