import { useState, useCallback, useRef, useEffect } from 'react'
import { Animated, Easing } from 'react-native'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { calcularFechaParaComida, obtenerFechaOperativa } from '../../utils/fechas'
import { configurarNotificaciones, sincronizarNotificaciones } from '../../services/notificationService'
import { iniciarEscuchadoresSync } from '../../services/syncService'
import type { TabPrincipal } from '../../types'

const TAB_INDEX: Record<TabPrincipal, number> = {
  diario: 0,
  historico: 1,
  peso: 2,
  ajustes: 3,
}

export interface UseMainScreenParams {
  userId: string
}

/**
 * Hook orquestador de la pantalla principal de la aplicación.
 * Gestiona la navegación animada entre pestañas, recepción de deep links y notificaciones,
 * y activa los sincronizadores en segundo plano.
 *
 * @param params - Identificador del usuario autenticado.
 * @returns Estados de pestañas activas, animaciones nativas y manejadores de navegación.
 */
export function useMainScreen({ userId }: UseMainScreenParams) {
  const [tabActiva, setTabActiva] = useState<TabPrincipal>('diario')
  const prevTabRef = useRef<TabPrincipal>('diario')
  const tabFadeAnim = useRef(new Animated.Value(1)).current
  const tabSlideAnim = useRef(new Animated.Value(0)).current

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | undefined>(undefined)
  const [accionWidget, setAccionWidget] = useState<
    { clave: string; accion: 'foto' | 'texto'; timestamp: number } | undefined
  >(undefined)
  const [showHistoricoPdf, setShowHistoricoPdf] = useState(false)

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

  useEffect(() => {
    void configurarNotificaciones()
    void sincronizarNotificaciones()

    const procesarUrl = (url: string | null) => {
      if (!url) return
      const parsed = Linking.parse(url)
      const fechaQuery = parsed.queryParams?.fecha as string | undefined
      if (parsed.hostname === 'hoy' || parsed.path === 'hoy') {
        setFechaSeleccionada(fechaQuery || obtenerFechaOperativa())
        cambiarTabConAnimacion('diario')
      } else if (parsed.hostname === 'comida' || parsed.path === 'comida') {
        const clave = (parsed.queryParams?.clave as string) || 'comida'
        const fechaTarget = calcularFechaParaComida(clave, fechaQuery)
        setFechaSeleccionada(fechaTarget)
        cambiarTabConAnimacion('diario')
        const accion = (parsed.queryParams?.accion as 'foto' | 'texto') || 'texto'
        setAccionWidget({ clave, accion, timestamp: Date.now() })
      }
    }

    void Linking.getInitialURL().then(procesarUrl)
    const sub = Linking.addEventListener('url', evt => procesarUrl(evt.url))

    const notifSub = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url
      if (typeof url === 'string') procesarUrl(url)
    })

    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const url = response.notification.request.content.data?.url
        if (typeof url === 'string') procesarUrl(url)
      }
    })

    return () => {
      sub.remove()
      notifSub.remove()
    }
  }, [cambiarTabConAnimacion])

  useEffect(() => {
    const limpiarSync = iniciarEscuchadoresSync(userId)
    return () => limpiarSync()
  }, [userId])

  const irADiaEnDiario = useCallback((fecha: string) => {
    setFechaSeleccionada(fecha)
    cambiarTabConAnimacion('diario')
  }, [cambiarTabConAnimacion])

  const handleLimpiarFecha = useCallback(() => setFechaSeleccionada(undefined), [])
  const handleAbrirHistoricoPdf = useCallback(() => setShowHistoricoPdf(true), [])
  const handleCerrarHistoricoPdf = useCallback(() => setShowHistoricoPdf(false), [])

  return {
    tabActiva,
    tabFadeAnim,
    tabSlideAnim,
    fechaSeleccionada,
    accionWidget,
    showHistoricoPdf,
    cambiarTabConAnimacion,
    irADiaEnDiario,
    handleLimpiarFecha,
    handleAbrirHistoricoPdf,
    handleCerrarHistoricoPdf,
  }
}
