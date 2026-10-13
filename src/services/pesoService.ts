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
import type { PesosPorFecha, PuntoPeso } from '../types'

export async function cargarPesos(userId: string): Promise<PesosPorFecha> {
  const q = query(
    collection(db, 'peso'),
    where('userId', '==', userId),
    limit(365),
  )
  const snap = await getDocs(q)
  const mapa: PesosPorFecha = {}
  snap.forEach(d => {
    const data = d.data()
    const valor = typeof data.peso === 'number' ? data.peso : parseFloat(data.peso)
    if (!isNaN(valor)) {
      mapa[data.fecha] = valor
    }
  })
  return mapa
}

export async function guardarPeso(
  userId: string,
  fecha: string,
  peso: number,
): Promise<void> {
  const idDoc = idDocumento(userId, fecha)
  // Guardar en la colección peso
  await setDoc(doc(db, 'peso', idDoc), { userId, fecha, peso }, { merge: true })
  // Sincronizar en la colección registros para coherencia
  await setDoc(doc(db, 'registros', idDoc), { userId, fecha, peso: peso.toString() }, { merge: true })
}

export async function borrarPeso(userId: string, fecha: string): Promise<void> {
  const idDoc = idDocumento(userId, fecha)
  await deleteDoc(doc(db, 'peso', idDoc))
  await setDoc(doc(db, 'registros', idDoc), { peso: '' }, { merge: true })
}

export function transformarChartData(pesos: PesosPorFecha): PuntoPeso[] {
  return Object.entries(pesos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, peso]) => ({ fecha, peso }))
}
