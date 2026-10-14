import { collection, doc, getDoc, getDocs, query, setDoc, where, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
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
 * Si el documento no existe en Firestore, devuelve un objeto inicial con `userId` y `fecha`.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha a consultar en formato `YYYY-MM-DD`.
 * @returns Promesa que resuelve a los datos parciales o completos del registro.
 */
export async function cargarDia(userId: string, fecha: string): Promise<Partial<Registro>> {
  const docRef = doc(db, 'registros', idDocumento(userId, fecha))
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    return { userId, fecha }
  }
  return snap.data() as Registro
}

/**
 * Guarda o actualiza (merge) los datos nutricionales de un día específico para un usuario.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha en formato `YYYY-MM-DD`.
 * @param datos - Campos de comida, agua, peso o ejercicio a persistir.
 * @returns Promesa que resuelve cuando se confirma la escritura en Firestore.
 */
export async function guardarDia(
  userId: string,
  fecha: string,
  datos: Partial<Registro>,
): Promise<void> {
  const docRef = doc(db, 'registros', idDocumento(userId, fecha))
  const payload: Registro = {
    ...datos,
    userId,
    fecha,
  }
  await setDoc(docRef, payload, { merge: true })
}

/**
 * Carga todos los registros de un usuario comprendidos en un intervalo de fechas.
 *
 * @param userId - Identificador del usuario.
 * @param desde - Fecha de inicio del intervalo (`YYYY-MM-DD`).
 * @param hasta - Fecha de fin del intervalo (`YYYY-MM-DD`).
 * @returns Promesa con un mapa clave-valor donde la clave es la fecha y el valor es el registro.
 */
export async function cargarRango(
  userId: string,
  desde: string,
  hasta: string,
): Promise<Record<string, Registro>> {
  const q = query(
    collection(db, 'registros'),
    where('userId', '==', userId),
    limit(1000),
  )
  const snap = await getDocs(q)
  const mapa: Record<string, Registro> = {}
  snap.forEach(d => {
    const reg = d.data() as Registro
    if (reg.fecha && reg.fecha >= desde && reg.fecha <= hasta) {
      mapa[reg.fecha] = reg
    }
  })
  return mapa
}
