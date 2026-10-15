import { useState, useRef, useEffect, useCallback } from 'react'
import { TextInput } from 'react-native'
import type { DefinicionComida } from '../../../config/comidas'
import type { Registro } from '../../../types'

export interface UseComidaCardParams {
  comida: DefinicionComida
  valorAnterior?: string
  fuera: boolean
  analizando: boolean
  debeEnfocar?: boolean
  onActualizarCampo?: (campo: keyof Registro, valor: string | boolean) => void
  onTomarFotoComida?: (clave: string) => void
  onActualizarTexto?: (texto: string) => void
  onToggleFuera?: () => void
  onTomarFoto?: () => void
}

/**
 * Hook de lógica de negocio y control de interfaz para la tarjeta de comida.
 * Maneja el foco del teclado, auto-enfoque al recibir eventos del widget y atajos de datos.
 *
 * @param params - Parámetros de configuración y callbacks de la tarjeta de comida.
 * @returns Estado de foco, referencia al TextInput y manejadores de interacción.
 *
 * @example
 * ```ts
 * const { isFocused, inputRef, handleTexto, handleFoto } = useComidaCard({ ... });
 * ```
 */
export function useComidaCard({
  comida,
  valorAnterior,
  fuera,
  analizando,
  debeEnfocar,
  onActualizarCampo,
  onTomarFotoComida,
  onActualizarTexto,
  onToggleFuera,
  onTomarFoto,
}: UseComidaCardParams) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  const handleTexto = useCallback(
    (txt: string) => {
      if (onActualizarCampo) {
        onActualizarCampo(comida.clave, txt)
      } else {
        onActualizarTexto?.(txt)
      }
    },
    [comida.clave, onActualizarCampo, onActualizarTexto],
  )

  const handleToggle = useCallback(() => {
    if (onActualizarCampo) {
      onActualizarCampo(comida.claveFuera, !fuera)
    } else {
      onToggleFuera?.()
    }
  }, [comida.claveFuera, fuera, onActualizarCampo, onToggleFuera])

  const handleCopiarAyer = useCallback(() => {
    if (valorAnterior) {
      if (onActualizarCampo) {
        onActualizarCampo(comida.clave, valorAnterior)
      } else {
        onActualizarTexto?.(valorAnterior)
      }
    }
  }, [comida.clave, valorAnterior, onActualizarCampo, onActualizarTexto])

  const handleFoto = useCallback(() => {
    if (onTomarFotoComida) {
      onTomarFotoComida(comida.clave)
    } else {
      onTomarFoto?.()
    }
  }, [comida.clave, onTomarFotoComida, onTomarFoto])

  // Auto-enfoque inmediato y despliegue del teclado cuando se solicita (por ejemplo, desde el Widget)
  useEffect(() => {
    if (debeEnfocar && !analizando) {
      const timer1 = setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
      const timer2 = setTimeout(() => {
        inputRef.current?.focus()
      }, 400)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [debeEnfocar, analizando])

  return {
    isFocused,
    inputRef,
    handleFocus,
    handleBlur,
    handleTexto,
    handleToggle,
    handleCopiarAyer,
    handleFoto,
  }
}
