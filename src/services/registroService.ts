import { collection, doc, getDoc, getDocs, query, setDoc, where, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import {
  obtenerDiaLocal,
  guardarDiaLocal,
  obtenerRangoLocal,
  marcarDiasSincronizados,
  guardarDiasBatch,
} from '../db/diasDao'
import type { Registro } from '../types'

/**
 * Genera el identificador único compuesto para un documento en la colección de registros.
 *
 * @param userId - Identificador único de usuario de Firebase Authentication.
 * @param fecha - Fecha en formato estándar ISO `YYYY-MM-DD`.
 * @returns Cadena con el formato `${userId}_${fecha}`.
 */
export function idDocumento(userId: string, fecha: string): string {
  return `${userId}_${fecha}`
}

/**
 * Recupera el registro nutricional de un usuario para una fecha determinada.
 * Prioriza SQLite local (0 ms); si no existe, consulta Firestore y cachea localmente.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha a consultar en formato `YYYY-MM-DD`.
 * @returns Datos parciales o completos del registro.
 */
export async function cargarDia(userId: string, fecha: string): Promise<Partial<Registro>> {
  const local = await obtenerDiaLocal(userId, fecha)
  if (local) return local

  try {
    const docRef = doc(db, 'registros', idDocumento(userId, fecha))
    const snap = await getDoc(docRef)
    if (!snap.exists()) return { userId, fecha }

    const remoto = snap.data() as Registro
    await guardarDiaLocal(userId, fecha, remoto, 'synced', Number(remoto.updatedAt) || Date.now())
    return remoto
  } catch (err) {
    console.warn(`No se pudo consultar Firestore para la fecha ${fecha} (modo offline):`, err)
    return { userId, fecha }
  }
}

/**
 * Guarda o actualiza los datos nutricionales de un día específico.
 * Escribe inmediatamente en SQLite (0 ms) e intenta persistir en Firestore en background.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha en formato `YYYY-MM-DD`.
 * @param datos - Campos de comida, agua, peso o ejercicio a persistir.
 */
export async function guardarDia(
  userId: string,
  fecha: string,
  datos: Partial<Registro>,
): Promise<void> {
  const ahora = Date.now()
  await guardarDiaLocal(userId, fecha, datos, 'pending', ahora)

  const docRef = doc(db, 'registros', idDocumento(userId, fecha))
  const payload: Registro = { ...datos, userId, fecha, updatedAt: ahora }

  try {
    await setDoc(docRef, payload, { merge: true })
    await marcarDiasSincronizados(userId, [fecha])
  } catch (err) {
    console.warn(`Escritura en Firestore pospuesta para ${fecha} (modo offline):`, err)
  }
}

/**
 * Carga los registros de un usuario en un rango de fechas.
 * Prioriza SQLite local y recurre a Firestore si no hay registros locales.
 *
 * @param userId - Identificador del usuario.
 * @param desde - Fecha de inicio (`YYYY-MM-DD`).
 * @param hasta - Fecha de fin (`YYYY-MM-DD`).
 * @returns Mapa indexado por fecha con los registros encontrados.
 */
export async function cargarRango(
  userId: string,
  desde: string,
  hasta: string,
): Promise<Record<string, Registro>> {
  const registrosLocales = await obtenerRangoLocal(userId, desde, hasta)
  if (Object.keys(registrosLocales).length > 0) return registrosLocales

  try {
    const q = query(collection(db, 'registros'), where('userId', '==', userId), limit(1000))
    const snap = await getDocs(q)
    const mapa: Record<string, Registro> = {}
    const loteDescargado: Registro[] = []

    if (snap && typeof snap.forEach === 'function') {
      snap.forEach(d => {
        const reg = d.data() as Registro
        if (reg.fecha) {
          loteDescargado.push(reg)
          if (reg.fecha >= desde && reg.fecha <= hasta) {
            mapa[reg.fecha] = reg
          }
        }
      })
    }

    if (loteDescargado.length > 0) {
      await guardarDiasBatch(loteDescargado)
    }

    return mapa
  } catch (err) {
    console.warn('Error al cargar rango desde Firestore (modo offline):', err)
    return registrosLocales
  }
}
