import { getDatabase } from './database'
import type { Registro } from '../types'
import {
  type DiaRow,
  rowToRegistro,
  registroToRowParams,
} from './diasMapper'

export type { DiaRow }
export { rowToRegistro }

const SQL_INSERT_DIA = `INSERT OR REPLACE INTO dias (
  userId, fecha, desayuno, desayunoFuera, mediaManana, mediaMananaFuera,
  comida, comidaFuera, merienda, meriendaFuera, cena, cenaFuera,
  agua, peso, ejercicio, comentarios, datosExtra, updatedAt, syncStatus
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

/**
 * Consulta un registro diario en la base de datos local SQLite.
 */
export async function obtenerDiaLocal(userId: string, fecha: string): Promise<Registro | null> {
  const db = getDatabase()
  const row = await db.getFirstAsync<DiaRow>(
    'SELECT * FROM dias WHERE userId = ? AND fecha = ?',
    [userId, fecha],
  )
  if (!row) return null
  return rowToRegistro(row)
}

/**
 * Guarda o actualiza (merge) un registro diario en SQLite de forma atómica.
 */
export async function guardarDiaLocal(
  userId: string,
  fecha: string,
  datos: Partial<Registro>,
  syncStatus: 'pending' | 'synced' = 'pending',
  updatedAt: number = Date.now(),
): Promise<void> {
  const anterior = await obtenerDiaLocal(userId, fecha)
  const merged: Partial<Registro> = { ...(anterior ?? {}), ...datos, userId, fecha }
  const params = registroToRowParams(merged, userId, fecha, syncStatus, updatedAt)

  const db = getDatabase()
  await db.runAsync(SQL_INSERT_DIA, params)
}

/**
 * Consulta un intervalo de registros comprendidos entre `desde` y `hasta`.
 */
export async function obtenerRangoLocal(
  userId: string,
  desde: string,
  hasta: string,
): Promise<Record<string, Registro>> {
  const db = getDatabase()
  const rows = await db.getAllAsync<DiaRow>(
    'SELECT * FROM dias WHERE userId = ? AND fecha >= ? AND fecha <= ? ORDER BY fecha ASC',
    [userId, desde, hasta],
  )
  const mapa: Record<string, Registro> = {}
  for (const row of rows) {
    mapa[row.fecha] = rowToRegistro(row)
  }
  return mapa
}

/**
 * Recupera todos los registros locales con sincronización pendiente.
 */
export async function obtenerDiasPendientes(
  userId: string,
): Promise<Array<Registro & { updatedAt: number }>> {
  const db = getDatabase()
  const rows = await db.getAllAsync<DiaRow>(
    'SELECT * FROM dias WHERE userId = ? AND syncStatus = ?',
    [userId, 'pending'],
  )
  return rows.map(r => ({
    ...rowToRegistro(r),
    updatedAt: r.updatedAt,
  }))
}

/**
 * Marca como sincronizados los registros correspondientes a las fechas dadas.
 */
export async function marcarDiasSincronizados(userId: string, fechas: string[]): Promise<void> {
  if (fechas.length === 0) return
  const db = getDatabase()
  for (const fecha of fechas) {
    await db.runAsync(
      'UPDATE dias SET syncStatus = ? WHERE userId = ? AND fecha = ?',
      ['synced', userId, fecha],
    )
  }
}

/**
 * Inserción masiva o reemplazo de registros (usado en bootstrap o pull).
 */
export async function guardarDiasBatch(
  registros: Array<Registro & { updatedAt?: number; syncStatus?: 'pending' | 'synced' }>,
): Promise<void> {
  if (registros.length === 0) return
  const db = getDatabase()
  await db.withTransactionAsync(async () => {
    for (const r of registros) {
      const updatedAt = r.updatedAt ?? Date.now()
      const syncStatus = r.syncStatus ?? 'synced'
      await guardarDiaLocal(r.userId, r.fecha, r, syncStatus, updatedAt)
    }
  })
}
