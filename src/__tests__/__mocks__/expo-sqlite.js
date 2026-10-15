class MockSQLiteDatabase {
  constructor(name) {
    this.name = name
    this.dias = new Map()
    this.pesos = new Map()
    this.meta = new Map()
  }

  execSync(_sql) {
    // Esquema SQLite: no-op en memoria para pruebas
  }

  async execAsync(_sql) {
    // No-op
  }

  closeSync() {
    this.dias.clear()
    this.pesos.clear()
    this.meta.clear()
  }

  async runAsync(sql, params = []) {
    // Inserción o reemplazo en dias
    if (sql.includes('INTO dias')) {
      const [
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
      ] = params
      const key = `${userId}_${fecha}`
      this.dias.set(key, {
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
      })
      return { lastInsertRowId: 1, changes: 1 }
    }

    // Actualización de syncStatus en dias
    if (sql.includes('UPDATE dias SET syncStatus')) {
      const [status, userId, fecha] = params
      const key = `${userId}_${fecha}`
      const existing = this.dias.get(key)
      if (existing) {
        existing.syncStatus = status
      }
      return { lastInsertRowId: 0, changes: 1 }
    }

    // Inserción o reemplazo en pesos
    if (sql.includes('INTO pesos')) {
      const [userId, fecha, peso, updatedAt, syncStatus] = params
      const key = `${userId}_${fecha}`
      this.pesos.set(key, { userId, fecha, peso, updatedAt, syncStatus })
      return { lastInsertRowId: 1, changes: 1 }
    }

    // Actualización en pesos (borrado suave o sincronización)
    if (sql.includes('UPDATE pesos SET syncStatus')) {
      if (sql.includes('updatedAt')) {
        const [status, updatedAt, userId, fecha] = params
        const key = `${userId}_${fecha}`
        const existing = this.pesos.get(key)
        if (existing) {
          existing.syncStatus = status
          existing.updatedAt = updatedAt
        }
      } else {
        const [status, userId, fecha] = params
        const key = `${userId}_${fecha}`
        const existing = this.pesos.get(key)
        if (existing) {
          existing.syncStatus = status
        }
      }
      return { lastInsertRowId: 0, changes: 1 }
    }

    // Borrado físico de pesos
    if (sql.includes('DELETE FROM pesos')) {
      const [userId, fecha] = params
      const key = `${userId}_${fecha}`
      this.pesos.delete(key)
      return { lastInsertRowId: 0, changes: 1 }
    }

    // Borrado de sync_meta
    if (sql.includes('DELETE FROM sync_meta')) {
      const [key] = params
      this.meta.delete(key)
      return { lastInsertRowId: 0, changes: 1 }
    }

    // Metadatos de sincronización
    if (sql.includes('INTO sync_meta')) {
      const [key, value] = params
      this.meta.set(key, value)
      return { lastInsertRowId: 1, changes: 1 }
    }

    return { lastInsertRowId: 0, changes: 0 }
  }

  async getFirstAsync(sql, params = []) {
    if (sql.includes('FROM dias WHERE userId = ? AND fecha = ?')) {
      const [userId, fecha] = params
      const key = `${userId}_${fecha}`
      return this.dias.get(key) || null
    }
    if (sql.includes('FROM sync_meta WHERE key = ?')) {
      const [key] = params
      const val = this.meta.get(key)
      return val !== undefined ? { value: val } : null
    }
    return null
  }

  async getAllAsync(sql, params = []) {
    if (sql.includes('FROM dias WHERE userId = ? AND fecha >= ? AND fecha <= ?')) {
      const [userId, desde, hasta] = params
      const results = []
      for (const row of this.dias.values()) {
        if (row.userId === userId && row.fecha >= desde && row.fecha <= hasta) {
          results.push(row)
        }
      }
      results.sort((a, b) => a.fecha.localeCompare(b.fecha))
      return results
    }

    if (sql.includes('FROM dias WHERE userId = ? AND syncStatus = ?')) {
      const [userId, status] = params
      const results = []
      for (const row of this.dias.values()) {
        if (row.userId === userId && row.syncStatus === status) {
          results.push(row)
        }
      }
      return results
    }

    if (sql.includes("FROM pesos WHERE userId = ? AND syncStatus != 'pending_delete'")) {
      const [userId] = params
      const results = []
      for (const row of this.pesos.values()) {
        if (row.userId === userId && row.syncStatus !== 'pending_delete' && row.syncStatus !== 'deleted') {
          results.push(row)
        }
      }
      results.sort((a, b) => a.fecha.localeCompare(b.fecha))
      return results
    }

    if (sql.includes('FROM pesos WHERE userId = ? AND syncStatus IN')) {
      const [userId] = params
      const results = []
      for (const row of this.pesos.values()) {
        if (row.userId === userId && (row.syncStatus === 'pending' || row.syncStatus === 'pending_delete')) {
          results.push(row)
        }
      }
      return results
    }

    return []
  }

  async withTransactionAsync(task) {
    return await task()
  }
}

let defaultDb = new MockSQLiteDatabase('default')

export function openDatabaseSync(_name) {
  return defaultDb
}

export async function openDatabaseAsync(_name) {
  return defaultDb
}

export function __resetMockDb() {
  defaultDb = new MockSQLiteDatabase('default')
}
