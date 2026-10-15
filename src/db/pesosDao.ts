import { getDatabase } from './database'

/**
 * Representación de una fila de la tabla `pesos`.
 */
export interface PesoRow {
  userId: string
  fecha: string
  peso: number
  updatedAt: number
  syncStatus: 'pending' | 'synced' | 'pending_delete'
}

/**
 * Consulta todos los pesos activos de un usuario ordenados por fecha de forma ascendente.
 * Excluye los que están marcados para borrado pendiente.
 */
export async function obtenerPesosLocal(userId: string): Promise<Record<string, number>> {
  const db = getDatabase()
  const rows = await db.getAllAsync<PesoRow>(
    "SELECT fecha, peso FROM pesos WHERE userId = ? AND syncStatus != 'pending_delete' ORDER BY fecha ASC",
    [userId],
  )
  const mapa: Record<string, number> = {}
  for (const row of rows) {
    mapa[row.fecha] = row.peso
  }
  return mapa
}

/**
 * Guarda o actualiza un registro de peso en SQLite.
 */
export async function guardarPesoLocal(
  userId: string,
  fecha: string,
  peso: number,
  syncStatus: 'pending' | 'synced' | 'pending_delete' = 'pending',
  updatedAt: number = Date.now(),
): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'INSERT OR REPLACE INTO pesos (userId, fecha, peso, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?)',
    [userId, fecha, peso, updatedAt, syncStatus],
  )
}

/**
 * Marca un registro de peso como pendiente de borrado (`pending_delete`).
 */
export async function borrarPesoLocal(
  userId: string,
  fecha: string,
  updatedAt: number = Date.now(),
): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'UPDATE pesos SET syncStatus = ?, updatedAt = ? WHERE userId = ? AND fecha = ?',
    ['pending_delete', updatedAt, userId, fecha],
  )
}

/**
 * Elimina físicamente la fila de peso en SQLite tras confirmación de la nube.
 */
export async function eliminarPesoFisicoLocal(
  userId: string,
  fecha: string,
): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'DELETE FROM pesos WHERE userId = ? AND fecha = ?',
    [userId, fecha],
  )
}

/**
 * Recupera los registros de peso pendientes de sincronización (tanto altas/modificaciones como borrados).
 */
export async function obtenerPesosPendientes(
  userId: string,
): Promise<PesoRow[]> {
  const db = getDatabase()
  return await db.getAllAsync<PesoRow>(
    "SELECT * FROM pesos WHERE userId = ? AND syncStatus IN ('pending', 'pending_delete')",
    [userId],
  )
}

/**
 * Marca un registro de peso como sincronizado (`synced`).
 */
export async function marcarPesoSincronizado(
  userId: string,
  fecha: string,
): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'UPDATE pesos SET syncStatus = ? WHERE userId = ? AND fecha = ?',
    ['synced', userId, fecha],
  )
}

/**
 * Guarda un lote de pesos descargados desde la nube.
 */
export async function guardarPesosBatch(
  userId: string,
  pesos: Array<{ fecha: string; peso: number; updatedAt?: number }>,
): Promise<void> {
  if (pesos.length === 0) return
  const db = getDatabase()
  await db.withTransactionAsync(async () => {
    for (const p of pesos) {
      await guardarPesoLocal(userId, p.fecha, p.peso, 'synced', p.updatedAt ?? Date.now())
    }
  })
}
