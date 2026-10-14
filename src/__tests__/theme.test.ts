import { describe, it, expect } from 'vitest'
import { paletteLight, paletteDark } from '../utils/theme'

describe('Sistema de Temas e Inmutabilidad de Paletas', () => {
  it('la paleta clara tiene colores claros definidos y es inmutable', () => {
    expect(paletteLight.background).toBe('#f5f7f5')
    expect(paletteLight.card).toBe('#ffffff')
    expect(paletteLight.text).toBe('#1c281e')
    expect(Object.isFrozen(paletteLight)).toBe(true)
  })

  it('la paleta oscura tiene colores oscuros definidos y es inmutable', () => {
    expect(paletteDark.background).toBe('#0d130e')
    expect(paletteDark.card).toBe('#161f18')
    expect(paletteDark.text).toBe('#f1f5f2')
    expect(Object.isFrozen(paletteDark)).toBe(true)
  })

  it('no permite mutar las propiedades de paletteLight ni paletteDark', () => {
    expect(() => {
      // @ts-expect-error intento de mutación
      paletteLight.background = '#000000'
    }).toThrow()

    expect(() => {
      // @ts-expect-error intento de mutación
      paletteDark.background = '#ffffff'
    }).toThrow()
  })

  it('calcular tema claro tras pasar por oscuro devuelve los colores claros correctos', () => {
    function resolverEsOscuro(modoTema: 'sistema' | 'claro' | 'oscuro', sistema: 'light' | 'dark') {
      if (modoTema === 'oscuro') return true
      if (modoTema === 'claro') return false
      return sistema === 'dark'
    }

    // 1. Inicia en oscuro
    const esOscuroInicial = resolverEsOscuro('oscuro', 'dark')
    const coloresOscuro = esOscuroInicial ? paletteDark : paletteLight
    expect(coloresOscuro.background).toBe('#0d130e')
    expect(coloresOscuro.card).toBe('#161f18')

    // 2. Cambia a claro
    const esOscuroFinal = resolverEsOscuro('claro', 'dark')
    const coloresClaro = esOscuroFinal ? paletteDark : paletteLight
    expect(coloresClaro.background).toBe('#f5f7f5')
    expect(coloresClaro.card).toBe('#ffffff')
    expect(coloresClaro.text).toBe('#1c281e')
  })
})
