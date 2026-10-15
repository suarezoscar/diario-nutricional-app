import { getDatabase } from './database'
import type { Registro } from '../types'

/**
 * Representación tipada de una fila en la tabla SQLite `dias`.
 */
export interface DiaRow {
  userId: string
  fecha: string
  desayuno: string | null
  desayunoFuera: number | null
  mediaManana: string | null
  mediaMananaFuera: number | null
  comida: string | null
  comidaFuera: number | null
  merienda: string | null
  meriendaFuera: number | null
  cena: string | null
  cenaFuera: number | null
  agua: string | null
  peso: string | null
  ejercicio: string | null
  comentarios: string | null
  datosExtra: string | null
  updatedAt: number
  syncStatus: 'pending' | 'synced'
}

const CAMPOS_CONOCIDOS = new Set([
  'userId',
  'fecha',
  'desayuno',
  'desayunoFuera',
  'mediaManana',
  'mediaMananaFuera',
  'comida',
  'comidaFuera',
  'merienda',
  'meriendaFuera',
  'cena',
  'cenaFuera',
  'agua',
  'peso',
  'ejercicio',
  'comentarios',
  'updatedAt',
  'syncStatus',
])

/**
 * Convierte una fila de SQLite (`DiaRow`) en el objeto de dominio `Registro`.
 */
export function rowToRegistro(row: DiaRow): Registro {
  let extras: Record<string, unknown> = {}
  if (row.datosExtra) {
    try {
      extras = JSON.parse(row.datosExtra)
    } catch {
      // Ignorar JSON malformado
    }
  }

  const registro: Registro = {
    ...extras,
    userId: row.userId,
    fecha: row.fecha,
  }

  if (row.desayuno != null) registro.desayuno = row.desayuno
  if (row.desayunoFuera != null) registro.desayunoFuera = Boolean(row.desayunoFuera)
  if (row.mediaManana != null) registro.mediaManana = row.mediaManana
  if (row.mediaMananaFuera != null) registro.mediaMananaFuera = Boolean(row.mediaMananaFuera)
  if (row.comida != null) registro.comida = row.comida
  if (row.comidaFuera != null) registro.comidaFuera = Boolean(row.comidaFuera)
  if (row.merienda != null) registro.merienda = row.merienda
  if (row.meriendaFuera != null) registro.meriendaFuera = Boolean(row.meriendaFuera)
  if (row.cena != null) registro.cena = row.cena
  if (row.cenaFuera != null) registro.cenaFuera = Boolean(row.cenaFuera)
  if (row.agua != null) registro.agua = row.agua
  if (row.peso != null) registro.peso = row.peso
  if (row.ejercicio != null) registro.ejercicio = row.ejercicio
  if (row.comentarios != null) registro.comentarios = row.comentarios

  return registro
}

/**
 * Consulta un registro diario en la base de datos local SQLite.
 */
export async function obtenerDiaLocal(
  userId: string,
  fecha: string,
): Promise<Registro | null> {
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
  const merged: Partial<Registro> = {
    ...(anterior ?? {}),
    ...datos,
    userId,
    fecha,
  }

  const desayuno = merged.desayuno ?? null
  const desayunoFuera = merged.desayunoFuera ? 1 : 0
  const mediaManana = merged.mediaManana ?? null
  const mediaMananaFuera = merged.mediaMananaFuera ? 1 : 0
  const comida = merged.comida ?? null
  const comidaFuera = merged.comidaFuera ? 1 : 0
  const merienda = merged.merienda ?? null
  const meriendaFuera = merged.meriendaFuera ? 1 : 0
  const cena = merged.cena ?? null
  const cenaFuera = merged.cenaFuera ? 1 : 0
  const agua = merged.agua ?? null
  const peso = merged.peso ?? null
  const ejercicio = merged.ejercicio ?? null
  const comentarios = (merged as Record<string, unknown>).comentarios != null
    ? String((merged as Record<string, unknown>).comentarios)
    : null

  const extras: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(merged)) {
    if (!CAMPOS_CONOCIDOS.has(k) && v !== undefined) {
      extras[k] = v
    }
  }
  const datosExtra = Object.keys(extras).length > 0 ? JSON.stringify(extras) : null

  const db = getDatabase()
  await db.runAsync(
    `INSERT OR REPLACE INTO dias (
      userId, fecha, desayuno, desayunoFuera, mediaManana, mediaMananaFuera,
      comida, comidaFuera, merienda, meriendaFuera, cena, cenaFuera,
      agua, peso, ejercicio, comentarios, datosExtra, updatedAt, syncStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      fecha,
      desayuno,
      desayunoFuera,
      mediaManana,
      mediaMananaFuera,
      comida,
      comidaFuera,
      merienda,
      meriendaFuera,
      cena,
      cenaFuera,
      agua,
      peso,
      ejercicio,
      comentarios,
      datosExtra,
      updatedAt,
      syncStatus,
    ],
  )
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
export async function marcarDiasSincronizados(
  userId: string,
  fechas: string[],
): Promise<void> {
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
