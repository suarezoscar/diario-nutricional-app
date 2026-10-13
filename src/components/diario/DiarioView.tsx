import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { Header } from '../common/Header'
import { DateBar } from '../common/DateBar'
import { ComidaCard } from './ComidaCard'
import { AguaCard } from './AguaCard'
import { PesoCard } from './PesoCard'
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

  const {
    fecha,
    datos,
    datosAnterior,
    cargando,
    guardando,
    cambiarDia,
    irAHoy,
    establecerFecha,
    actualizarCampo,
    guardar,
  } = useDiario(usuario.uid)

  const { analizando, tomarFotoOSeleccionar } = useFotoPlato()

  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const prevFechaRef = useRef(fecha)

  useEffect(() => {
    if (prevFechaRef.current !== fecha) {
      const dir = fecha > prevFechaRef.current ? 1 : -1
      prevFechaRef.current = fecha

      fadeAnim.setValue(0.25)
      slideAnim.setValue(dir * 25)

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [fecha, fadeAnim, slideAnim])

  useEffect(() => {
    if (fechaSeleccionada && fechaSeleccionada !== fecha) {
      establecerFecha(fechaSeleccionada)
    }
  }, [fechaSeleccionada, fecha, establecerFecha])

  return (
    <View style={styles.container}>
      <Header
        usuario={usuario}
        onLogout={onLogout}
        onAbrirPdf={() => setShowPdfModal(true)}
        onAbrirSubidaMultiple={() => setShowBulkModal(true)}
        onVerificarActualizacion={onVerificarActualizacion}
      />
      <DateBar fecha={fecha} onCambiarDia={cambiarDia} onIrAHoy={irAHoy} />

      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando diario...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
          >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {COMIDAS.map(comida => {
            const valor = (datos[comida.clave] as string) || ''
            const valorAnterior = (datosAnterior?.[comida.clave] as string) || ''
            const fuera = !!datos[comida.claveFuera]

            return (
              <ComidaCard
                key={comida.clave}
                comida={comida}
                valor={valor}
                valorAnterior={valorAnterior}
                fuera={fuera}
                analizando={analizando}
                onActualizarTexto={texto => actualizarCampo(comida.clave, texto)}
                onToggleFuera={() => actualizarCampo(comida.claveFuera, !fuera)}
                onTomarFoto={() => {
                  tomarFotoOSeleccionar(textoDescrito => {
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
          />

            <TouchableOpacity
              style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
              onPress={guardar}
              disabled={guardando}
              activeOpacity={0.8}
            >
              {guardando ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    )}

      <ExportarPdfModal
        visible={showPdfModal}
        userId={usuario.uid}
        nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
        onClose={() => setShowPdfModal(false)}
      />

      <BulkUploadModal
        visible={showBulkModal}
        userId={usuario.uid}
        onClose={() => setShowBulkModal(false)}
        onCompletado={() => establecerFecha(fecha)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 160,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    elevation: 2,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})
