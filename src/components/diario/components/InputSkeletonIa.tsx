import React from 'react'
import { View, Text, Animated } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { usePulseAnim } from '../../../hooks/usePulseAnim'
import { styles } from '../ComidaCard.styles'

/**
 * Skeleton animado que sustituye al TextInput mientras la IA
 * analiza la foto del plato seleccionado.
 *
 * @returns Componente animado con pulso y líneas ficticias de carga.
 */
export const InputSkeletonIa: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <Animated.View
      style={[
        styles.skeletonContainer,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.primaryLight,
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={styles.skeletonHeader}>
        <FontAwesome name="magic" size={13} color={colors.primary} />
        <Text style={[styles.skeletonTitle, { color: colors.primary }]}>
          Identificando plato con IA...
        </Text>
      </View>
      <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '85%' }]} />
      <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '55%' }]} />
    </Animated.View>
  )
})
