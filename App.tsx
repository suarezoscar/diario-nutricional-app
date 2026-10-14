import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { useAuth } from './src/hooks/useAuth'
import { useActualizador } from './src/hooks/useActualizador'
import { LoginView } from './src/components/auth/LoginView'
import { MainScreen } from './src/components/MainScreen'
import { UpdateModal } from './src/components/common/UpdateModal'

function AppContenido() {
  const { usuario, cargando, login, logout } = useAuth()
  const { esOscuro, colors } = useTheme()
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
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <StatusBar style={esOscuro ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
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
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContenido />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
})
