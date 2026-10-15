import React, { useCallback } from 'react'
import { View, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Header } from '../common/Header'
import { DateBar } from '../common/DateBar'
import { FloatingSaveIndicator } from '../common/FloatingSaveIndicator'
import { AguaCard } from './AguaCard'
import { EjercicioCard } from './EjercicioCard'
import { DiarioSkeleton } from './DiarioSkeleton'
import { BotonGuardarDiario } from './components/BotonGuardarDiario'
import { ListaComidasDiario } from './components/ListaComidasDiario'
import { DiarioModales } from './components/DiarioModales'
import { useDiarioView } from './hooks/useDiarioView'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import type { UsuarioAutenticado } from '../../types'
import { styles } from './DiarioView.styles'

export interface DiarioViewProps {
  usuario: UsuarioAutenticado
  fechaSeleccionada?: string
  onLimpiarFechaSeleccionada?: () => void
  accionWidget?: { clave: string; accion: 'foto' | 'texto'; timestamp: number }
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

/**
 * Pantalla principal del Diario Nutricional.
 * Presenta las comidas del día, consumo de agua, registro de ejercicio
 * y coordina las acciones de exportación y análisis por IA.
 *
 * @param props - Propiedades de navegación, usuario y sincronización de fecha.
 * @returns Vista de registro nutricional con animaciones de transición fluidas.
 */
export const DiarioView: React.FC<DiarioViewProps> = ({
  usuario,
  fechaSeleccionada,
  onLimpiarFechaSeleccionada,
  accionWidget,
  onLogout,
  onVerificarActualizacion,
}) => {
  const { colors } = useTheme()
  const v = useDiarioView({ usuario, fechaSeleccionada, onLimpiarFechaSeleccionada, accionWidget })

  const handleCambiarAgua = useCallback((val: string) => v.actualizarCampo('agua', val), [v])
  const handleCambiarEjercicio = useCallback((val: string) => v.actualizarCampo('ejercicio', val), [v])
  const handleAbrirPdf = useCallback(() => v.setShowPdfModal(true), [v])
  const handleCerrarPdf = useCallback(() => v.setShowPdfModal(false), [v])
  const handleAbrirBulk = useCallback(() => v.setShowBulkModal(true), [v])
  const handleCerrarBulk = useCallback(() => v.setShowBulkModal(false), [v])
  const handleAbrirCalendario = useCallback(() => v.setShowCalendarModal(true), [v])
  const handleCerrarCalendario = useCallback(() => v.setShowCalendarModal(false), [v])
  const handleSeleccionarFecha = useCallback((f: string) => void v.establecerFecha(f), [v])
  const handleRecargarDia = useCallback(() => void v.establecerFecha(v.fecha), [v])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...v.panResponder.panHandlers}>
      <Header
        usuario={usuario}
        onLogout={onLogout}
        onAbrirPdf={handleAbrirPdf}
        onAbrirSubidaMultiple={handleAbrirBulk}
        onVerificarActualizacion={onVerificarActualizacion}
      />
      <DateBar
        fecha={v.fecha}
        cargando={v.esCargaInicial}
        onCambiarDia={v.cambiarDia}
        onIrAHoy={v.irAHoy}
        onAbrirCalendario={handleAbrirCalendario}
      />
      <FloatingSaveIndicator estado={v.estadoGuardado} topOffset={120} />

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={v.scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: v.keyboardHeight > 0 ? v.keyboardHeight + 80 : theme.spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Animated.View style={v.animatedContainerStyle}>
            {v.esCargaInicial ? (
              <DiarioSkeleton />
            ) : (
              <>
                <ListaComidasDiario
                  fecha={v.fecha}
                  datosDia={v.datosDia}
                  datosAntDia={v.datosAntDia}
                  comidaActual={v.comidaActual}
                  comidaAnalizando={v.comidaAnalizando}
                  comidaAEnfocar={v.comidaAEnfocar}
                  accionWidgetTimestamp={accionWidget?.timestamp}
                  cardLayoutsRef={v.cardLayoutsRef}
                  scrollViewRef={v.scrollViewRef}
                  onActualizarCampo={v.actualizarCampo}
                  onTomarFotoComida={v.handleTomarFotoComida}
                />

                <AguaCard
                  key={`agua_${v.fecha}`}
                  valor={(v.datosDia.agua as string) || ''}
                  onCambiar={handleCambiarAgua}
                />

                <EjercicioCard
                  key={`ejercicio_${v.fecha}`}
                  ejercicio={(v.datosDia.ejercicio as string) || ''}
                  onCambiarEjercicio={handleCambiarEjercicio}
                  onFocusInput={v.handleFocusEjercicio}
                />

                <BotonGuardarDiario
                  guardando={v.guardando}
                  estadoGuardado={v.estadoGuardado}
                  onGuardar={v.guardar}
                />
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DiarioModales
        visibleCalendar={v.showCalendarModal}
        fecha={v.fecha}
        onSeleccionarFecha={handleSeleccionarFecha}
        onCerrarCalendario={handleCerrarCalendario}
        visiblePdf={v.showPdfModal}
        usuario={usuario}
        onCerrarPdf={handleCerrarPdf}
        visibleBulk={v.showBulkModal}
        onCerrarBulk={handleCerrarBulk}
        onRecargarDia={handleRecargarDia}
      />
    </View>
  )
}
