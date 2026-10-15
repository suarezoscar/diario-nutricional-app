import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cargarPesos, guardarPeso, borrarPeso, transformarChartData } from '../services/pesoService'
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

describe('Servicio de Pesos (pesoService) - Local-First', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
    vi.clearAllMocks()
    mockDoc.mockImplementation((_db, _col, id) => ({ id }))
  })

  it('transformarChartData ordena cronológicamente los puntos de peso', () => {
    const input = {
      '2026-10-14': 75.2,
      '2026-10-10': 76.0,
      '2026-10-12': 75.8,
    }
    const resultado = transformarChartData(input)
    expect(resultado).toEqual([
      { fecha: '2026-10-10', peso: 76.0 },
      { fecha: '2026-10-12', peso: 75.8 },
      { fecha: '2026-10-14', peso: 75.2 },
    ])
  })

  it('guardarPeso persiste en SQLite y realiza push a Firestore', async () => {
    mockSetDoc.mockResolvedValue(undefined)

    await guardarPeso('user_peso', '2026-10-15', 74.5)

    // Se debe haber llamado a setDoc para la colección 'peso' y para 'registros'
    expect(mockSetDoc).toHaveBeenCalledTimes(2)

    // La lectura subsiguiente desde SQLite es instantánea y devuelve 74.5
    const pesosLocales = await cargarPesos('user_peso')
    expect(pesosLocales['2026-10-15']).toBe(74.5)
  })

  it('borrarPeso elimina de SQLite y borra de Firestore', async () => {
    mockSetDoc.mockResolvedValue(undefined)
    mockDeleteDoc.mockResolvedValue(undefined)

    // Guardar peso inicial
    await guardarPeso('user_peso', '2026-10-15', 74.5)

    // Borrar peso
    await borrarPeso('user_peso', '2026-10-15')

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)

    // Comprobar que en local ya no aparece
    const pesosLocales = await cargarPesos('user_peso')
    expect(pesosLocales['2026-10-15']).toBeUndefined()
  })

  it('tolera fallos de red (offline) guardando de forma segura en local sin lanzar excepción', async () => {
    mockSetDoc.mockRejectedValue(new Error('Network error (offline)'))

    // No debe lanzar excepción
    await expect(guardarPeso('user_peso', '2026-10-15', 73.8)).resolves.not.toThrow()

    // El dato persiste localmente en SQLite
    const pesosLocales = await cargarPesos('user_peso')
    expect(pesosLocales['2026-10-15']).toBe(73.8)
  })
})
