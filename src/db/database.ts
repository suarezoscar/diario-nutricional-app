import * as SQLite from 'expo-sqlite'

const DB_NAME = 'diario_nutricional.db'

let dbInstance: SQLite.SQLiteDatabase | null = null

/**
 * Sentencia DDL completa para inicializar tablas e índices de la base de datos SQLite.
 */
export const ESQUEMA_INICIAL_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS dias (
    userId TEXT NOT NULL,
    fecha TEXT NOT NULL,
    desayuno TEXT,
    desayunoFuera INTEGER DEFAULT 0,
    mediaManana TEXT,
    mediaMananaFuera INTEGER DEFAULT 0,
    comida TEXT,
    comidaFuera INTEGER DEFAULT 0,
    merienda TEXT,
    meriendaFuera INTEGER DEFAULT 0,
    cena TEXT,
    cenaFuera INTEGER DEFAULT 0,
    agua TEXT,
    peso TEXT,
    ejercicio TEXT,
    comentarios TEXT,
    datosExtra TEXT,
    updatedAt INTEGER NOT NULL,
    syncStatus TEXT DEFAULT 'synced',
    PRIMARY KEY (userId, fecha)
  );

  CREATE INDEX IF NOT EXISTS idx_dias_user_fecha ON dias(userId, fecha);
  CREATE INDEX IF NOT EXISTS idx_dias_sync ON dias(userId, syncStatus);

  CREATE TABLE IF NOT EXISTS pesos (
    userId TEXT NOT NULL,
    fecha TEXT NOT NULL,
    peso REAL NOT NULL,
    updatedAt INTEGER NOT NULL,
    syncStatus TEXT DEFAULT 'synced',
    PRIMARY KEY (userId, fecha)
  );

  CREATE INDEX IF NOT EXISTS idx_pesos_user_fecha ON pesos(userId, fecha);

  CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`

/**
 * Inicializa el esquema de la base de datos si no existe.
 */
export function inicializarEsquema(db: SQLite.SQLiteDatabase): void {
  db.execSync(ESQUEMA_INICIAL_SQL)
}

/**
 * Obtiene la instancia activa de la base de datos SQLite local (Singleton).
 * Si no está abierta, la abre e inicializa el esquema de forma síncrona.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME)
    inicializarEsquema(dbInstance)
  }
  return dbInstance
}

/**
 * Cierra la conexión de base de datos activa (útil para pruebas o reinicio).
 */
export function cerrarDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.closeSync()
    } catch {
      // Ignorar si ya está cerrada
    }
    dbInstance = null
  }
}

/**
 * Permite inyectar una instancia de base de datos para entornos de prueba.
 */
export function setDatabaseForTesting(db: SQLite.SQLiteDatabase | null): void {
  dbInstance = db
}
