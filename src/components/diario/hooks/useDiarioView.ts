import { useState, useRef, useEffect, useCallback } from 'react'
import { Keyboard, Platform } from 'react-native'
import { useDiario } from '../../../hooks/useDiario'
import { useFotoPlato } from '../../../hooks/useFotoPlato'
import { hoy, obtenerComidaActual, obtenerFechaOperativa } from '../../../utils/fechas'
import { cargarConfiguracion, type HorariosConfig } from '../../../services/configService'
import type { UsuarioAutenticado, Registro } from '../../../types'
import { useDayAnimation } from './useDayAnimation'
import { useDaySwipe } from './useDaySwipe'
import { useDiarioWidgetSync } from './useDiarioWidgetSync'

export interface UseDiarioViewParams {
  usuario: UsuarioAutenticado
  fechaSeleccionada?: string
  onLimpiarFechaSeleccionada?: () => void
  accionWidget?: { clave: string; accion: 'foto' | 'texto'; timestamp: number }
}

/**
 * Hook orquestador principal para la pantalla del Diario Nutricional.
 * Centraliza la persistencia de registros, sincronización con el widget de Android,
 * control de modales auxiliares y navegación gestual entre fechas.
 *
 * @param params - Configuración de usuario, fecha seleccionada y acciones del widget.
 * @returns Estados consolidados, referencias y callbacks para DiarioView.
 */
export function useDiarioView({
  usuario,
  fechaSeleccionada,
  onLimpiarFechaSeleccionada,
  accionWidget,
}: UseDiarioViewParams) {
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [horariosUsuario, setHorariosUsuario] = useState<HorariosConfig | undefined>(undefined)

  const haCargadoInicialRef = useRef(false)
  const datosDiaRef = useRef<Partial<Registro>>({})

  const diario = useDiario(usuario.uid, fechaSeleccionada)
  const { comidaAnalizando, tomarFotoOSeleccionar } = useFotoPlato()

  if (diario.datos.fecha) {
    haCargadoInicialRef.current = true
  }
  const esCargaInicial = !haCargadoInicialRef.current && (diario.cargando || !diario.datos.fecha)

  if (diario.datos.fecha === diario.fecha) {
    datosDiaRef.current = diario.datos
  }
  const datosDia = diario.datos.fecha === diario.fecha ? diario.datos : (haCargadoInicialRef.current ? datosDiaRef.current : {})
  const datosAntDia = diario.datos.fecha === diario.fecha ? diario.datosAnterior : {}

  const animatedContainerStyle = useDayAnimation({ fecha: diario.fecha, fechaDatos: diario.datos.fecha })
  const panResponder = useDaySwipe({ onCambiarDia: diario.cambiarDia })

  const widgetSync = useDiarioWidgetSync({
    accionWidget,
    cargando: diario.cargando,
    datosDiaRef,
    onTomarFoto: tomarFotoOSeleccionar,
    onActualizarCampo: diario.actualizarCampo,
  })

  useEffect(() => {
    async function leerConfig() {
      const cfg = await cargarConfiguracion()
      setHorariosUsuario(cfg.horarios)
    }
    void leerConfig()
  }, [])

  const comidaActual =
    diario.fecha === hoy() || diario.fecha === obtenerFechaOperativa(horariosUsuario)
      ? obtenerComidaActual(horariosUsuario)
      : null

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, e => setKeyboardHeight(e.endCoordinates.height))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useEffect(() => {
    if (fechaSeleccionada) {
      if (fechaSeleccionada !== diario.fecha) {
        diario.establecerFecha(fechaSeleccionada)
      }
      onLimpiarFechaSeleccionada?.()
    }
  }, [fechaSeleccionada, diario, onLimpiarFechaSeleccionada])

  const handleFocusEjercicio = useCallback(() => {
    setTimeout(() => widgetSync.scrollViewRef.current?.scrollToEnd({ animated: true }), 160)
  }, [widgetSync.scrollViewRef])

  const handleTomarFotoComida = useCallback((clave: string) => {
    tomarFotoOSeleccionar(clave, textoDescrito => {
      const textoActual = (datosDiaRef.current[clave] as string) || ''
      const nuevo = textoActual ? `${textoActual}\n${textoDescrito}` : textoDescrito
      diario.actualizarCampo(clave, nuevo)
    })
  }, [tomarFotoOSeleccionar, diario])

  return {
    ...diario,
    ...widgetSync,
    esCargaInicial,
    datosDia,
    datosAntDia,
    comidaActual,
    comidaAnalizando,
    showPdfModal,
    showBulkModal,
    showCalendarModal,
    keyboardHeight,
    animatedContainerStyle,
    panResponder,
    setShowPdfModal,
    setShowBulkModal,
    setShowCalendarModal,
    handleFocusEjercicio,
    handleTomarFotoComida,
  }
}
