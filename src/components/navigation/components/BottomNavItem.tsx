import React, { useRef, useEffect, useCallback } from 'react'
import { TouchableOpacity, Animated, Text } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import type { BottomNavItemProps } from '../BottomNav.types'
import { styles } from '../BottomNav.styles'

/**
 * Elemento interactivo individual de la barra de navegación inferior.
 * Muestra el icono en una cápsula redondeada con animación de rebote (bounce)
 * al ser seleccionado y la etiqueta de texto debajo.
 *
 * @param props - Datos de la pestaña, estado activo y manejador de selección.
 * @returns Botón de pestaña accesible con micro-interacción a 60 FPS.
 */
export const BottomNavItem: React.FC<BottomNavItemProps> = React.memo(({
  item,
  activo,
  onCambiarTab,
}) => {
  const { colors } = useTheme()
  const bounceAnim = useRef(new Animated.Value(1)).current
  const prevActivoRef = useRef(activo)

  const ejecutarBounce = useCallback(() => {
    bounceAnim.setValue(0.72)
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 190,
      useNativeDriver: true,
    }).start()
  }, [bounceAnim])

  useEffect(() => {
    if (activo && !prevActivoRef.current) {
      ejecutarBounce()
    }
    prevActivoRef.current = activo
  }, [activo, ejecutarBounce])

  const handlePress = useCallback(() => {
    ejecutarBounce()
    onCambiarTab(item.id)
  }, [item.id, onCambiarTab, ejecutarBounce])

  return (
    <TouchableOpacity
      style={styles.tabBtn}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={`Pestaña ${item.titulo}`}
    >
      <Animated.View
        style={[
          styles.pill,
          activo && { backgroundColor: colors.primarySoft },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <FontAwesome
            name={item.icono}
            size={18}
            color={activo ? colors.primary : colors.textMuted}
          />
        </Animated.View>
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          { color: colors.textMuted },
          activo && { color: colors.primary, fontWeight: '700' },
        ]}
      >
        {item.titulo}
      </Text>
    </TouchableOpacity>
  )
})
