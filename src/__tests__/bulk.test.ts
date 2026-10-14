import { describe, it, expect } from 'vitest'
import type { ClaveComida, Registro } from '../types'

interface ItemFotoPrueba {
  id: string
  fecha: string
  comidaClave: ClaveComida
  descripcion: string
}

/**
 * Función pura que replica la lógica de agrupación de fotos bulk antes de guardar en Firebase
 */
function agruparFotosPorDia(items: ItemFotoPrueba[], registrosExistentes: Record<string, Partial<Registro>> = {}) {
  const diasAgrupados: Record<string, Partial<Registro>> = {}

  for (const item of items) {
    if (!diasAgrupados[item.fecha]) {
      diasAgrupados[item.fecha] = { ...(registrosExistentes[item.fecha] || {}) }
    }

    const actual = (diasAgrupados[item.fecha][item.comidaClave] as string) || ''
    const nuevoTexto = actual ? `${actual}\n${item.descripcion}` : item.descripcion
    diasAgrupados[item.fecha][item.comidaClave] = nuevoTexto
  }

  return diasAgrupados
}

describe('Lógica de agrupación de fotos bulk (useBulkProcessor)', () => {
  it('agrupa fotos de diferentes días en sus respectivas fechas', () => {
    const items: ItemFotoPrueba[] = [
      {
        id: '1',
        fecha: '2026-10-13',
        comidaClave: 'cena',
        descripcion: 'Tortilla de patatas con ensalada',
      },
      {
        id: '2',
        fecha: '2026-10-14',
        comidaClave: 'comida',
        descripcion: 'Salmón a la plancha con brócoli',
      },
    ]

    const resultado = agruparFotosPorDia(items)

    expect(Object.keys(resultado)).toEqual(['2026-10-13', '2026-10-14'])
    expect(resultado['2026-10-13'].cena).toBe('Tortilla de patatas con ensalada')
    expect(resultado['2026-10-14'].comida).toBe('Salmón a la plancha con brócoli')
  })

  it('concatena descripciones si hay varias fotos para la misma comida en el mismo día', () => {
    const items: ItemFotoPrueba[] = [
      {
        id: '1',
        fecha: '2026-10-14',
        comidaClave: 'comida',
        descripcion: 'Primer plato: Gazpacho andaluz',
      },
      {
        id: '2',
        fecha: '2026-10-14',
        comidaClave: 'comida',
        descripcion: 'Segundo plato: Filete de ternera',
      },
    ]

    const resultado = agruparFotosPorDia(items)

    expect(resultado['2026-10-14'].comida).toBe(
      'Primer plato: Gazpacho andaluz\nSegundo plato: Filete de ternera',
    )
  })

  it('respeta los datos previos de otras comidas registradas ese día', () => {
    const existentes: Record<string, Partial<Registro>> = {
      '2026-10-14': {
        desayuno: 'Café con tostada',
        agua: '1.5',
      },
    }

    const items: ItemFotoPrueba[] = [
      {
        id: '1',
        fecha: '2026-10-14',
        comidaClave: 'cena',
        descripcion: 'Yogur con nueces',
      },
    ]

    const resultado = agruparFotosPorDia(items, existentes)

    expect(resultado['2026-10-14'].desayuno).toBe('Café con tostada')
    expect(resultado['2026-10-14'].agua).toBe('1.5')
    expect(resultado['2026-10-14'].cena).toBe('Yogur con nueces')
  })
})
