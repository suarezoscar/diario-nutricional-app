import { useEffect, useRef, useState } from 'react'
import { Animated, Easing } from 'react-native'
import type { EstadoGuardado } from '../../../hooks/useDiario'

/**
 * Hook para coordinar las animaciones de aparición y desvanecimiento del indicador de guardado.
 * Garantiza 60 FPS mediante transformaciones aceleradas por hardware en el hilo nativo de la UI.
 *
 * @param estado - Estado de persistencia actual ('guardando', 'guardado', 'error', 'al_dia', 'inactivo').
 * @returns Valores animados y el estado visual actualmente proyectado.
 */
export function useFloatingSaveIndicator(estado: EstadoGuardado | 'inactivo') {
  const opacityAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(-12)).current
  const [estadoVisible, setEstadoVisible] = useState(estado)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (estado === 'guardando') {
      setEstadoVisible('guardando')
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    } else if (estado === 'guardado') {
      setEstadoVisible('guardado')
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -10,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => setEstadoVisible('al_dia'))
      }, 1800)
    } else if (estado === 'error') {
      setEstadoVisible('error')
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -10,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => setEstadoVisible('al_dia'))
      }, 2500)
    } else if ((estado === 'al_dia' || estado === 'inactivo') && estadoVisible !== 'al_dia' && estadoVisible !== 'inactivo') {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -10,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setEstadoVisible('al_dia'))
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [estado, opacityAnim, translateYAnim, estadoVisible])

  return {
    opacityAnim,
    translateYAnim,
    estadoVisible,
  }
}
