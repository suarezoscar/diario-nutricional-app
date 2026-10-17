import { describe, it, expect } from 'vitest'
import { compararVersiones } from '../services/updateService'
import { APP_VERSION } from '../config/constants'
import appConfig from '../../app.json'

describe('Servicio de Actualizaciones (updateService)', () => {
  describe('compararVersiones', () => {
    it('detecta correctamente cuando la versión remota es mayor', () => {
      expect(compararVersiones('1.1.2', '1.1.1')).toBe(1)
      expect(compararVersiones('v1.1.2', '1.1.1')).toBe(1)
      expect(compararVersiones('2.0.0', '1.9.9')).toBe(1)
      expect(compararVersiones('1.2.0', '1.1.9')).toBe(1)
    })

    it('detecta correctamente cuando la versión remota es igual', () => {
      expect(compararVersiones('1.1.2', '1.1.2')).toBe(0)
      expect(compararVersiones('v1.1.2', '1.1.2')).toBe(0)
      expect(compararVersiones('v1.1.2', 'v1.1.2')).toBe(0)
    })

    it('detecta correctamente cuando la versión remota es menor', () => {
      expect(compararVersiones('1.1.0', '1.1.1')).toBe(-1)
      expect(compararVersiones('v1.0.9', '1.1.0')).toBe(-1)
    })
  })

  describe('Consistencia de versiones', () => {
    it('sincroniza APP_VERSION con la versión declarada en app.json', () => {
      expect(APP_VERSION).toBe(appConfig.expo.version)
    })
  })
})
