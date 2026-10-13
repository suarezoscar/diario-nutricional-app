import { useState, useEffect, useCallback } from 'react'
import { suscribirAuth, login as loginApi, logout as logoutApi } from '../services/authService'
import type { UsuarioAutenticado } from '../types'

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const desuscribir = suscribirAuth(user => {
      setUsuario(user)
      setCargando(false)
    })
    return desuscribir
  }, [])

  const login = useCallback(async (email: string, pass: string) => {
    setError(null)
    try {
      const user = await loginApi(email, pass)
      setUsuario(user)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(mensaje)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    try {
      await logoutApi()
      setUsuario(null)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cerrar sesión'
      setError(mensaje)
    }
  }, [])

  return {
    usuario,
    cargando,
    error,
    login,
    logout,
  }
}
