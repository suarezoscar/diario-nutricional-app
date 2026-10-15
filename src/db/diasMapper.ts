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

export const CAMPOS_CONOCIDOS = new Set([
  'userId', 'fecha', 'desayuno', 'desayunoFuera', 'mediaManana', 'mediaMananaFuera',
  'comida', 'comidaFuera', 'merienda', 'meriendaFuera', 'cena', 'cenaFuera',
  'agua', 'peso', 'ejercicio', 'comentarios', 'updatedAt', 'syncStatus',
])

/**
 * Convierte una fila de SQLite (`DiaRow`) en el objeto de dominio `Registro`.
 *
 * @param row - Fila cruda obtenida de SQLite.
 * @returns Objeto de dominio `Registro` normalizado.
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

  const registro: Registro = { ...extras, userId: row.userId, fecha: row.fecha }
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
 * Serializa un registro a la tupla de parámetros posicionales requeridos para INSERT/REPLACE en SQLite.
 *
 * @param merged - Registro combinado con valores a persistir.
 * @param userId - ID de usuario.
 * @param fecha - Fecha en formato YYYY-MM-DD.
 * @param syncStatus - Estado de sincronización ('pending' | 'synced').
 * @param updatedAt - Timestamp unix de la actualización.
 * @returns Array con los 19 valores para la consulta SQL.
 */
export function registroToRowParams(
  merged: Partial<Registro>,
  userId: string,
  fecha: string,
  syncStatus: 'pending' | 'synced',
  updatedAt: number,
): (string | number | null)[] {
  const extras: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(merged)) {
    if (!CAMPOS_CONOCIDOS.has(k) && v !== undefined) {
      extras[k] = v
    }
  }
  const datosExtra = Object.keys(extras).length > 0 ? JSON.stringify(extras) : null

  return [
    userId,
    fecha,
    merged.desayuno ?? null,
    merged.desayunoFuera ? 1 : 0,
    merged.mediaManana ?? null,
    merged.mediaMananaFuera ? 1 : 0,
    merged.comida ?? null,
    merged.comidaFuera ? 1 : 0,
    merged.merienda ?? null,
    merged.meriendaFuera ? 1 : 0,
    merged.cena ?? null,
    merged.cenaFuera ? 1 : 0,
    merged.agua ?? null,
    merged.peso ?? null,
    merged.ejercicio ?? null,
    (merged as Record<string, unknown>).comentarios != null
      ? String((merged as Record<string, unknown>).comentarios)
      : null,
    datosExtra,
    updatedAt,
    syncStatus,
  ]
}
