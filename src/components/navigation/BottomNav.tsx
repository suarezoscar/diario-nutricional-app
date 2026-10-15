import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import type { TabPrincipal } from '../../types'

interface BottomNavProps {
  tabActiva: TabPrincipal
  onCambiarTab: (tab: TabPrincipal) => void
}

interface ItemTab {
  id: TabPrincipal
  titulo: string
  icono: keyof typeof FontAwesome.glyphMap
}

const ITEMS: ItemTab[] = [
  { id: 'diario', titulo: 'Diario', icono: 'calendar-check-o' },
  { id: 'historico', titulo: 'Histórico', icono: 'list-alt' },
  { id: 'peso', titulo: 'Peso', icono: 'line-chart' },
  { id: 'ajustes', titulo: 'Ajustes', icono: 'cog' },
]

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
      {ITEMS.map(item => {
        const activo = tabActiva === item.id
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.tabBtn}
            onPress={() => onCambiarTab(item.id)}
            activeOpacity={0.7}
            accessibilityLabel={`Pestaña ${item.titulo}`}
          >
            <View
              style={[
                styles.iconWrap,
                activo && { backgroundColor: colors.primarySoft },
              ]}
            >
              <FontAwesome
                name={item.icono}
                size={18}
                color={activo ? colors.primary : colors.textMuted}
              />
            </View>
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
      })}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: theme.spacing.xs,
    elevation: 8,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
})
