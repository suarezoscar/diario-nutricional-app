import { AppState, type AppStateStatus } from 'react-native'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { hoy, desplazarDia } from '../utils/fechas'
import {
  obtenerDiasPendientes,
  marcarDiasSincronizados,
  guardarDiaLocal,
  obtenerDiaLocal,
} from '../db/diasDao'
import {
  obtenerPesosPendientes,
  marcarPesoSincronizado,
  eliminarPesoFisicoLocal,
  guardarPesoLocal,
  obtenerPesosLocal,
} from '../db/pesosDao'
import { getMeta, setMeta } from '../db/syncMetaDao'
import type { Registro } from '../types'

/**
 * Identificador único compuesto para Firestore: `${userId}_${fecha}`.
 */
function idDocumento(userId: string, fecha: string): string {
  return `${userId}_${fecha}`
}

let syncEnProgreso = false
let debounceSyncTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Sube a Firestore todos los cambios pendientes registrados localmente en SQLite.
 */
export async function pushCambiosLocales(userId: string): Promise<void> {
  // 1. Sincronizar días pendientes
  const diasPendientes = await obtenerDiasPendientes(userId)
  for (const dia of diasPendientes) {
    try {
      const idDoc = idDocumento(userId, dia.fecha)
      const docRef = doc(db, 'registros', idDoc)

      // Extraer campos para Firestore sin el metadato local syncStatus
      const { syncStatus: _s, ...payload } = dia
      await setDoc(
        docRef,
        {
          ...payload,
          updatedAt: dia.updatedAt || Date.now(),
        },
        { merge: true },
      )
      await marcarDiasSincronizados(userId, [dia.fecha])
    } catch (err) {
      console.warn(`Error al subir día ${dia.fecha} a Firestore:`, err)
    }
  }

  // 2. Sincronizar pesos pendientes
  const pesosPendientes = await obtenerPesosPendientes(userId)
  for (const p of pesosPendientes) {
    const idDoc = idDocumento(userId, p.fecha)
    try {
      if (p.syncStatus === 'pending_delete') {
        await deleteDoc(doc(db, 'peso', idDoc))
        await setDoc(doc(db, 'registros', idDoc), { peso: '', updatedAt: Date.now() }, { merge: true })
        await eliminarPesoFisicoLocal(userId, p.fecha)
      } else {
        await setDoc(
          doc(db, 'peso', idDoc),
          { userId, fecha: p.fecha, peso: p.peso, updatedAt: p.updatedAt },
          { merge: true },
        )
        await setDoc(
          doc(db, 'registros', idDoc),
          { userId, fecha: p.fecha, peso: p.peso.toString(), updatedAt: p.updatedAt },
          { merge: true },
        )
        await marcarPesoSincronizado(userId, p.fecha)
      }
    } catch (err) {
      console.warn(`Error al sincronizar peso ${p.fecha} a Firestore:`, err)
    }
  }
}

/**
 * Descarga desde Firestore los cambios remotos y actualiza SQLite.
 * Si es el primer inicio, descarga el historial completo (bootstrap).
 * Si ya se hizo bootstrap, solo descarga cambios incrementales y días recientes.
 */
