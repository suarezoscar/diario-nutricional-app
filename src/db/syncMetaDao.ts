import { getDatabase } from './database'

/**
 * Obtiene el valor textual asociado a una clave en `sync_meta`.
 */
export async function getMeta(key: string): Promise<string | null> {
  const db = getDatabase()
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM sync_meta WHERE key = ?',
    [key],
  )
  return row ? row.value : null
}

/**
 * Guarda o actualiza una clave-valor en `sync_meta`.
 */
export async function setMeta(key: string, value: string): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    [key, value],
  )
}

/**
 * Elimina una clave de `sync_meta`.
 */
export async function removeMeta(key: string): Promise<void> {
  const db = getDatabase()
  await db.runAsync(
    'DELETE FROM sync_meta WHERE key = ?',
    [key],
  )
}
