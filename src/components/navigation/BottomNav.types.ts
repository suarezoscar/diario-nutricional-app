import type { FontAwesome } from '@expo/vector-icons'
import type { TabPrincipal } from '../../types'

export interface ItemTab {
  id: TabPrincipal
  titulo: string
  icono: keyof typeof FontAwesome.glyphMap
}

export interface BottomNavProps {
  tabActiva: TabPrincipal
  onCambiarTab: (tab: TabPrincipal) => void
}

export interface BottomNavItemProps {
  item: ItemTab
  activo: boolean
  onCambiarTab: (tab: TabPrincipal) => void
}
