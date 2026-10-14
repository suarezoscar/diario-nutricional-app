import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuth } from './src/hooks/useAuth'
import { useActualizador } from './src/hooks/useActualizador'
import { LoginView } from './src/components/auth/LoginView'
import { MainScreen } from './src/components/MainScreen'
import { UpdateModal } from './src/components/common/UpdateModal'
import { theme } from './src/utils/theme'

export default function App() {
  const { usuario, cargando, login, logout } = useAuth()
  const {
    actualizacion,
    descargando,
    progreso,
    errorDescarga,
    instalar,
    descartar,
    abrirEnNavegador,
    verificarManual,
  } = useActualizador()

  if (cargando) {
    return (
      <View style={styles.splash}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {usuario ? (
          <MainScreen
            usuario={usuario}
            onLogout={logout}
            onVerificarActualizacion={verificarManual}
          />
        ) : (
          <LoginView onLogin={login} />
        )}

        <UpdateModal
          visible={!!actualizacion}
          info={actualizacion}
          descargando={descargando}
          progreso={progreso}
          error={errorDescarga}
          onInstalar={instalar}
          onCerrar={descartar}
          onAbrirNavegador={abrirEnNavegador}
        />
      </View>
    </SafeAreaProvider>
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
