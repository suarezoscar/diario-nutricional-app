import { describe, it, expect } from 'vitest'
import { construirHtmlReporte } from '../services/pdfService'
import type { Registro } from '../types'

describe('Motor de generación de reportes PDF (pdfService.ts)', () => {
  it('omite completamente el peso y conserva la columna de ejercicio', () => {
    const registros: Record<string, Partial<Registro>> = {
      '2026-10-14': {
        desayuno: 'Avena con plátano',
        mediaManana: 'Manzana',
        comida: 'Pollo y arroz',
        merienda: 'Yogur',
        cena: 'Ensalada',
        agua: '2.5',
        peso: '75.4', // Debe ser OMITIDO
        ejercicio: '45 min de caminata rápida', // Debe ser INCLUIDO
      },
    }

    const html = construirHtmlReporte(
      'Juan Pérez',
      '2026-10-14',
      '2026-10-14',
      ['2026-10-14'],
      registros,
    )

    // La cabecera debe tener "Ejercicio" y NO "Peso / Ejercicio" ni "Peso"
    expect(html).toContain('<th>Ejercicio</th>')
    expect(html).not.toContain('<th>Peso / Ejercicio</th>')
    expect(html).not.toContain('<th>Peso</th>')

    // El contenido debe incluir el ejercicio y los litros de agua
    expect(html).toContain('45 min de caminata rápida')
    expect(html).toContain('2.5 L')

    // El valor de peso "75.4" o "75.4 kg" NO debe aparecer en el HTML generado
    expect(html).not.toContain('75.4 kg')
    expect(html).not.toContain('Peso:')
  })

  it('marca las comidas fuera de casa con el distintivo [FUERA]', () => {
    const registros: Record<string, Partial<Registro>> = {
      '2026-10-14': {
        comida: 'Menú del día en restaurante',
        comidaFuera: true,
      },
    }

    const html = construirHtmlReporte(
      'María',
      '2026-10-14',
      '2026-10-14',
      ['2026-10-14'],
      registros,
    )

    expect(html).toContain('[FUERA]')
    expect(html).toContain('Menú del día en restaurante')
  })

  it('formatea las fechas del período y días de la tabla en español', () => {
    const registros: Record<string, Partial<Registro>> = {}
    const html = construirHtmlReporte(
      'Carlos',
      '2026-10-07',
      '2026-10-14',
      ['2026-10-14'],
      registros,
    )

    // Período formateado en español completo
    expect(html).toContain('7 de octubre de 2026')
    expect(html).toContain('14 de octubre de 2026')

    // Día de la semana en español en la columna
    expect(html.toLowerCase()).toContain('miércoles')
    expect(html).toContain('14/10/2026')
  })

  it('reemplaza saltos de línea por <br/> en las descripciones de comidas y ejercicio', () => {
    const registros: Record<string, Partial<Registro>> = {
      '2026-10-14': {
        desayuno: 'Café con leche\nTostada con aceite',
        ejercicio: 'Calistenia\nEstiramientos',
      },
    }

    const html = construirHtmlReporte(
      'Elena',
      '2026-10-14',
      '2026-10-14',
      ['2026-10-14'],
      registros,
    )

    expect(html).toContain('Café con leche<br/>Tostada con aceite')
    expect(html).toContain('Calistenia<br/>Estiramientos')
  })
})
