import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '../../utils/theme'
import { APP_VERSION } from '../../config/constants'
import type { UsuarioAutenticado } from '../../types'

interface HeaderProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onAbrirPdf?: () => void
  onVerificarActualizacion?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onLogout,
  onAbrirPdf,
  onVerificarActualizacion,
}) => {
  const insets = useSafeAreaInsets()
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
    16,
  )

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      <View style={styles.titleRow}>
        <FontAwesome name="leaf" size={20} color={theme.colors.primary} style={styles.icon} />
        <Text style={styles.title}>Diario</Text>
        <Text style={styles.versionBadge}>v{APP_VERSION}</Text>
      </View>

      <View style={styles.userRow}>
        {onAbrirPdf && (
          <TouchableOpacity
            onPress={onAbrirPdf}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Exportar resumen PDF"
          >
            <FontAwesome name="file-pdf-o" size={17} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {onVerificarActualizacion && (
          <TouchableOpacity
            onPress={onVerificarActualizacion}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Buscar actualizaciones"
          >
            <FontAwesome name="cloud-download" size={17} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}

        <Text style={styles.email} numberOfLines={1}>
          {usuario.displayName || usuario.email}
        </Text>

        <TouchableOpacity
          onPress={onLogout}
          style={styles.actionBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Cerrar sesión"
        >
          <FontAwesome name="sign-out" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  versionBadge: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '65%',
  },
  actionBtn: {
    padding: theme.spacing.xs,
  },
  email: {
    fontSize: 12,
    color: theme.colors.textMuted,
    maxWidth: 90,
  },
})
