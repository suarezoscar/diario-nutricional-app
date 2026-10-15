export interface InfoFechaFoto {
  fecha: string
  hora: number
  minuto: number
  horaFormateada: string
}

/**
 * Extrae la fecha y hora de captura de una fotografía inspeccionando EXIF, nombre de archivo o sistema de archivos.
 *
 * @param asset - Objeto con URI, nombre de archivo y metadatos EXIF opcionales.
 * @returns Promesa con los datos temporales desglosados.
 */
export async function extraerFechaYHoraDeFoto(asset: {
  uri: string
  fileName?: string | null
  exif?: Record<string, any> | null
}): Promise<InfoFechaFoto> {
  if (asset.exif) {
    const raw =
      asset.exif.DateTimeOriginal ||
      asset.exif.DateTimeDigitized ||
      asset.exif.DateTime ||
      asset.exif['{Exif}']?.DateTimeOriginal ||
      asset.exif['{TIFF}']?.DateTime

    if (typeof raw === 'string') {
      const match = raw.match(/(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2})/)
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
