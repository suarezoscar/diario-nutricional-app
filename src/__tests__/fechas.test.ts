import { describe, it, expect } from 'vitest'
import {
  asignarComidaPorHora,
  obtenerFechaOperativa,
  calcularFechaParaComida,
  hoy,
  desplazarDia,
  formatearFechaLarga,
  formatearFechaCorta,
  formatearFechaEspanolaCompleta,
  formatearFechaPdf,
  generarListaDias,
  obtenerDiasMesGrid,
  desplazarMes,
  obtenerMesAnio,
  extraerFechaYHoraDeFoto,
} from '../utils/fechas'

describe('Motor de fechas y horarios (fechas.ts)', () => {
  describe('asignarComidaPorHora', () => {
    it('asigna desayuno entre 06:00 y 10:59', () => {
      expect(asignarComidaPorHora(6, 0)).toBe('desayuno')
      expect(asignarComidaPorHora(8, 30)).toBe('desayuno')
      expect(asignarComidaPorHora(10, 59)).toBe('desayuno')
    })

    it('asigna media mañana entre 11:00 y 13:29', () => {
      expect(asignarComidaPorHora(11, 0)).toBe('mediaManana')
      expect(asignarComidaPorHora(12, 15)).toBe('mediaManana')
      expect(asignarComidaPorHora(13, 29)).toBe('mediaManana')
    })

    it('asigna comida entre 13:30 y 16:59', () => {
      expect(asignarComidaPorHora(13, 30)).toBe('comida')
      expect(asignarComidaPorHora(14, 45)).toBe('comida')
      expect(asignarComidaPorHora(16, 59)).toBe('comida')
    })

    it('asigna merienda entre 17:00 y 19:59', () => {
      expect(asignarComidaPorHora(17, 0)).toBe('merienda')
      expect(asignarComidaPorHora(18, 30)).toBe('merienda')
      expect(asignarComidaPorHora(19, 59)).toBe('merienda')
    })

    it('asigna cena entre 20:00 y 23:29, y pasa a desayuno a partir de 23:30 y de madrugada', () => {
      expect(asignarComidaPorHora(20, 0)).toBe('cena')
      expect(asignarComidaPorHora(21, 30)).toBe('cena')
      expect(asignarComidaPorHora(23, 29)).toBe('cena')
      expect(asignarComidaPorHora(23, 30)).toBe('desayuno')
      expect(asignarComidaPorHora(0, 0)).toBe('desayuno')
      expect(asignarComidaPorHora(3, 15)).toBe('desayuno')
      expect(asignarComidaPorHora(5, 59)).toBe('desayuno')
    })

    it('respeta horarios personalizados y cenas tardías que cruzan medianoche', () => {
      const horariosCustom = {
        desayuno: { inicio: '07:00', fin: '10:00' },
        mediaManana: { inicio: '10:00', fin: '12:00' },
        comida: { inicio: '12:00', fin: '15:00' },
        merienda: { inicio: '15:00', fin: '19:00' },
        cena: { inicio: '21:00', fin: '01:00' },
      }

      expect(asignarComidaPorHora(12, 30, horariosCustom)).toBe('comida')
      expect(asignarComidaPorHora(0, 30, horariosCustom)).toBe('cena')
      expect(asignarComidaPorHora(1, 0, horariosCustom)).toBe('desayuno')
      expect(asignarComidaPorHora(6, 30, horariosCustom)).toBe('desayuno')
    })
  })

  describe('Cálculo de fecha operativa y enlaces de comida', () => {
    it('calcula fecha para enlaces respetando fechaParam explícita', () => {
      expect(calcularFechaParaComida('cena', '2026-10-15')).toBe('2026-10-15')
    })

    it('devuelve hoy para comidas diurnas sin fechaParam', () => {
      expect(calcularFechaParaComida('desayuno')).toBe(hoy())
    })
  })

  describe('Formateo de fechas en español', () => {
    it('formatea fecha completa en español para títulos y reportes', () => {
      const resultado = formatearFechaEspanolaCompleta('2026-10-14')
      expect(resultado).toBe('14 de octubre de 2026')
    })

    it('formatea fecha para cabecera de tabla PDF con día de la semana capitalizado', () => {
      // 2026-10-14 es miércoles
      const resultado = formatearFechaPdf('2026-10-14')
      expect(resultado.diaSemana.toLowerCase()).toContain('miércoles')
      expect(resultado.fechaNumero).toBe('14/10/2026')
    })

    it('formatea fecha corta con formato estándar', () => {
      const resultado = formatearFechaCorta('2026-10-14')
      expect(resultado).toContain('14')
      expect(resultado).toContain('oct')
    })

    it('formatea fecha larga con día y mes completo', () => {
      const resultado = formatearFechaLarga('2026-10-14')
      expect(resultado.toLowerCase()).toContain('miércoles')
      expect(resultado).toContain('14 de octubre')
    })
  })

  describe('Navegación y manipulación de días', () => {
    it('desplaza días positivos y negativos correctamente', () => {
      expect(desplazarDia('2026-10-14', 1)).toBe('2026-10-15')
      expect(desplazarDia('2026-10-14', -1)).toBe('2026-10-13')
      expect(desplazarDia('2026-10-01', -1)).toBe('2026-09-30')
      expect(desplazarDia('2026-12-31', 1)).toBe('2027-01-01')
    })

    it('genera una lista continua de días en un rango', () => {
      const lista = generarListaDias('2026-10-10', '2026-10-14')
      expect(lista).toEqual([
        '2026-10-10',
        '2026-10-11',
        '2026-10-12',
        '2026-10-13',
        '2026-10-14',
      ])
      expect(lista.length).toBe(5)
    })

    it('calcula la cuadrícula de días para un mes (calendario semanal de lunes a domingo)', () => {
      const fechaOct = new Date(2026, 9, 14) // Octubre 2026
      const grid = obtenerDiasMesGrid(fechaOct)
      expect(grid.length).toBeGreaterThanOrEqual(28)
      expect(grid.length % 7).toBe(0) // Semanas completas de 7 días
      expect(grid.some(d => d.fecha === '2026-10-14' && d.enMesActual)).toBe(true)
    })

    it('desplaza meses y obtiene nombre legible', () => {
      const oct2026 = new Date(2026, 9, 1)
      const nov2026 = desplazarMes(oct2026, 1)
      expect(obtenerMesAnio(nov2026).toLowerCase()).toContain('noviembre')
      expect(obtenerMesAnio(nov2026)).toContain('2026')
    })
  })
})
