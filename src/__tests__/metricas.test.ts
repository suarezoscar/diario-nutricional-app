import { describe, it, expect } from 'vitest'
import type { Registro } from '../types'

/**
 * Función pura que replica y valida el cálculo de métricas agregadas del histórico
 */
function calcularMetricas(dias: { key: string; fecha: string; datos: Partial<Registro> }[]) {
  let diasConDatos = 0
  let sumaAgua = 0
  let diasConAgua = 0
  let comidasFuera = 0

  dias.forEach(d => {
    const r = d.datos
    const tieneAlgo =
      !!r.desayuno ||
      !!r.mediaManana ||
      !!r.comida ||
      !!r.merienda ||
      !!r.cena ||
      !!r.agua ||
      !!r.peso

    if (tieneAlgo) diasConDatos++

    if (r.agua) {
      const l = parseFloat(r.agua)
      if (!isNaN(l) && l > 0) {
        sumaAgua += l
        diasConAgua++
      }
    }

    if (r.desayunoFuera) comidasFuera++
    if (r.mediaMananaFuera) comidasFuera++
    if (r.comidaFuera) comidasFuera++
    if (r.meriendaFuera) comidasFuera++
    if (r.cenaFuera) comidasFuera++
  })

  const mediaAgua = diasConAgua > 0 ? +(sumaAgua / diasConAgua).toFixed(2) : 0

  return {
    totalDias: dias.length,
    diasConDatos,
    mediaAgua,
    comidasFuera,
  }
}

describe('Cálculo de métricas nutricionales del Histórico', () => {
  it('calcula correctamente los días registrados, media de agua y comidas fuera', () => {
    const dias = [
      {
        key: '2026-10-12',
        fecha: '2026-10-12',
        datos: {
          desayuno: 'Tostada',
          desayunoFuera: true,
          comida: 'Ensalada',
          comidaFuera: true,
          agua: '2.0',
        },
      },
      {
        key: '2026-10-13',
        fecha: '2026-10-13',
        datos: {
          desayuno: 'Fruta',
          cena: 'Pescado',
          agua: '3.0',
        },
      },
      {
        key: '2026-10-14',
        fecha: '2026-10-14',
        datos: {}, // Día vacío sin registros
      },
    ]

    const metricas = calcularMetricas(dias)

    expect(metricas.totalDias).toBe(3)
    expect(metricas.diasConDatos).toBe(2)
    // Media de agua: (2.0 + 3.0) / 2 = 2.5 L
    expect(metricas.mediaAgua).toBe(2.5)
    // Comidas fuera: desayuno (1) + comida (1) = 2
    expect(metricas.comidasFuera).toBe(2)
  })

  it('no divide por cero si no hay registros de agua', () => {
    const dias = [
      {
        key: '2026-10-14',
        fecha: '2026-10-14',
        datos: { desayuno: 'Café' },
      },
    ]

    const metricas = calcularMetricas(dias)
    expect(metricas.mediaAgua).toBe(0)
    expect(metricas.diasConDatos).toBe(1)
  })
})
