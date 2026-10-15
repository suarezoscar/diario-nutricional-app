import { useState, useCallback } from 'react'

/**
 * Hook para gestionar el formulario de autenticación, validación y estados de carga/error.
 *
 * @param onLogin - Callback de inicio de sesión que recibe email y password.
 * @returns Estado y manejadores del formulario.
 */
export function useLogin(onLogin: (email: string, pass: string) => Promise<void>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    if (!email.trim() || !password) {
      setError('Introduce email y contraseña')
      return
    }

    setError(null)
    setCargando(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }, [email, password, onLogin])

  return {
    email,
    setEmail,
    password,
    setPassword,
    cargando,
    error,
    handleSubmit,
  }
}
