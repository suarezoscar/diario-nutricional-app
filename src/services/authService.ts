import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import type { UsuarioAutenticado } from '../types'

export function transformarUsuario(user: User | null): UsuarioAutenticado | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}

export async function login(email: string, pass: string): Promise<UsuarioAutenticado> {
  const credencial = await signInWithEmailAndPassword(auth, email.trim(), pass)
  const usuario = transformarUsuario(credencial.user)
  if (!usuario) throw new Error('No se pudo obtener la información de usuario')
  return usuario
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function suscribirAuth(callback: (usuario: UsuarioAutenticado | null) => void): () => void {
  return onAuthStateChanged(auth, user => {
    callback(transformarUsuario(user))
  })
}
