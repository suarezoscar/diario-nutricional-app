import React from 'react'
import { Animated, Text, View, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import type { EstadoGuardado } from '../../hooks/useDiario'
import { styles } from './FloatingSaveIndicator.styles'
import { useFloatingSaveIndicator } from './hooks/useFloatingSaveIndicator'

export interface FloatingSaveIndicatorProps {
  estado: EstadoGuardado | 'inactivo'
  topOffset?: number
}

/**
 * Indicador flotante translúcido y discreto para el estado de guardado/sincronización.
 * Diseñado con animación 100% nativa (GPU) para garantizar 60 FPS en cualquier dispositivo.
 *
 * @param props - Estado de persistencia y desplazamiento vertical desde la parte superior.
 * @returns Cápsula flotante animada o null si el estado es inactivo.
 */
export const FloatingSaveIndicator: React.FC<FloatingSaveIndicatorProps> = React.memo(({
  estado,
  topOffset = 120,
}) => {
  const { colors } = useTheme()
  const { opacityAnim, translateYAnim, estadoVisible } = useFloatingSaveIndicator(estado)

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
