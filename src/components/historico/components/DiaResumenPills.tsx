import React from 'react'
import { View, Text } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import type { Registro } from '../../../types'
import { styles } from '../DiaResumenCard.styles'

export const COMIDAS_INFO: { clave: string; label: string; fueraClave: string }[] = [
  { clave: 'desayuno', label: 'Des', fueraClave: 'desayunoFuera' },
  { clave: 'mediaManana', label: 'MM', fueraClave: 'mediaMananaFuera' },
  { clave: 'comida', label: 'Com', fueraClave: 'comidaFuera' },
  { clave: 'merienda', label: 'Mer', fueraClave: 'meriendaFuera' },
  { clave: 'cena', label: 'Cen', fueraClave: 'cenaFuera' },
]

export interface DiaResumenPillsProps {
  datos: Partial<Registro>
}

/**
 * Indicadores tipo cápsula (pills) para las comidas y métricas de un día en el histórico.
 *
 * @param props - Registro de datos del día con comidas, agua, peso y ejercicio.
 * @returns Fila de cápsulas y resumen de métricas diarias.
 */
export const DiaResumenPills: React.FC<DiaResumenPillsProps> = React.memo(({ datos }) => {
  const { colors, esOscuro } = useTheme()
  const tieneAgua = !!datos.agua
  const tienePeso = !!datos.peso

  const fueraBg = esOscuro ? '#3a2208' : '#fff3e0'
  const fueraColor = esOscuro ? '#ffb74d' : '#e65100'

  return (
    <View style={styles.content}>
      <View style={styles.mealsRow}>
        {COMIDAS_INFO.map(c => {
          const valor = datos[c.clave] as string
          const fuera = !!datos[c.fueraClave]
          const registrado = !!valor && valor.trim().length > 0

          return (
            <View
              key={c.clave}
              style={[
                styles.mealPill,
                { backgroundColor: colors.background },
                registrado && { backgroundColor: colors.primarySoft },
                fuera && { backgroundColor: fueraBg },
              ]}
            >
              <Text
                style={[
                  styles.mealPillText,
                  { color: colors.textMuted },
                  registrado && { color: colors.primary, fontWeight: '700' },
                  fuera && { color: fueraColor, fontWeight: '700' },
                ]}
              >
                {c.label} {fuera ? '★' : ''}
              </Text>
            </View>
          )
        })}
      </View>

      <View style={styles.footerRow}>
        {tieneAgua && (
          <View style={styles.metricItem}>
            <FontAwesome name="tint" size={12} color={colors.water} />
            <Text style={[styles.metricText, { color: colors.textMuted }]}>{datos.agua} L</Text>
          </View>
        )}

        {tienePeso && (
          <View style={styles.metricItem}>
            <FontAwesome name="dashboard" size={12} color={colors.primary} />
            <Text style={[styles.metricText, { color: colors.textMuted }]}>{datos.peso} kg</Text>
          </View>
        )}

        {!!datos.ejercicio && (
          <View style={styles.metricItem}>
            <FontAwesome name="heartbeat" size={12} color={colors.primary} />
            <Text style={[styles.metricText, { color: colors.textMuted }]} numberOfLines={1}>
              {datos.ejercicio as string}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
})
