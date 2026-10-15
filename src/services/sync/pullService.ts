import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { hoy, desplazarDia } from '../../utils/fechas'
import { guardarDiaLocal, obtenerDiaLocal } from '../../db/diasDao'
import { guardarPesoLocal } from '../../db/pesosDao'
import { getMeta, setMeta } from '../../db/syncMetaDao'
import type { Registro } from '../../types'

/**
 * Realiza el bootstrap inicial descargando datos existentes desde Firestore a SQLite.
 */
async function realizarBootstrap(userId: string, bootstrapKey: string): Promise<void> {
  const qDias = query(collection(db, 'registros'), where('userId', '==', userId), limit(1000))
  const snapDias = await getDocs(qDias)
  for (const d of snapDias.docs) {
    const datos = d.data() as Registro
    if (datos.fecha) {
      const local = await obtenerDiaLocal(userId, datos.fecha)
      if (!local || (local as Record<string, unknown>).syncStatus !== 'pending') {
        await guardarDiaLocal(userId, datos.fecha, datos, 'synced', Number(datos.updatedAt) || Date.now())
      }
    }
  }

  const qPesos = query(collection(db, 'peso'), where('userId', '==', userId), limit(500))
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
}

/**
 * Realiza la descarga incremental de registros y pesos recientes.
 */
async function realizarPullIncremental(userId: string): Promise<void> {
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

  const qPesosRecientes = query(collection(db, 'peso'), where('userId', '==', userId), limit(30))
  const snapPesosRecientes = await getDocs(qPesosRecientes)
  for (const d of snapPesosRecientes.docs) {
    const data = d.data()
    const valor = typeof data.peso === 'number' ? data.peso : parseFloat(data.peso)
    if (data.fecha && !isNaN(valor)) {
      await guardarPesoLocal(userId, data.fecha, valor, 'synced', Number(data.updatedAt) || Date.now())
    }
  }

  await setMeta(`last_sync_${userId}`, String(Date.now()))
}

/**
 * Descarga desde Firestore los cambios remotos y actualiza SQLite local.
 *
 * @param userId - Identificador único del usuario.
 */
export async function pullCambiosRemotos(userId: string): Promise<void> {
  const bootstrapKey = `bootstrap_v1_${userId}`
  const yaBootstrappeado = await getMeta(bootstrapKey)

  if (!yaBootstrappeado) {
    try {
      await realizarBootstrap(userId, bootstrapKey)
      return
    } catch (err) {
      console.warn('Error en bootstrap inicial desde Firestore:', err)
      return
    }
  }

  try {
    await realizarPullIncremental(userId)
  } catch (err) {
    console.warn('Error en pull incremental desde Firestore:', err)
  }
}
