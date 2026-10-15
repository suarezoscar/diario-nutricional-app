import React, { useCallback } from 'react'
import { Text, View, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { CalendarModal } from '../common/CalendarModal'
import { WeightChart } from './WeightChart'
import { WeightChartSkeleton } from './PesoSkeleton'
import { PesoStatsCard } from './components/PesoStatsCard'
import { PesoFormularioCard } from './components/PesoFormularioCard'
import { PesoHistorialList } from './components/PesoHistorialList'
import { usePesoView } from './hooks/usePesoView'
import { useTheme } from '../../context/ThemeContext'
import { styles } from './PesoView.styles'

export interface PesoViewProps {
  userId: string
  onSeleccionarDia?: (fecha: string) => void
}

/**
 * Vista principal de evolución y registro del peso corporal.
 * Permite visualizar métricas históricas, gráfica de evolución y registrar
 * el peso para cualquier día seleccionado (por defecto hoy).
 *
 * @param props - Identificador del usuario y callback opcional para navegar al diario de un día.
 * @returns Pantalla con scroll vertical fluido y componentes de análisis corporal.
 */
export const PesoView: React.FC<PesoViewProps> = ({ userId, onSeleccionarDia }) => {
  const { colors } = useTheme()
  const v = usePesoView({ userId })

  const handleFocus = useCallback(() => v.setIsFocused(true), [v])
  const handleBlur = useCallback(() => v.setIsFocused(false), [v])

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
        <PesoStatsCard estadisticas={v.estadisticas} cargando={v.cargando} />

        <Card>
          <View style={styles.cardHeader}>
            <FontAwesome name="line-chart" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Evolución de peso</Text>
          </View>
          {v.cargando ? <WeightChartSkeleton /> : <WeightChart data={v.chartData} />}
        </Card>

        <PesoFormularioCard
          fechaPeso={v.fechaPeso}
          nuevoPeso={v.nuevoPeso}
          pesos={v.pesos}
          guardando={v.guardando}
          isFocused={v.isFocused}
          onCambiarTexto={v.setNuevoPeso}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onAbrirCalendario={v.handleAbrirCalendario}
          onIrAHoy={v.handleIrAHoy}
          onGuardar={v.handleGuardar}
        />

        <PesoHistorialList
          chartData={v.chartData}
          cargando={v.cargando}
          onSeleccionarDia={onSeleccionarDia}
          onConfirmarBorrado={v.confirmarBorrado}
        />
      </ScrollView>

      <CalendarModal
        visible={v.showCalendarModal}
        modo="single"
        fechaSeleccionada={v.fechaPeso}
        titulo="Seleccionar día del peso"
        onSeleccionarFecha={v.handleSeleccionarFecha}
        onClose={v.handleCerrarCalendario}
      />
    </>
  )
}
