import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import { APP_VERSION } from '../../../config/constants'
import type { UsuarioAutenticado } from '../../../types'
import { styles } from '../AjustesView.styles'

export interface SeccionCuentaProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

/**
 * Sección de gestión de cuenta de usuario, versión de la app y cierre de sesión.
 */
export const SeccionCuenta: React.FC<SeccionCuentaProps> = React.memo(({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const { colors, esOscuro } = useTheme()

  return (
    <Card>
      <View style={styles.cardHeader}>
        <FontAwesome name="user-circle-o" size={16} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Cuenta y Aplicación</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Usuario:</Text>
        <Text style={[styles.infoVal, { color: colors.text }]}>
          {usuario.email || usuario.displayName || 'Usuario'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Versión:</Text>
        <Text style={[styles.infoVal, { color: colors.text }]}>v{APP_VERSION}</Text>
      </View>

      <View style={styles.actionsColumn}>
        {onVerificarActualizacion && (
          <TouchableOpacity
            style={[styles.updateCheckBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={onVerificarActualizacion}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Comprobar si existen actualizaciones de la aplicación"
          >
            <FontAwesome name="cloud-download" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.updateCheckBtnText, { color: colors.primary }]}>
              Comprobar actualizaciones
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.errorSoft,
              borderColor: esOscuro ? '#4a2020' : '#ffcdd2',
            },
          ]}
          onPress={onLogout}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión de la cuenta actual"
        >
          <FontAwesome name="sign-out" size={14} color={colors.error} style={{ marginRight: 6 }} />
          <Text style={[styles.logoutBtnText, { color: colors.error }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )
})
