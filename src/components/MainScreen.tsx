import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header } from './common/Header'
import { BottomNav } from './navigation/BottomNav'
import { DiarioView } from './diario/DiarioView'
import { HistoricoView } from './historico/HistoricoView'
import { PesoView } from './peso/PesoView'
import { AjustesView } from './ajustes/AjustesView'
import { useTheme } from '../context/ThemeContext'
import { theme } from '../utils/theme'
import { hoy } from '../utils/fechas'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { configurarNotificaciones, sincronizarNotificaciones } from '../services/notificationService'
import type { TabPrincipal, UsuarioAutenticado } from '../types'

interface MainScreenProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

export const MainScreen: React.FC<MainScreenProps> = ({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const [tabActiva, setTabActiva] = useState<TabPrincipal>('diario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | undefined>(undefined)
  const [accionWidget, setAccionWidget] = useState<
    { clave: string; accion: 'foto' | 'texto'; timestamp: number } | undefined
  >(undefined)

  const [showHistoricoPdf, setShowHistoricoPdf] = useState(false)

  // Escuchar Deep Links entrantes desde el Widget de escritorio Android o Notificaciones
  React.useEffect(() => {
    void configurarNotificaciones()
    void sincronizarNotificaciones()

    const procesarUrl = (url: string | null) => {
      if (!url) return
      const parsed = Linking.parse(url)
      // diarionutricional://hoy
      if (parsed.hostname === 'hoy' || parsed.path === 'hoy') {
        setFechaSeleccionada(hoy())
        setTabActiva('diario')
      }
      // diarionutricional://comida?clave=...&accion=...
      else if (parsed.hostname === 'comida' || parsed.path === 'comida') {
        setFechaSeleccionada(hoy())
        setTabActiva('diario')
        const clave = (parsed.queryParams?.clave as string) || 'comida'
        const accion = (parsed.queryParams?.accion as 'foto' | 'texto') || 'texto'
        setAccionWidget({ clave, accion, timestamp: Date.now() })
      }
    }

    void Linking.getInitialURL().then(procesarUrl)
    const sub = Linking.addEventListener('url', evt => procesarUrl(evt.url))

    const notifSub = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url
      if (typeof url === 'string') {
        procesarUrl(url)
      }
    })

    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const url = response.notification.request.content.data?.url
        if (typeof url === 'string') {
          procesarUrl(url)
        }
      }
    })

    return () => {
      sub.remove()
      notifSub.remove()
    }
  }, [])

  const { colors } = useTheme()

  const irADiaEnDiario = (fecha: string) => {
    setFechaSeleccionada(fecha)
    setTabActiva('diario')
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {tabActiva === 'diario' && (
          <DiarioView
            usuario={usuario}
            fechaSeleccionada={fechaSeleccionada}
            onLimpiarFechaSeleccionada={() => setFechaSeleccionada(undefined)}
            accionWidget={accionWidget}
            onLogout={onLogout}
            onVerificarActualizacion={onVerificarActualizacion}
          />
        )}

        {tabActiva === 'historico' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
              onAbrirPdf={() => setShowHistoricoPdf(true)}
            />
            <HistoricoView
              userId={usuario.uid}
              nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
              onEditarDia={irADiaEnDiario}
              showPdfModalExterno={showHistoricoPdf}
              onCerrarPdfModalExterno={() => setShowHistoricoPdf(false)}
            />
          </View>
        )}

        {tabActiva === 'peso' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <PesoView
              userId={usuario.uid}
              onSeleccionarDia={irADiaEnDiario}
            />
          </View>
        )}

        {tabActiva === 'ajustes' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <AjustesView
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
          </View>
        )}
      </View>

      <BottomNav tabActiva={tabActiva} onCambiarTab={setTabActiva} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  pageWrap: {
    flex: 1,
  },
})
