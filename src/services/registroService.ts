import { collection, doc, getDoc, getDocs, query, setDoc, where, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Registro } from '../types'

export function idDocumento(userId: string, fecha: string): string {
  return `${userId}_${fecha}`
}

export async function cargarDia(userId: string, fecha: string): Promise<Partial<Registro>> {
  const docRef = doc(db, 'registros', idDocumento(userId, fecha))
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    return { userId, fecha }
  }
  return snap.data() as Registro
}

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
