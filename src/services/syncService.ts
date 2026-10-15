import { AppState, type AppStateStatus } from 'react-native'
import { pushCambiosLocales } from './sync/pushService'
import { pullCambiosRemotos } from './sync/pullService'

export { pushCambiosLocales, pullCambiosRemotos }

let syncEnProgreso = false
let debounceSyncTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Ejecuta un ciclo completo de sincronización bidireccional (Push -> Pull).
 * Evita ejecuciones concurrentes simultáneas.
 *
 * @param userId - Identificador único del usuario.
 */
export async function sincronizar(userId: string): Promise<void> {
  if (!userId || syncEnProgreso) return
  syncEnProgreso = true
  try {
    await pushCambiosLocales(userId)
    await pullCambiosRemotos(userId)
  } catch (err) {
    console.warn('Error general durante la sincronización:', err)
  } finally {
    syncEnProgreso = false
  }
}

/**
 * Solicita una sincronización postergada (*debounced*), ideal para autoguardados al escribir.
 *
 * @param userId - Identificador único del usuario.
 * @param delayMs - Milisegundos de espera antes de disparar la sincronización.
 */
export function solicitarSincronizacion(userId: string, delayMs = 1500): void {
  if (debounceSyncTimer) {
    clearTimeout(debounceSyncTimer)
  }
  debounceSyncTimer = setTimeout(() => {
    debounceSyncTimer = null
    void sincronizar(userId)
  }, delayMs)
}

/**
 * Configura los disparadores automáticos de sincronización:
 * - Al pasar la app a primer plano (`AppState === 'active'`).
 * Devuelve una función para limpiar las suscripciones al desmontar.
 *
 * @param userId - Identificador del usuario.
 * @returns Función de desuscripción y limpieza.
 */
export function iniciarEscuchadoresSync(userId: string): () => void {
  if (!userId) return () => {}

  void sincronizar(userId)

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      void sincronizar(userId)
    }
  }

  const subscription = AppState.addEventListener('change', handleAppStateChange)

  return () => {
    subscription.remove()
    if (debounceSyncTimer) {
      clearTimeout(debounceSyncTimer)
      debounceSyncTimer = null
    }
  }
}
