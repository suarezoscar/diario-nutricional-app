import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  where,
  limit,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { idDocumento } from './registroService'
import {
  obtenerPesosLocal,
  guardarPesoLocal,
  borrarPesoLocal,
  eliminarPesoFisicoLocal,
  marcarPesoSincronizado,
  guardarPesosBatch,
} from '../db/pesosDao'
import { guardarDiaLocal, marcarDiasSincronizados } from '../db/diasDao'
import type { PesosPorFecha, PuntoPeso } from '../types'

/**
 * Carga los pesos del usuario indexados por fecha.
 * Arquitectura Local-First:
 * 1. Lee primero de SQLite local (0 ms).
 * 2. Si no hay datos locales, consulta Firestore y puebla SQLite.
 */
export async function cargarPesos(userId: string): Promise<PesosPorFecha> {
  // 1. Lectura inmediata desde SQLite
  const local = await obtenerPesosLocal(userId)
  if (Object.keys(local).length > 0) {
    return local
  }

  // 2. Fallback a Firestore si la base local está vacía
  try {
    const q = query(
      collection(db, 'peso'),
      where('userId', '==', userId),
      limit(365),
    )
    const snap = await getDocs(q)
    const mapa: PesosPorFecha = {}
    const loteDescargado: Array<{ fecha: string; peso: number; updatedAt?: number }> = []

    if (snap && typeof snap.forEach === 'function') {
      snap.forEach(d => {
        const data = d.data()
        const valor = typeof data.peso === 'number' ? data.peso : parseFloat(data.peso)
        if (!isNaN(valor) && data.fecha) {
          mapa[data.fecha] = valor
          loteDescargado.push({
            fecha: data.fecha,
            peso: valor,
            updatedAt: Number(data.updatedAt) || Date.now(),
          })
        }
      })
    }

    if (loteDescargado.length > 0) {
      await guardarPesosBatch(userId, loteDescargado)
    }

    return mapa
  } catch (err) {
    console.warn('Error al cargar pesos desde Firestore (modo offline):', err)
    return local
  }
}

/**
 * Guarda un nuevo registro de peso.
 * Arquitectura Local-First:
 * 1. Guarda de inmediato en SQLite (tanto en la tabla `pesos` como en `dias.peso`).
 * 2. Sincroniza con Firestore en segundo plano con tolerancia offline.
 */
export async function guardarPeso(
  userId: string,
  fecha: string,
  peso: number,
): Promise<void> {
  const ahora = Date.now()
  const idDoc = idDocumento(userId, fecha)

  // 1. Guardar inmediatamente en SQLite
  await guardarPesoLocal(userId, fecha, peso, 'pending', ahora)
  await guardarDiaLocal(userId, fecha, { peso: peso.toString() }, 'pending', ahora)

  // 2. Persistir en Firestore
  try {
    await setDoc(doc(db, 'peso', idDoc), { userId, fecha, peso, updatedAt: ahora }, { merge: true })
    await setDoc(
      doc(db, 'registros', idDoc),
      { userId, fecha, peso: peso.toString(), updatedAt: ahora },
      { merge: true },
    )
    await marcarPesoSincronizado(userId, fecha)
    await marcarDiasSincronizados(userId, [fecha])
  } catch (err) {
    console.warn(`Persistencia de peso en Firestore aplazada para ${fecha} (modo offline):`, err)
  }
}

/**
 * Elimina un registro de peso de una fecha concreta.
 * Arquitectura Local-First:
 * 1. Marca de inmediato el borrado en SQLite (0 ms).
 * 2. Ejecuta el borrado en Firestore y confirma la eliminación física en SQLite.
 */
export async function borrarPeso(userId: string, fecha: string): Promise<void> {
  const ahora = Date.now()
  const idDoc = idDocumento(userId, fecha)

  // 1. Borrado suave en SQLite
  await borrarPesoLocal(userId, fecha, ahora)
  await guardarDiaLocal(userId, fecha, { peso: '' }, 'pending', ahora)

  // 2. Borrado en Firestore
  try {
    await deleteDoc(doc(db, 'peso', idDoc))
    await setDoc(doc(db, 'registros', idDoc), { peso: '', updatedAt: ahora }, { merge: true })
    await eliminarPesoFisicoLocal(userId, fecha)
    await marcarDiasSincronizados(userId, [fecha])
  } catch (err) {
    console.warn(`Borrado de peso en Firestore aplazado para ${fecha} (modo offline):`, err)
  }
}

/**
 * Transforma un diccionario de pesos por fecha en una lista ordenada para la gráfica.
 */
export function transformarChartData(pesos: PesosPorFecha): PuntoPeso[] {
  return Object.entries(pesos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, peso]) => ({ fecha, peso }))
}
