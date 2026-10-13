import { doc, getDoc, setDoc } from 'firebase/firestore'
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
