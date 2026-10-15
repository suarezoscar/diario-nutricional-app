import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View, ActivityIndicator, Easing } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import type { EstadoGuardado } from '../../hooks/useDiario'

export interface FloatingSaveIndicatorProps {
  estado: EstadoGuardado | 'inactivo'
  topOffset?: number
}

/**
 * Indicador flotante translúcido y discreto para el estado de guardado/sincronización.
 * Diseñado con animación 100% nativa (GPU) para garantizar 60 FPS en cualquier dispositivo.
 */
export const FloatingSaveIndicator: React.FC<FloatingSaveIndicatorProps> = React.memo(({
  estado,
  topOffset = 120,
}) => {
  const { colors } = useTheme()
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

      // Permanece visible 1.8 segundos antes de desvanecerse hacia arriba suavemente
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
        ]).start(() => {
          setEstadoVisible('al_dia')
        })
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
        ]).start(() => {
          setEstadoVisible('al_dia')
        })
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
      ]).start(() => {
        setEstadoVisible('al_dia')
      })
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [estado, opacityAnim, translateYAnim, estadoVisible])

  if (estadoVisible === 'al_dia' || estadoVisible === 'inactivo') {
    return null
  }

  const esGuardando = estadoVisible === 'guardando'
  const esError = estadoVisible === 'error'

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.floatingContainer,
        {
          top: topOffset,
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
          backgroundColor: colors.card,
          borderColor: esError ? colors.error : colors.border,
        },
      ]}
    >
      {esGuardando && (
        <>
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
          <Text style={[styles.text, { color: colors.textMuted }]}>Guardando...</Text>
        </>
      )}

      {estadoVisible === 'guardado' && (
        <>
          <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
            <FontAwesome name="check" size={10} color={colors.primary} />
          </View>
          <Text style={[styles.text, styles.textBold, { color: colors.text }]}>Guardado</Text>
        </>
      )}

      {esError && (
        <>
          <View style={[styles.iconWrap, { backgroundColor: colors.errorSoft }]}>
            <FontAwesome name="exclamation" size={10} color={colors.error} />
          </View>
          <Text style={[styles.text, styles.textBold, { color: colors.error }]}>Error al guardar</Text>
        </>
      )}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    gap: 6,
    // Elevación y sombra sutil
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  spinner: {
    transform: [{ scale: 0.72 }],
  },
  iconWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  textBold: {
    fontWeight: '600',
  },
})
