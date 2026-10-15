import { useRef, useEffect, useMemo } from 'react'
import { Animated, Easing } from 'react-native'

export interface UseDayAnimationParams {
  fecha: string
  fechaDatos?: string
}

/**
 * Hook para coordinar la animación horizontal de transición entre días.
 * Aplica una sutil traslación de 80px y variación de opacidad a 60 FPS con useNativeDriver.
 *
 * @param params - Fecha activa y fecha de los datos actuales en memoria.
 * @returns Estilo animado para aplicar a un Animated.View.
 *
 * @example
 * ```ts
 * const animatedStyle = useDayAnimation({ fecha, fechaDatos: datos.fecha });
 * ```
 */
export function useDayAnimation({ fecha, fechaDatos }: UseDayAnimationParams) {
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const ultimaFechaAnimadaRef = useRef(fecha)

  useEffect(() => {
    if (fechaDatos === fecha && fecha !== ultimaFechaAnimadaRef.current) {
      const direccion = fecha > ultimaFechaAnimadaRef.current ? 1 : -1
      ultimaFechaAnimadaRef.current = fecha

      fadeAnim.setValue(0.25)
      slideAnim.setValue(direccion * 80)

      const animacion = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])

      animacion.start(({ finished }) => {
        if (finished) {
          fadeAnim.setValue(1)
          slideAnim.setValue(0)
        }
      })

      return () => {
        animacion.stop()
      }
    }
  }, [fecha, fechaDatos, fadeAnim, slideAnim])

  const animatedContainerStyle = useMemo(
    () => ({ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }),
    [fadeAnim, slideAnim],
  )

  return animatedContainerStyle
}
