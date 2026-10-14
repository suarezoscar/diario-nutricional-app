import { describe, it, expect } from 'vitest'
import {
  estaComidaAnotada,
  obtenerComidasPendientes,
  formatearListaPendientes,
} from '../utils/widgetUtils'
import type { Registro } from '../types'

describe('Utilidades del Widget de Escritorio Android', () => {
  describe('estaComidaAnotada', () => {
    it('devuelve false si los datos son nulos o están vacíos', () => {
      expect(estaComidaAnotada('desayuno', 'desayunoFuera', null)).toBe(false)
      expect(estaComidaAnotada('desayuno', 'desayunoFuera', {})).toBe(false)
      expect(estaComidaAnotada('desayuno', 'desayunoFuera', { desayuno: '   ' })).toBe(false)
    })

    it('devuelve true si la comida tiene texto anotado', () => {
      expect(
        estaComidaAnotada('desayuno', 'desayunoFuera', { desayuno: 'Tostada con café' }),
      ).toBe(true)
    })

    it('devuelve true si está marcada como comida fuera de casa', () => {
      expect(
        estaComidaAnotada('comida', 'comidaFuera', { comida: '', comidaFuera: true }),
      ).toBe(true)
    })
  })

  describe('obtenerComidasPendientes', () => {
    it('devuelve array vacío antes de las 06:00 AM porque el día nutricional aún no ha comenzado', () => {
      const pendientes = obtenerComidasPendientes('cena', {}, 4)
      expect(pendientes).toEqual([])
    })

    it('en el desayuno sin anotar nada, devuelve únicamente Desayuno pendiente', () => {
      const pendientes = obtenerComidasPendientes('desayuno', {}, 9)
      expect(pendientes).toEqual(['Desayuno'])
    })

    it('en la merienda sin anotar nada hoy, devuelve desayuno, media mañana, comida y merienda', () => {
      const pendientes = obtenerComidasPendientes('merienda', {}, 18)
      expect(pendientes).toEqual(['Desayuno', 'Media mañana', 'Comida', 'Merienda'])
    })

    it('en la merienda con desayuno y comida anotados, devuelve media mañana y merienda', () => {
      const datos: Partial<Registro> = {
        desayuno: 'Avena con leche',
        comida: 'Lentejas con verduras',
      }
      const pendientes = obtenerComidasPendientes('merienda', datos, 18)
      expect(pendientes).toEqual(['Media mañana', 'Merienda'])
    })

    it('si todo hasta la comida actual está anotado o fuera, devuelve array vacío', () => {
      const datos: Partial<Registro> = {
        desayuno: 'Huevos revueltos',
        mediaMananaFuera: true,
        comida: 'Ensalada',
        merienda: 'Fruta',
      }
      const pendientes = obtenerComidasPendientes('merienda', datos, 18)
      expect(pendientes).toEqual([])
    })

    it('en la cena sin anotar nada, devuelve las 5 comidas del día', () => {
      const pendientes = obtenerComidasPendientes('cena', {}, 21)
      expect(pendientes).toEqual(['Desayuno', 'Media mañana', 'Comida', 'Merienda', 'Cena'])
    })
  })

  describe('formatearListaPendientes', () => {
    it('formatea lista vacía a cadena vacía', () => {
      expect(formatearListaPendientes([])).toBe('')
    })

    it('formatea un único elemento', () => {
      expect(formatearListaPendientes(['Desayuno'])).toBe('Desayuno')
    })

    it('formatea dos elementos con "y"', () => {
      expect(formatearListaPendientes(['Desayuno', 'Media mañana'])).toBe(
        'Desayuno y Media mañana',
      )
    })

    it('formatea cuatro elementos con comas y "y" final (caso del usuario)', () => {
      expect(
        formatearListaPendientes(['Desayuno', 'Media mañana', 'Comida', 'Merienda']),
      ).toBe('Desayuno, Media mañana, Comida y Merienda')
    })
  })
})
