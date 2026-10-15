import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { styles } from './LoginView.styles'
import { useLogin } from './hooks/useLogin'

/**
 * Propiedades del componente LoginView.
 */
interface LoginViewProps {
  /** Callback invocado al remitir las credenciales para autenticar al usuario */
  onLogin: (email: string, pass: string) => Promise<void>
}

/**
 * Vista de autenticación para inicio de sesión en la aplicación.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX con la pantalla de inicio de sesión.
 */
export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { colors } = useTheme()
  const { email, setEmail, password, setPassword, cargando, error, handleSubmit } = useLogin(onLogin)

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <FontAwesome name="leaf" size={32} color={colors.primary} style={styles.logo} />
          <Text style={[styles.title, { color: colors.primary }]}>Diario Nutricional</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Inicia sesión con tu cuenta</Text>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.errorSoft }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, cargando && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={cargando}
          activeOpacity={0.8}
        >
          {cargando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
