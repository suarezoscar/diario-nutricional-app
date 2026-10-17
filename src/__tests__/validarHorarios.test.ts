import { describe, it, expect } from 'vitest'
import { validarCambioHorario, horaAJornadaMinutos } from '../components/ajustes/utils/validarHorarios'
import { HORARIOS_POR_DEFECTO } from '../services/configService'

describe('Validador de Horarios de Comidas (validarHorarios.ts)', () => {
  describe('horaAJornadaMinutos', () => {
    it('normaliza horas diurnas y nocturnas al marco de 04:00 a 04:00', () => {
      expect(horaAJornadaMinutos('04:00', false)).toBe(0)
      expect(horaAJornadaMinutos('06:00', false)).toBe(120)
      expect(horaAJornadaMinutos('23:30', false)).toBe(1170)
      expect(horaAJornadaMinutos('00:00', false)).toBe(1200)
      expect(horaAJornadaMinutos('01:30', false)).toBe(1290)
      expect(horaAJornadaMinutos('04:00', true)).toBe(1440)
    })
  })

  describe('Restricciones de Desayuno y Cena', () => {
    it('no permite que el desayuno empiece antes de las 04:00 AM', () => {
      const res = validarCambioHorario('desayuno', 'inicio', '03:30', HORARIOS_POR_DEFECTO)
      expect(res.esValido).toBe(false)
      expect(res.error).toContain('04:00 AM')
    })

    it('permite que el desayuno empiece a partir de las 04:00 AM si no cruza con su fin', () => {
      const res = validarCambioHorario('desayuno', 'inicio', '04:00', HORARIOS_POR_DEFECTO)
      expect(res.esValido).toBe(true)
    })

    it('no permite que la cena finalice después de las 04:00 AM', () => {
      const res1 = validarCambioHorario('cena', 'fin', '04:30', HORARIOS_POR_DEFECTO)
      expect(res1.esValido).toBe(false)
      expect(res1.error).toContain('04:00 AM')

      const res2 = validarCambioHorario('cena', 'fin', '05:00', HORARIOS_POR_DEFECTO)
      expect(res2.esValido).toBe(false)
    })

    it('permite que la cena finalice a las 00:00, 01:30 o hasta las 04:00 AM', () => {
      expect(validarCambioHorario('cena', 'fin', '23:30', HORARIOS_POR_DEFECTO).esValido).toBe(true)
      expect(validarCambioHorario('cena', 'fin', '00:00', HORARIOS_POR_DEFECTO).esValido).toBe(true)
      expect(validarCambioHorario('cena', 'fin', '01:30', HORARIOS_POR_DEFECTO).esValido).toBe(true)
      expect(validarCambioHorario('cena', 'fin', '04:00', HORARIOS_POR_DEFECTO).esValido).toBe(true)
    })
  })

  describe('Prevención de cruce de horas dentro de la misma comida y entre consecutivas', () => {
    it('no permite que el inicio sea igual o posterior al fin en la misma comida', () => {
      const res = validarCambioHorario('comida', 'inicio', '17:00', HORARIOS_POR_DEFECTO)
      expect(res.esValido).toBe(false)
      expect(res.error).toContain('anterior a su hora de fin')
    })

    it('no permite que el fin de una comida sobrepase el inicio de la siguiente', () => {
      const res = validarCambioHorario('desayuno', 'fin', '11:30', HORARIOS_POR_DEFECTO)
      expect(res.esValido).toBe(false)
      expect(res.error).toContain('no puede terminar después del inicio de media mañana')
    })

    it('no permite que el inicio de una comida sea anterior al fin de la previa', () => {
      const res = validarCambioHorario('comida', 'inicio', '13:00', HORARIOS_POR_DEFECTO)
      expect(res.esValido).toBe(false)
      expect(res.error).toContain('no puede comenzar antes del fin de media mañana')
    })

    it('permite horarios adyacentes continuos', () => {
      // mediaManana fin = 13:30, comida inicio = 13:30
      expect(validarCambioHorario('mediaManana', 'fin', '13:30', HORARIOS_POR_DEFECTO).esValido).toBe(true)
    })
  })
})
