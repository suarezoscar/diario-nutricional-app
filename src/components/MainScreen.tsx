import React, { useState, useCallback, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
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
import { iniciarEscuchadoresSync } from '../services/syncService'
import type { TabPrincipal, UsuarioAutenticado } from '../types'

const TAB_INDEX: Record<TabPrincipal, number> = {
  diario: 0,
  historico: 1,
  peso: 2,
  ajustes: 3,
}

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
  const prevTabRef = useRef<TabPrincipal>('diario')
  const tabFadeAnim = useRef(new Animated.Value(1)).current
  const tabSlideAnim = useRef(new Animated.Value(0)).current

  const cambiarTabConAnimacion = useCallback((nuevaTab: TabPrincipal) => {
    if (nuevaTab === prevTabRef.current) return
    const prevIdx = TAB_INDEX[prevTabRef.current]
    const nextIdx = TAB_INDEX[nuevaTab]
    const dir = nextIdx > prevIdx ? 1 : -1
    prevTabRef.current = nuevaTab

    tabFadeAnim.setValue(0.3)
    tabSlideAnim.setValue(dir * 16)
    setTabActiva(nuevaTab)

    Animated.parallel([
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tabSlideAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [tabFadeAnim, tabSlideAnim])

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
        cambiarTabConAnimacion('diario')
      }
      // diarionutricional://comida?clave=...&accion=...
      else if (parsed.hostname === 'comida' || parsed.path === 'comida') {
        setFechaSeleccionada(hoy())
        cambiarTabConAnimacion('diario')
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

  // Sincronización en segundo plano (inicio y vuelta a primer plano)
  React.useEffect(() => {
    const limpiarSync = iniciarEscuchadoresSync(usuario.uid)
    return () => {
      limpiarSync()
    }
  }, [usuario.uid])

  const { colors } = useTheme()

  const irADiaEnDiario = useCallback((fecha: string) => {
    setFechaSeleccionada(fecha)
    cambiarTabConAnimacion('diario')
  }, [cambiarTabConAnimacion])

  const handleLimpiarFecha = useCallback(() => {
    setFechaSeleccionada(undefined)
  }, [])

  const handleAbrirHistoricoPdf = useCallback(() => {
    setShowHistoricoPdf(true)
  }, [])

  const handleCerrarHistoricoPdf = useCallback(() => {
    setShowHistoricoPdf(false)
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: tabFadeAnim,
            transform: [{ translateX: tabSlideAnim }],
          },
        ]}
      >
        {tabActiva === 'diario' && (
          <DiarioView
            usuario={usuario}
            fechaSeleccionada={fechaSeleccionada}
            onLimpiarFechaSeleccionada={handleLimpiarFecha}
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
              onAbrirPdf={handleAbrirHistoricoPdf}
            />
            <HistoricoView
              userId={usuario.uid}
              nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
              onEditarDia={irADiaEnDiario}
              showPdfModalExterno={showHistoricoPdf}
              onCerrarPdfModalExterno={handleCerrarHistoricoPdf}
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
      </Animated.View>

      <BottomNav tabActiva={tabActiva} onCambiarTab={cambiarTabConAnimacion} />
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
