import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { theme } from '../../utils/theme'
import type { UsuarioAutenticado } from '../../types'

interface HeaderProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ usuario, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <FontAwesome name="leaf" size={20} color={theme.colors.primary} style={styles.icon} />
        <Text style={styles.title}>Diario Nutricional</Text>
      </View>
      <View style={styles.userRow}>
        <Text style={styles.email} numberOfLines={1}>
          {usuario.displayName || usuario.email}
        </Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',
  },
  email: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  logoutBtn: {
    padding: theme.spacing.xs,
  },
})
