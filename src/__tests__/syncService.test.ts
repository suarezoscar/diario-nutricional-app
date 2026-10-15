import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pushCambiosLocales, pullCambiosRemotos, sincronizar } from '../services/syncService'
import { guardarDiaLocal, obtenerDiaLocal, obtenerDiasPendientes } from '../db/diasDao'
import { guardarPesoLocal, obtenerPesosPendientes } from '../db/pesosDao'
import { getMeta } from '../db/syncMetaDao'
import { cerrarDatabase } from '../db/database'
import { __resetMockDb } from './__mocks__/expo-sqlite'

const mockDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockSetDoc = vi.fn()
const mockDeleteDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
}))

vi.mock('../config/firebase', () => ({
  db: {},
}))

describe('Motor de Sincronización (syncService)', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
    vi.clearAllMocks()
    mockDoc.mockImplementation((_db, _col, id) => ({ id }))
  })

  it('pushCambiosLocales sube días pendientes y los marca como sincronizados', async () => {
    mockSetDoc.mockResolvedValue(undefined)

    // Crear un día local con estado pending
    await guardarDiaLocal('user_sync', '2026-10-15', { comida: 'Pollo con patatas' }, 'pending')

    const pendientesAntes = await obtenerDiasPendientes('user_sync')
    expect(pendientesAntes.length).toBe(1)

    await pushCambiosLocales('user_sync')

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user_sync_2026-10-15' }),
      expect.objectContaining({
        userId: 'user_sync',
        fecha: '2026-10-15',
        comida: 'Pollo con patatas',
      }),
      { merge: true },
    )

    const pendientesDespues = await obtenerDiasPendientes('user_sync')
    expect(pendientesDespues.length).toBe(0)
  })

  it('pushCambiosLocales procesa pesos pendientes y borrados suaves', async () => {
    mockSetDoc.mockResolvedValue(undefined)
    mockDeleteDoc.mockResolvedValue(undefined)

    // Crear peso modificado y peso pendiente de borrado
    await guardarPesoLocal('user_sync', '2026-10-14', 72.0, 'pending')
    await guardarPesoLocal('user_sync', '2026-10-15', 71.5, 'pending_delete')

    await pushCambiosLocales('user_sync')

    // 1 deleteDoc y 2 setDocs para el alta
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    expect(mockSetDoc).toHaveBeenCalled()

    const pendientes = await obtenerPesosPendientes('user_sync')
    expect(pendientes.length).toBe(0)
  })

  it('pullCambiosRemotos ejecuta el bootstrap inicial descargando datos existentes de Firestore', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            userId: 'user_bootstrap',
            fecha: '2026-10-10',
            desayuno: 'Fruta variada',
            updatedAt: 1729000000000,
          }),
        },
      ],
    }).mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            userId: 'user_bootstrap',
            fecha: '2026-10-10',
            peso: 68.5,
            updatedAt: 1729000000000,
          }),
        },
      ],
    })

    await pullCambiosRemotos('user_bootstrap')

    // El día debe residir en SQLite
    const dia = await obtenerDiaLocal('user_bootstrap', '2026-10-10')
    expect(dia?.desayuno).toBe('Fruta variada')

    // La marca de bootstrap debe estar guardada
    const meta = await getMeta('bootstrap_v1_user_bootstrap')
    expect(meta).toBe('true')
  })

  it('sincronizar ejecuta push y pull sin colisionar', async () => {
    mockSetDoc.mockResolvedValue(undefined)
    mockGetDocs.mockResolvedValue({ docs: [] })

    await guardarDiaLocal('user_full', '2026-10-15', { cena: 'Tortilla' }, 'pending')

    await sincronizar('user_full')

    const pendientes = await obtenerDiasPendientes('user_full')
    expect(pendientes.length).toBe(0)
  })
})
