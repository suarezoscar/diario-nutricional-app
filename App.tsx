import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from './src/hooks/useAuth'
import { LoginView } from './src/components/auth/LoginView'
import { DiarioView } from './src/components/diario/DiarioView'
import { theme } from './src/utils/theme'

export default function App() {
  const { usuario, cargando, login, logout } = useAuth()

  if (cargando) {
    return (
      <View style={styles.splash}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {usuario ? (
        <DiarioView usuario={usuario} onLogout={logout} />
      ) : (
        <LoginView onLogin={login} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
})
