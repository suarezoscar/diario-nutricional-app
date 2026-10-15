import { describe, it, expect, beforeEach } from 'vitest'
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

describe('Capa de Pesos y Metadatos SQLite Local-First', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
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
