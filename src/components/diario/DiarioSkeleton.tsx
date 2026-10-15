import React from 'react'
import { View, Animated } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { usePulseAnim } from '../../hooks/usePulseAnim'
import { styles } from './DiarioSkeleton.styles'

const COMIDAS_PLACEHOLDER = [1, 2, 3, 4, 5]
const VASOS_PLACEHOLDER = [1, 2, 3, 4, 5, 6, 7, 8]

/**
 * Componente Skeleton con animación pulsante para mostrar mientras
 * se cargan los datos del diario en la primera apertura en frío, reemplazando spinners invasivos.
 *
 * @returns Estructura visual con tarjetas simuladas de comidas, agua y ejercicio.
 */
export const DiarioSkeleton: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const pulseAnim = usePulseAnim()

  return (
    <View style={styles.container}>
      {COMIDAS_PLACEHOLDER.map(item => (
        <Animated.View
          key={item}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
              <View style={[styles.titlePlaceholder, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.buttonPlaceholder, { backgroundColor: colors.border }]} />
              <View style={[styles.camButtonPlaceholder, { backgroundColor: colors.primarySoft }]} />
            </View>
          </View>

          <View style={[styles.inputPlaceholder, { backgroundColor: colors.background }]}>
            <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '80%' }]} />
            <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '45%' }]} />
          </View>
        </Animated.View>
      ))}

      {/* Tarjeta de Agua simulada */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
            <View style={[styles.titlePlaceholder, { backgroundColor: colors.border, width: 90 }]} />
          </View>
        </View>
        <View style={styles.aguaRow}>
          {VASOS_PLACEHOLDER.map(vaso => (
            <View key={vaso} style={[styles.vasoPlaceholder, { backgroundColor: colors.primarySoft }]} />
          ))}
        </View>
      </Animated.View>

      {/* Tarjeta de Ejercicio simulada */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pulseAnim },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconPlaceholder, { backgroundColor: colors.primarySoft }]} />
            <View style={[styles.titlePlaceholder, { backgroundColor: colors.border, width: 140 }]} />
          </View>
        </View>
        <View style={[styles.inputPlaceholder, { backgroundColor: colors.background }]}>
          <View style={[styles.linePlaceholder, { backgroundColor: colors.border, width: '65%' }]} />
        </View>
      </Animated.View>
    </View>
  )
})
