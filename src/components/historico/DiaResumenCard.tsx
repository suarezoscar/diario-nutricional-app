import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { formatearFechaLarga, hoy } from '../../utils/fechas'
import { useTheme } from '../../context/ThemeContext'
import type { DiaRangoResumen } from '../../hooks/useHistorico'
import { styles } from './DiaResumenCard.styles'
import { DiaResumenPills, COMIDAS_INFO } from './components/DiaResumenPills'
import { DiaResumenDetalle } from './components/DiaResumenDetalle'

export interface DiaResumenCardProps {
  dia: DiaRangoResumen
  onEditar: (fecha: string) => void
}

const HIT_SLOP_8 = Object.freeze({ top: 8, bottom: 8, left: 8, right: 8 })

/**
 * Tarjeta de resumen diario dentro de la vista de histórico.
 * Muestra el estado resumido del día con cápsulas y permite expandir para inspeccionar notas o editarlo en el diario.
 *
 * @param props - Datos agregados del día y manejador de edición.
 * @returns Tarjeta expandible con información nutricional del día.
 */
export const DiaResumenCard: React.FC<DiaResumenCardProps> = React.memo(({ dia, onEditar }) => {
  const { colors } = useTheme()
  const { fecha, datos } = dia
  const esHoy = fecha === hoy()
  const [desplegado, setDesplegado] = useState(false)

  const tieneComidas = COMIDAS_INFO.some(c => !!datos[c.clave])
  const tieneAgua = !!datos.agua
  const tienePeso = !!datos.peso
  const sinDatos = !tieneComidas && !tieneAgua && !tienePeso

  const handleToggle = useCallback(() => {
    if (!sinDatos) {
      setDesplegado(prev => !prev)
    }
  }, [sinDatos])

  const handleEditar = useCallback(() => {
    onEditar(fecha)
  }, [onEditar, fecha])

  return (
    <Card style={esHoy ? [styles.cardHoy, { borderColor: colors.primaryLight }] : undefined}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={sinDatos ? 1 : 0.75}>
        <View style={styles.header}>
          <View style={styles.dateWrap}>
            <Text style={[styles.dateText, { color: colors.text }, esHoy && { color: colors.primary }]}>
              {formatearFechaLarga(fecha)}
            </Text>
            {esHoy && (
              <View style={[styles.badgeHoy, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.badgeHoyText, { color: colors.primary }]}>Hoy</Text>
              </View>
            )}
            {!sinDatos && (
              <FontAwesome
                name={desplegado ? 'chevron-up' : 'chevron-down'}
                size={11}
                color={colors.textMuted}
                style={styles.chevronIcon}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.background }]}
            onPress={handleEditar}
            activeOpacity={0.7}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Editar registros del ${formatearFechaLarga(fecha)}`}
          >
            <FontAwesome name="pencil" size={13} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        {sinDatos ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros este día.</Text>
        ) : (
          <DiaResumenPills datos={datos} />
        )}
      </TouchableOpacity>

      {desplegado && !sinDatos && <DiaResumenDetalle datos={datos} />}
    </Card>
  )
})
