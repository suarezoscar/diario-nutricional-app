import { describe, it, expect, vi, beforeEach } from 'vitest'
import { idDocumento, cargarDia, guardarDia } from '../services/registroService'
import { cerrarDatabase } from '../db/database'
import { __resetMockDb } from './__mocks__/expo-sqlite'

const mockDoc = vi.fn()
const mockGetDoc = vi.fn()
const mockSetDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('../config/firebase', () => ({
  db: {},
}))

describe('Servicio de Registros Nutricionales (registroService)', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
    vi.clearAllMocks()
    mockDoc.mockImplementation((_db, _col, id) => ({ id }))
  })

  it('genera correctamente el idDocumento con el formato userId_fecha', () => {
    expect(idDocumento('usuario123', '2026-10-14')).toBe('usuario123_2026-10-14')
    expect(idDocumento('erica_pixel6a', '2026-05-01')).toBe('erica_pixel6a_2026-05-01')
  })

  it('cargarDia devuelve { userId, fecha } si el documento no existe en Firestore (día vacío)', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    })

    const resultado = await cargarDia('erica_pixel6a', '2026-10-14')
    expect(resultado).toEqual({
      userId: 'erica_pixel6a',
      fecha: '2026-10-14',
    })
  })

  it('cargarDia devuelve el registro completo si el documento existe', async () => {
    const mockData = {
      userId: 'erica_pixel6a',
      fecha: '2026-10-13',
      desayuno: 'Café con tostadas',
      comida: 'Ensalada César',
      agua: '2.0',
    }
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData,
    })

    const resultado = await cargarDia('erica_pixel6a', '2026-10-13')
    expect(resultado).toEqual(mockData)
  })

  it('guardarDia genera el payload con merge y garantiza que los datos se asignen a la fecha destino', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined)

    const datosAGuardar = {
      desayuno: 'Avena con fruta',
      agua: '1.5',
    }

    await guardarDia('erica_pixel6a', '2026-10-14', datosAGuardar)

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'erica_pixel6a_2026-10-14' }),
      {
        desayuno: 'Avena con fruta',
        agua: '1.5',
        userId: 'erica_pixel6a',
        fecha: '2026-10-14',
        updatedAt: expect.any(Number),
      },
      { merge: true },
    )
  })
})
