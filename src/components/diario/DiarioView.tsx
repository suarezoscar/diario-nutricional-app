import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  PanResponder,
  Easing,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Header } from '../common/Header'
import { DateBar } from '../common/DateBar'
import { CalendarModal } from '../common/CalendarModal'
import { ComidaCard } from './ComidaCard'
import { AguaCard } from './AguaCard'
import { PesoCard } from './PesoCard'
import { DiarioSkeleton } from './DiarioSkeleton'
import { ExportarPdfModal } from './ExportarPdfModal'
import { BulkUploadModal } from './BulkUploadModal'
import { useDiario } from '../../hooks/useDiario'
import { useFotoPlato } from '../../hooks/useFotoPlato'
import { COMIDAS } from '../../config/comidas'
import { theme } from '../../utils/theme'
import type { UsuarioAutenticado } from '../../types'

interface DiarioViewProps {
  usuario: UsuarioAutenticado
  fechaSeleccionada?: string
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

export const DiarioView: React.FC<DiarioViewProps> = ({
  usuario,
  fechaSeleccionada,
  onLogout,
  onVerificarActualizacion,
}) => {
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const scrollViewRef = useRef<ScrollView>(null)

  const {
    fecha,
    datos,
    datosAnterior,
    cargando,
    guardando,
    estadoGuardado,
    cambiarDia,
    irAHoy,
    establecerFecha,
    actualizarCampo,
    guardar,
  } = useDiario(usuario.uid)

  const { comidaAnalizando, tomarFotoOSeleccionar } = useFotoPlato()

  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const prevFechaRef = useRef(fecha)

  // Manejo de eventos de teclado para ajustar dinámicamente el scroll y evitar solapamientos
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  // Auto-scroll hacia el fondo cuando se enfoca peso o ejercicio para que el teclado no lo tape
  const handleFocusPeso = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 160)
  }

  // Gestor de deslizamiento (Swipe horizontal para cambiar de día)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState
        // Solo capturar si es claramente horizontal para no bloquear el scroll vertical
        return Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 2
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState
        // Deslizar izquierda ➔ Día siguiente (+1)
        if (dx < -60 || (dx < -25 && vx < -0.4)) {
          void cambiarDia(1)
        }
        // Deslizar derecha ➔ Día anterior (-1)
        else if (dx > 60 || (dx > 25 && vx > 0.4)) {
          void cambiarDia(-1)
        }
      },
    }),
  ).current

  useEffect(() => {
    if (prevFechaRef.current !== fecha) {
      const dir = fecha > prevFechaRef.current ? 1 : -1
      prevFechaRef.current = fecha

      fadeAnim.setValue(0.35)
      slideAnim.setValue(dir * 28)

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [fecha, fadeAnim, slideAnim])

  useEffect(() => {
    if (fechaSeleccionada && fechaSeleccionada !== fecha) {
      void establecerFecha(fechaSeleccionada)
    }
  }, [fechaSeleccionada, fecha, establecerFecha])

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Header
        usuario={usuario}
        onLogout={onLogout}
        onAbrirPdf={() => setShowPdfModal(true)}
        onAbrirSubidaMultiple={() => setShowBulkModal(true)}
        onVerificarActualizacion={onVerificarActualizacion}
      />
      <DateBar
        fecha={fecha}
        cargando={cargando}
        estadoGuardado={estadoGuardado}
        onCambiarDia={cambiarDia}
        onIrAHoy={irAHoy}
        onAbrirCalendario={() => setShowCalendarModal(true)}
      />

      {cargando && Object.keys(datos).length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DiarioSkeleton />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : theme.spacing.xxl },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
              {COMIDAS.map(comida => {
                const valor = (datos[comida.clave] as string) || ''
                const valorAnterior = (datosAnterior?.[comida.clave] as string) || ''
                const fuera = !!datos[comida.claveFuera]
                const estaAnalizando = comidaAnalizando === comida.clave

                return (
                  <ComidaCard
                    key={comida.clave}
                    comida={comida}
                    valor={valor}
                    valorAnterior={valorAnterior}
                    fuera={fuera}
                    analizando={estaAnalizando}
                    onActualizarTexto={txt => actualizarCampo(comida.clave, txt)}
                    onToggleFuera={() => actualizarCampo(comida.claveFuera, !fuera)}
                    onTomarFoto={() => {
                      tomarFotoOSeleccionar(comida.clave, textoDescrito => {
                        const textoActual = (datos[comida.clave] as string) || ''
                        const nuevo = textoActual ? `${textoActual}\n${textoDescrito}` : textoDescrito
                        actualizarCampo(comida.clave, nuevo)
                      })
                    }}
                  />
                )
              })}

              <AguaCard
                valor={(datos.agua as string) || ''}
                onCambiar={val => actualizarCampo('agua', val)}
              />

              <PesoCard
                peso={(datos.peso as string) || ''}
                ejercicio={(datos.ejercicio as string) || ''}
                onCambiarPeso={val => actualizarCampo('peso', val)}
                onCambiarEjercicio={val => actualizarCampo('ejercicio', val)}
                onFocusInput={handleFocusPeso}
              />

              <TouchableOpacity
                style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
                onPress={guardar}
                disabled={guardando}
                activeOpacity={0.8}
              >
                {guardando ? (
                  <View style={styles.saveBtnContent}>
                    <ActivityIndicator color={theme.colors.white} size="small" />
                    <Text style={styles.saveBtnText}>Guardando cambios...</Text>
                  </View>
                ) : estadoGuardado === 'guardado' ? (
                  <View style={styles.saveBtnContent}>
                    <FontAwesome name="check-circle" size={16} color={theme.colors.white} />
                    <Text style={styles.saveBtnText}>Cambios guardados</Text>
                  </View>
                ) : (
                  <View style={styles.saveBtnContent}>
                    <FontAwesome name="floppy-o" size={16} color={theme.colors.white} />
                    <Text style={styles.saveBtnText}>Guardar cambios</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.autoSaveNotice}>
                Tus datos se guardan automáticamente al escribir o cambiar de día.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Selector de Fecha Rápido (Modal Calendario) */}
      <CalendarModal
        visible={showCalendarModal}
        modo="single"
        fechaSeleccionada={fecha}
        titulo="Ir a un día"
        onSeleccionarFecha={f => void establecerFecha(f)}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* Exportar Resumen PDF */}
      <ExportarPdfModal
        visible={showPdfModal}
        userId={usuario.uid}
        nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
        onClose={() => setShowPdfModal(false)}
      />

      {/* Subida Múltiple con IA */}
      <BulkUploadModal
        visible={showBulkModal}
        userId={usuario.uid}
        onClose={() => setShowBulkModal(false)}
        onCompletado={() => void establecerFecha(fecha)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    elevation: 2,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  autoSaveNotice: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
})
