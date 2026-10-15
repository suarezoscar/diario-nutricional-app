import { useRef } from 'react'
import { PanResponder, type PanResponderInstance } from 'react-native'

export interface UseDaySwipeParams {
  onCambiarDia: (offset: number) => Promise<void> | void
}

/**
 * Hook para detectar gestos de deslizamiento horizontal (swipe) entre fechas consecutivas.
 * Evita interferir con el desplazamiento vertical estándar del ScrollView.
 *
 * @param params - Parámetros con la función para cambiar de día (+1 o -1).
 * @returns Instancia de PanResponder configurada para adjuntar al contenedor.
 *
 * @example
 * ```ts
 * const panResponder = useDaySwipe({ onCambiarDia: cambiarDia });
 * return <View {...panResponder.panHandlers} />
 * ```
 */
export function useDaySwipe({ onCambiarDia }: UseDaySwipeParams): PanResponderInstance {
  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState
        // Solo capturar si el movimiento es dominantemente horizontal
        return Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 2
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState
        // Deslizar izquierda ➔ Día siguiente (+1)
        if (dx < -60 || (dx < -25 && vx < -0.4)) {
          void onCambiarDia(1)
        }
        // Deslizar derecha ➔ Día anterior (-1)
        else if (dx > 60 || (dx > 25 && vx > 0.4)) {
          void onCambiarDia(-1)
        }
      },
    }),
  )

  return panResponderRef.current
}