export async function pullCambiosRemotos(userId: string): Promise<void> {
  const bootstrapKey = `bootstrap_v1_${userId}`
  const yaBootstrappeado = await getMeta(bootstrapKey)

  if (!yaBootstrappeado) {
    // Bootstrap inicial: descargar hasta 1000 registros y 500 pesos existentes
    try {
      const qDias = query(
        collection(db, 'registros'),
        where('userId', '==', userId),
        limit(1000),
      )
      const snapDias = await getDocs(qDias)
      for (const d of snapDias.docs) {
        const datos = d.data() as Registro
        if (datos.fecha) {
          // Solo insertar si no hay cambios locales pendientes para ese día
          const local = await obtenerDiaLocal(userId, datos.fecha)
          if (!local || (local as Record<string, unknown>).syncStatus !== 'pending') {
            await guardarDiaLocal(userId, datos.fecha, datos, 'synced', Number(datos.updatedAt) || Date.now())
          }
        }
      }

      const qPesos = query(
        collection(db, 'peso'),
        where('userId', '==', userId),
        limit(500),
      )
      const snapPesos = await getDocs(qPesos)
      for (const d of snapPesos.docs) {
        const data = d.data()
        const valor = typeof data.peso === 'number' ? data.peso : parseFloat(data.peso)
        if (data.fecha && !isNaN(valor)) {
          await guardarPesoLocal(userId, data.fecha, valor, 'synced', Number(data.updatedAt) || Date.now())
        }
      }

      await setMeta(bootstrapKey, 'true')
      await setMeta(`last_sync_${userId}`, String(Date.now()))
      return
    } catch (err) {
      console.warn('Error en bootstrap inicial desde Firestore:', err)
      return
    }
  }

  // Sincronización incremental:
  const lastSyncStr = await getMeta(`last_sync_${userId}`)
  const lastSync = Number(lastSyncStr) || 0

  try {
    // 1. Descargar registros con updatedAt superior al último sync (si los hay)
    if (lastSync > 0) {
      try {
        const qModificados = query(
          collection(db, 'registros'),
          where('userId', '==', userId),
          where('updatedAt', '>', lastSync),
          limit(100),
        )
        const snapMod = await getDocs(qModificados)
        for (const d of snapMod.docs) {
          const datos = d.data() as Registro
          if (datos.fecha) {
            const local = await obtenerDiaLocal(userId, datos.fecha)
            if (!local || (local as Record<string, unknown>).syncStatus !== 'pending') {
              await guardarDiaLocal(userId, datos.fecha, datos, 'synced', Number(datos.updatedAt) || Date.now())
            }
          }
        }
      } catch {
        // Puede fallar si falta índice compuesto en Firestore; continuamos con el fallback de días recientes
      }
    }

    // 2. Descargar los últimos 14 días para capturar ediciones de la webapp (que no guardan updatedAt)
    const fechaDesde = desplazarDia(hoy(), -14)
    const qRecientes = query(
      collection(db, 'registros'),
      where('userId', '==', userId),
      where('fecha', '>=', fechaDesde),
      limit(20),
    )
    const snapRecientes = await getDocs(qRecientes)
    for (const d of snapRecientes.docs) {
      const datos = d.data() as Registro
      if (datos.fecha) {
        const local = await obtenerDiaLocal(userId, datos.fecha)
        if (!local || (local as Record<string, unknown>).syncStatus !== 'pending') {
          await guardarDiaLocal(userId, datos.fecha, datos, 'synced', Number(datos.updatedAt) || Date.now())
        }
      }
    }

    // 3. Descargar pesos recientes
    const qPesosRecientes = query(
      collection(db, 'peso'),
      where('userId', '==', userId),
      limit(30),
    )
    const snapPesosRecientes = await getDocs(qPesosRecientes)
    for (const d of snapPesosRecientes.docs) {
      const data = d.data()
      const valor = typeof data.peso === 'number' ? data.peso : parseFloat(data.peso)
      if (data.fecha && !isNaN(valor)) {
        await guardarPesoLocal(userId, data.fecha, valor, 'synced', Number(data.updatedAt) || Date.now())
      }
    }

    await setMeta(`last_sync_${userId}`, String(Date.now()))
  } catch (err) {
    console.warn('Error en pull incremental desde Firestore:', err)
  }
}

/**
 * Ejecuta un ciclo completo de sincronización bidireccional (Push -> Pull).
 * Evita ejecuciones concurrentes simultáneas.
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
 */
export function iniciarEscuchadoresSync(userId: string): () => void {
  if (!userId) return () => {}

  // Disparar sincronización inmediata al inicio
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
