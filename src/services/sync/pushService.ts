import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import {
  obtenerDiasPendientes,
  marcarDiasSincronizados,
} from '../../db/diasDao'
import {
  obtenerPesosPendientes,
  marcarPesoSincronizado,
  eliminarPesoFisicoLocal,
} from '../../db/pesosDao'

/**
 * Identificador único compuesto para Firestore: `${userId}_${fecha}`.
 */
function idDocumento(userId: string, fecha: string): string {
  return `${userId}_${fecha}`
}

/**
 * Sube a Firestore todos los cambios pendientes registrados localmente en SQLite.
 * Procesa tanto modificaciones de días como altas y bajas de pesos.
 *
 * @param userId - Identificador único del usuario.
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
