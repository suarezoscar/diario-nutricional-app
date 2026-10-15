import { describe, it, expect, beforeEach } from 'vitest'
import {
  guardarDiaLocal,
  obtenerDiaLocal,
  obtenerRangoLocal,
  obtenerDiasPendientes,
  marcarDiasSincronizados,
  guardarDiasBatch,
} from '../db/diasDao'
import {
  guardarPesoLocal,
  obtenerPesosLocal,
  borrarPesoLocal,
  eliminarPesoFisicoLocal,
  obtenerPesosPendientes,
  marcarPesoSincronizado,
} from '../db/pesosDao'
import { getMeta, setMeta, removeMeta } from '../db/syncMetaDao'
import { cerrarDatabase } from '../db/database'
import { __resetMockDb } from './__mocks__/expo-sqlite'

describe('Capa de Base de Datos SQLite Local-First', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
  })

  describe('diasDao', () => {
    it('guarda y recupera un día completo', async () => {
      await guardarDiaLocal('user_test', '2026-10-15', {
        desayuno: 'Tostada con jamón',
        desayunoFuera: true,
        comida: 'Lentejas',
        agua: '2.5',
      })

      const resultado = await obtenerDiaLocal('user_test', '2026-10-15')
      expect(resultado).not.toBeNull()
      expect(resultado?.userId).toBe('user_test')
      expect(resultado?.fecha).toBe('2026-10-15')
      expect(resultado?.desayuno).toBe('Tostada con jamón')
      expect(resultado?.desayunoFuera).toBe(true)
      expect(resultado?.comida).toBe('Lentejas')
      expect(resultado?.agua).toBe('2.5')
    })

    it('hace merge con campos existentes sin sobreescribir datos previos', async () => {
      // 1. Primer guardado con desayuno
      await guardarDiaLocal('user_test', '2026-10-15', {
        desayuno: 'Café',
        agua: '1.0',
      })

      // 2. Segundo guardado parcial con comida
      await guardarDiaLocal('user_test', '2026-10-15', {
        comida: 'Ensalada',
      })

      const resultado = await obtenerDiaLocal('user_test', '2026-10-15')
      expect(resultado?.desayuno).toBe('Café')
      expect(resultado?.agua).toBe('1.0')
      expect(resultado?.comida).toBe('Ensalada')
    })

    it('recupera un rango de fechas ordenado cronológicamente', async () => {
      await guardarDiaLocal('user_test', '2026-10-10', { desayuno: 'Día 10' }, 'synced')
      await guardarDiaLocal('user_test', '2026-10-12', { desayuno: 'Día 12' }, 'synced')
      await guardarDiaLocal('user_test', '2026-10-15', { desayuno: 'Día 15' }, 'synced')
      await guardarDiaLocal('otro_user', '2026-10-11', { desayuno: 'Otro' }, 'synced')

      const rango = await obtenerRangoLocal('user_test', '2026-10-10', '2026-10-14')
      expect(Object.keys(rango)).toEqual(['2026-10-10', '2026-10-12'])
      expect(rango['2026-10-10']?.desayuno).toBe('Día 10')
      expect(rango['2026-10-12']?.desayuno).toBe('Día 12')
      expect(rango['2026-10-15']).toBeUndefined()
      expect(rango['2026-10-11']).toBeUndefined()
    })

    it('rastrea los días pendientes de sincronización y los marca como sincronizados', async () => {
      await guardarDiaLocal('user_test', '2026-10-14', { comida: 'Pasta' }, 'pending')
      await guardarDiaLocal('user_test', '2026-10-15', { comida: 'Arroz' }, 'synced')

      const pendientes = await obtenerDiasPendientes('user_test')
      expect(pendientes.length).toBe(1)
      expect(pendientes[0].fecha).toBe('2026-10-14')

      await marcarDiasSincronizados('user_test', ['2026-10-14'])
      const pendientesDespues = await obtenerDiasPendientes('user_test')
      expect(pendientesDespues.length).toBe(0)
    })

    it('guarda lotes de días con guardarDiasBatch', async () => {
      await guardarDiasBatch([
        { userId: 'user_test', fecha: '2026-10-01', desayuno: 'A' },
        { userId: 'user_test', fecha: '2026-10-02', desayuno: 'B' },
      ])

      const d1 = await obtenerDiaLocal('user_test', '2026-10-01')
      const d2 = await obtenerDiaLocal('user_test', '2026-10-02')
      expect(d1?.desayuno).toBe('A')
      expect(d2?.desayuno).toBe('B')
    })
  })

  describe('pesosDao', () => {
    it('guarda y consulta pesos excluyendo pendientes de borrado', async () => {
      await guardarPesoLocal('user_test', '2026-10-10', 75.5)
      await guardarPesoLocal('user_test', '2026-10-11', 75.2)

      const pesos = await obtenerPesosLocal('user_test')
      expect(pesos['2026-10-10']).toBe(75.5)
      expect(pesos['2026-10-11']).toBe(75.2)

      // Borrado suave
      await borrarPesoLocal('user_test', '2026-10-10')
      const pesosDespues = await obtenerPesosLocal('user_test')
      expect(pesosDespues['2026-10-10']).toBeUndefined()
      expect(pesosDespues['2026-10-11']).toBe(75.2)

      const pendientes = await obtenerPesosPendientes('user_test')
      expect(pendientes.some(p => p.fecha === '2026-10-10' && p.syncStatus === 'pending_delete')).toBe(true)

      // Borrado físico definitivo tras confirmación
      await eliminarPesoFisicoLocal('user_test', '2026-10-10')
      const pendientesTrasFisico = await obtenerPesosPendientes('user_test')
      expect(pendientesTrasFisico.some(p => p.fecha === '2026-10-10')).toBe(false)
    })

    it('marca pesos pendientes como sincronizados', async () => {
      await guardarPesoLocal('user_test', '2026-10-12', 74.8, 'pending')
      const pendientes = await obtenerPesosPendientes('user_test')
      expect(pendientes.length).toBe(1)

      await marcarPesoSincronizado('user_test', '2026-10-12')
      const pendientesDespues = await obtenerPesosPendientes('user_test')
      expect(pendientesDespues.length).toBe(0)
    })
  })

  describe('syncMetaDao', () => {
    it('guarda, lee y borra metadatos de sincronización', async () => {
      expect(await getMeta('last_sync')).toBeNull()

      await setMeta('last_sync', '1729000000000')
      expect(await getMeta('last_sync')).toBe('1729000000000')

      await removeMeta('last_sync')
      expect(await getMeta('last_sync')).toBeNull()
    })
  })
})
