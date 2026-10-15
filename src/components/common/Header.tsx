import React from 'react'
import { View, Text, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { APP_VERSION } from '../../config/constants'
import type { UsuarioAutenticado } from '../../types'
import { styles } from './Header.styles'

export interface HeaderProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onAbrirPdf?: () => void
  onAbrirSubidaMultiple?: () => void
  onVerificarActualizacion?: () => void
}

const HIT_SLOP_10 = Object.freeze({ top: 10, bottom: 10, left: 10, right: 10 })

/**
 * Cabecera superior persistente de la aplicación.
 * Muestra el logotipo de la app, número de versión, accesos rápidos a subida múltiple, PDF,
 * buscador de actualizaciones y cierre de sesión.
 *
 * @param props - Usuario autenticado y callbacks de acción para herramientas auxiliares.
 * @returns Barra de encabezado adaptada a la zona segura superior.
 */
export const Header: React.FC<HeaderProps> = React.memo(({
  usuario,
  onLogout,
  onAbrirPdf,
  onAbrirSubidaMultiple,
  onVerificarActualizacion,
}) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
    16,
  )

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPadding + 6,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <FontAwesome name="leaf" size={20} color={colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: colors.primary }]}>Diario</Text>
        <Text
          style={[
            styles.versionBadge,
            { color: colors.primary, backgroundColor: colors.primarySoft },
          ]}
        >
          v{APP_VERSION}
        </Text>
      </View>

      <View style={styles.userRow}>
        {onAbrirSubidaMultiple && (
          <TouchableOpacity
            onPress={onAbrirSubidaMultiple}
            style={styles.actionBtn}
            hitSlop={HIT_SLOP_10}
            accessibilityLabel="Subida múltiple de fotos con IA"
          >
            <FontAwesome name="camera-retro" size={17} color={colors.primary} />
          </TouchableOpacity>
        )}

        {onAbrirPdf && (
          <TouchableOpacity
            onPress={onAbrirPdf}
            style={styles.actionBtn}
            hitSlop={HIT_SLOP_10}
            accessibilityLabel="Exportar resumen PDF"
          >
            <FontAwesome name="file-pdf-o" size={17} color={colors.primary} />
          </TouchableOpacity>
        )}

        {onVerificarActualizacion && (
          <TouchableOpacity
            onPress={onVerificarActualizacion}
            style={styles.actionBtn}
            hitSlop={HIT_SLOP_10}
            accessibilityLabel="Buscar actualizaciones"
          >
            <FontAwesome name="cloud-download" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
          {usuario.displayName || usuario.email}
        </Text>

        <TouchableOpacity
          onPress={onLogout}
          style={styles.actionBtn}
          hitSlop={HIT_SLOP_10}
          accessibilityLabel="Cerrar sesión"
        >
          <FontAwesome name="sign-out" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  )
})
