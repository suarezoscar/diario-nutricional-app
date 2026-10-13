import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import { APP_VERSION } from '../../config/constants'
import type { UsuarioAutenticado } from '../../types'

interface HeaderProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <FontAwesome name="leaf" size={20} color={theme.colors.primary} style={styles.icon} />
        <Text style={styles.title}>Diario Nutricional</Text>
        <Text style={styles.versionBadge}>v{APP_VERSION}</Text>
      </View>
      <View style={styles.userRow}>
        {onVerificarActualizacion && (
          <TouchableOpacity
            onPress={onVerificarActualizacion}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Buscar actualizaciones"
          >
            <FontAwesome name="cloud-download" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        <Text style={styles.email} numberOfLines={1}>
          {usuario.displayName || usuario.email}
        </Text>
        <TouchableOpacity
          onPress={onLogout}
          style={styles.actionBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="sign-out" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
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
    marginRight: theme.spacing.sm,
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
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  actionBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  email: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginRight: 4,
    marginLeft: 4,
  },
})
