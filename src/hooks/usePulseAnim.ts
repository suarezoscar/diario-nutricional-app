import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

/**
 * Hook unificado para animaciones pulsantes de Skeleton.
 * Garantiza una cadencia (750ms) y rango de opacidad (0.35 a 0.85)
 * homogéneos en toda la aplicación mediante useNativeDriver.
 *
 * @param min - Opacidad mínima en el punto bajo del pulso (por defecto 0.35).
 * @param max - Opacidad máxima en el punto alto del pulso (por defecto 0.85).
 * @param duration - Duración de cada fase en ms (por defecto 750ms).
 */
export function usePulseAnim(min = 0.35, max = 0.85, duration = 750): Animated.Value {
  const pulseAnim = useRef(new Animated.Value(min)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: max,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: min,
          duration,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulseAnim, min, max, duration])

  return pulseAnim
}
