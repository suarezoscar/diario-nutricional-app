import React, { useState, useEffect } from 'react'
import { View, Platform, Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import type { BottomNavProps, ItemTab } from './BottomNav.types'
import { BottomNavItem } from './components/BottomNavItem'
import { styles } from './BottomNav.styles'

export type { BottomNavProps }

const ITEMS: ItemTab[] = [
  { id: 'diario', titulo: 'Diario', icono: 'calendar-check-o' },
  { id: 'historico', titulo: 'Histórico', icono: 'list-alt' },
  { id: 'peso', titulo: 'Peso', icono: 'line-chart' },
  { id: 'ajustes', titulo: 'Ajustes', icono: 'cog' },
]

/**
 * Barra inferior de navegación principal de la aplicación.
 * Oculta su renderizado cuando el teclado virtual está visible en pantalla
 * y adapta el padding a las zonas seguras (safe area) del dispositivo.
 *
 * @param props - Pestaña actualmente activa y callback de navegación.
 * @returns Componente de navegación anclado a la zona ergonómica inferior.
 */
export const BottomNav: React.FC<BottomNavProps> = React.memo(({ tabActiva, onCambiarTab }) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 12)
  const [tecladoVisible, setTecladoVisible] = useState(false)

  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow'
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide'

    const showSub = Keyboard.addListener(showEvent, () => setTecladoVisible(true))
    const hideSub = Keyboard.addListener(hideEvent, () => setTecladoVisible(false))

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  if (tecladoVisible) {
    return null
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      {ITEMS.map(item => (
        <BottomNavItem
          key={item.id}
          item={item}
          activo={tabActiva === item.id}
          onCambiarTab={onCambiarTab}
        />
      ))}
    </View>
  )
})
