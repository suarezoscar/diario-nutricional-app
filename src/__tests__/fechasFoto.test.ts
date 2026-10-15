import { describe, it, expect } from 'vitest'
import { extraerFechaYHoraDeFoto } from '../utils/fechas'

describe('Utilidad de extracción de fecha y hora de fotos (fechas/foto.ts)', () => {
  it('extrae fecha y hora desde metadatos EXIF', async () => {
    const asset = {
      uri: 'file:///data/photo.jpg',
      exif: { DateTimeOriginal: '2026:10:14 14:35:10' },
    }
    const info = await extraerFechaYHoraDeFoto(asset)
    expect(info.fecha).toBe('2026-10-14')
    expect(info.hora).toBe(14)
    expect(info.minuto).toBe(35)
    expect(info.horaFormateada).toBe('14:35')
  })

  it('extrae fecha y hora desde el nombre de archivo cuando no hay EXIF', async () => {
    const asset = {
      uri: 'file:///data/IMG_20261014_134522.jpg',
      fileName: 'IMG_20261014_134522.jpg',
      exif: null,
    }
    const info = await extraerFechaYHoraDeFoto(asset)
    expect(info.fecha).toBe('2026-10-14')
    expect(info.hora).toBe(13)
    expect(info.minuto).toBe(45)
    expect(info.horaFormateada).toBe('13:45')
  })

  it('extrae fecha de nombre tipo WhatsApp y asigna hora actual sin romper', async () => {
    const asset = {
      uri: 'file:///data/IMG-20261014-WA0001.jpg',
      fileName: 'IMG-20261014-WA0001.jpg',
      exif: null,
    }
    const info = await extraerFechaYHoraDeFoto(asset)
    expect(info.fecha).toBe('2026-10-14')
    expect(info.horaFormateada).toMatch(/^\d{2}:\d{2}$/)
  })
})
