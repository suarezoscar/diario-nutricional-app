import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../context/ThemeContext'
import type { DiaGrid } from '../../../utils/fechas'
import type { RangoFechas } from '../hooks/useCalendarModal'
import { styles } from '../CalendarModal.styles'

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export interface CalendarDaysGridProps {
  diasGrid: DiaGrid[]
  modo: 'single' | 'range'
  fechaSeleccionada?: string
  rangoInterno: RangoFechas
  onPressDia: (dia: DiaGrid) => void
}

/**
 * Cuadrícula interactiva de días para el modal de calendario.
 * Soporta selección única y selección visual de rangos continuos.
 *
 * @param props - Días del mes, modo, selecciones activas y manejador de pulsación.
 * @returns Elemento visual con los días del mes organizados de lunes a domingo.
 */
export const CalendarDaysGrid: React.FC<CalendarDaysGridProps> = React.memo(({
  diasGrid,
  modo,
  fechaSeleccionada,
  rangoInterno,
  onPressDia,
}) => {
  const { colors } = useTheme()

  return (
    <>
      <View style={styles.weekDaysRow}>
        {DIAS_SEMANA.map((d, i) => (
          <Text key={i} style={[styles.weekDayText, { color: colors.textMuted }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {diasGrid.map(dia => {
          const esSingle = modo === 'single' && dia.fecha === fechaSeleccionada
          const esInicioRango = modo === 'range' && dia.fecha === rangoInterno.desde
          const esFinRango = modo === 'range' && dia.fecha === rangoInterno.hasta
          const enRango =
            modo === 'range' &&
            rangoInterno.desde &&
            rangoInterno.hasta &&
            dia.fecha > rangoInterno.desde &&
            dia.fecha < rangoInterno.hasta

          return (
            <View
              key={dia.fecha}
              style={[
                styles.dayCell,
                enRango && { backgroundColor: colors.primarySoft },
                esInicioRango && rangoInterno.hasta && [styles.dayCellStartRange, { backgroundColor: colors.primarySoft }],
                esFinRango && [styles.dayCellEndRange, { backgroundColor: colors.primarySoft }],
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  (esSingle || esInicioRango || esFinRango) && { backgroundColor: colors.primary },
                  dia.esHoy && !esSingle && !esInicioRango && !esFinRango && [styles.dayButtonToday, { borderColor: colors.primaryLight }],
                ]}
                onPress={() => onPressDia(dia)}
                activeOpacity={0.7}
                accessibilityLabel={`Día ${dia.numero} de ${dia.fecha}`}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: colors.text },
                    !dia.enMesActual && { color: colors.textMuted, opacity: 0.35 },
                    (esSingle || esInicioRango || esFinRango) && { color: '#ffffff', fontWeight: '700' },
                    dia.esHoy && !esSingle && !esInicioRango && !esFinRango && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {dia.numero}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })}
      </View>
    </>
  )
})
