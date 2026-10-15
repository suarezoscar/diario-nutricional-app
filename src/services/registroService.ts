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
 * Arquitectura Local-First:
 * 1. Consulta primero SQLite local (latencia de 0 ms, disponible offline).
 * 2. Si no existe en local, consulta Firestore como fallback y almacena en SQLite para futuras consultas.
 * 3. Si no existe en ninguna parte, devuelve un objeto base con `userId` y `fecha`.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha a consultar en formato `YYYY-MM-DD`.
 * @returns Promesa que resuelve a los datos parciales o completos del registro.
 */
export async function cargarDia(userId: string, fecha: string): Promise<Partial<Registro>> {
  // 1. Intento de lectura inmediata desde SQLite local
  const local = await obtenerDiaLocal(userId, fecha)
  if (local) {
    return local
  }

  // 2. Fallback a Firestore si aún no ha sido descargado al dispositivo
  try {
    const docRef = doc(db, 'registros', idDocumento(userId, fecha))
    const snap = await getDoc(docRef)
    if (!snap.exists()) {
      return { userId, fecha }
    }
    const remoto = snap.data() as Registro
    // Guardar en la base de datos local para que la próxima lectura sea inmediata (0 ms)
    await guardarDiaLocal(userId, fecha, remoto, 'synced', Number(remoto.updatedAt) || Date.now())
    return remoto
  } catch (err) {
    console.warn(`No se pudo consultar Firestore para la fecha ${fecha} (modo offline):`, err)
    return { userId, fecha }
  }
}

/**
 * Guarda o actualiza los datos nutricionales de un día específico.
 * Arquitectura Local-First:
 * 1. Escribe inmediatamente en SQLite local con estado `pending` (0 ms).
 * 2. Intenta sincronizar con Firestore en segundo plano; si la red falla o está offline,
 *    los datos quedan persistidos con seguridad en SQLite para sincronización posterior.
 *
 * @param userId - Identificador del usuario.
 * @param fecha - Fecha en formato `YYYY-MM-DD`.
 * @param datos - Campos de comida, agua, peso o ejercicio a persistir.
 * @returns Promesa que resuelve una vez asegurada la persistencia local.
 */
export async function guardarDia(
  userId: string,
  fecha: string,
  datos: Partial<Registro>,
): Promise<void> {
  const ahora = Date.now()

  // 1. Persistencia local inmediata en SQLite (0 ms)
  await guardarDiaLocal(userId, fecha, datos, 'pending', ahora)

  // 2. Persistencia en la nube (Firestore)
  const docRef = doc(db, 'registros', idDocumento(userId, fecha))
  const payload: Registro = {
    ...datos,
    userId,
    fecha,
    updatedAt: ahora,
  }

  try {
    await setDoc(docRef, payload, { merge: true })
    // Si la escritura en Firestore tuvo éxito, marcar como sincronizado en SQLite
    await marcarDiasSincronizados(userId, [fecha])
  } catch (err) {
    // Si no hay conexión o falla la red, no bloqueamos al usuario:
    // los datos ya están en SQLite y el motor de sincronización los subirá automáticamente
    console.warn(`Escritura en Firestore pospuesta para ${fecha} (modo offline):`, err)
  }
}

/**
 * Carga todos los registros de un usuario comprendidos en un intervalo de fechas.
 * Arquitectura Local-First:
 * Consulta primero la base SQLite local en una sola consulta relacional indexada.
 * Si la base local no tiene registros en el rango, consulta Firestore y puebla la base local.
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
  // 1. Consulta relacional ultrarrápida en SQLite local
  const registrosLocales = await obtenerRangoLocal(userId, desde, hasta)
  if (Object.keys(registrosLocales).length > 0) {
    return registrosLocales
  }

  // 2. Si no hay datos locales en ese rango, consultar Firestore y poblar SQLite
  try {
    const q = query(
      collection(db, 'registros'),
      where('userId', '==', userId),
      limit(1000),
    )
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
