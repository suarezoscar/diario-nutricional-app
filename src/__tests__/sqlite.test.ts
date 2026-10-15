import { describe, it, expect, beforeEach } from 'vitest'
import {
  guardarDiaLocal,
  obtenerDiaLocal,
  obtenerRangoLocal,
  obtenerDiasPendientes,
  marcarDiasSincronizados,
  guardarDiasBatch,
} from '../db/diasDao'
import { cerrarDatabase } from '../db/database'
import { __resetMockDb } from './__mocks__/expo-sqlite'

describe('Capa de Base de Datos SQLite Local-First (diasDao)', () => {
  beforeEach(() => {
    cerrarDatabase()
    __resetMockDb()
  })

  it('guarda y recupera un día completo', async () => {
    await guardarDiaLocal('user_test', '2026-10-15', {
      desayuno: 'Avena con fruta',
      desayunoFuera: false,
      comida: 'Lentejas',
      comidaFuera: true,
      agua: '2.0',
      peso: '74.5',
      ejercicio: '30 min carrera',
    })

    const dia = await obtenerDiaLocal('user_test', '2026-10-15')
    expect(dia).not.toBeNull()
    expect(dia?.desayuno).toBe('Avena con fruta')
    expect(dia?.desayunoFuera).toBe(false)
    expect(dia?.comida).toBe('Lentejas')
    expect(dia?.comidaFuera).toBe(true)
    expect(dia?.agua).toBe('2.0')
    expect(dia?.peso).toBe('74.5')
    expect(dia?.ejercicio).toBe('30 min carrera')
  })

  it('hace merge atómico preservando campos no modificados', async () => {
    await guardarDiaLocal('user_test', '2026-10-15', { desayuno: 'Café solo' })
    await guardarDiaLocal('user_test', '2026-10-15', { cena: 'Ensalada' })

    const dia = await obtenerDiaLocal('user_test', '2026-10-15')
    expect(dia?.desayuno).toBe('Café solo')
    expect(dia?.cena).toBe('Ensalada')
  })

  it('obtiene rangos de fechas ordenados cronológicamente', async () => {
    await guardarDiaLocal('user_test', '2026-10-10', { comida: 'Día 10' })
    await guardarDiaLocal('user_test', '2026-10-12', { comida: 'Día 12' })
    await guardarDiaLocal('user_test', '2026-10-15', { comida: 'Día 15' })

    const rango = await obtenerRangoLocal('user_test', '2026-10-10', '2026-10-12')
    expect(Object.keys(rango)).toEqual(['2026-10-10', '2026-10-12'])
    expect(rango['2026-10-10'].comida).toBe('Día 10')
    expect(rango['2026-10-12'].comida).toBe('Día 12')
  })

  it('detecta días con syncStatus pending y los marca synced', async () => {
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
