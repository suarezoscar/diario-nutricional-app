import React from 'react'
import { View, Text } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import type { Registro } from '../../../types'
import { styles } from '../DiaResumenCard.styles'

export interface ComidaPillConfig {
  clave: string
  label: string
  fueraClave: string
  icono: keyof typeof FontAwesome.glyphMap
}

export const COMIDAS_INFO: ComidaPillConfig[] = [
  { clave: 'desayuno', label: 'Des', fueraClave: 'desayunoFuera', icono: 'coffee' },
  { clave: 'mediaManana', label: 'MM', fueraClave: 'mediaMananaFuera', icono: 'sun-o' },
  { clave: 'comida', label: 'Com', fueraClave: 'comidaFuera', icono: 'cutlery' },
  { clave: 'merienda', label: 'Mer', fueraClave: 'meriendaFuera', icono: 'apple' },
  { clave: 'cena', label: 'Cen', fueraClave: 'cenaFuera', icono: 'moon-o' },
]

export interface DiaResumenPillsProps {
  datos: Partial<Registro>
}

/**
 * Indicadores tipo cápsula (pills) para las comidas y métricas de un día en el histórico.
 * Muestra el icono de cada comida delante de la etiqueta y el icono de ubicación si se comió fuera.
 *
 * @param props - Registro de datos del día con comidas, agua y ejercicio.
 * @returns Fila de cápsulas con iconos y métricas asociadas.
 */
export const DiaResumenPills: React.FC<DiaResumenPillsProps> = React.memo(({ datos }) => {
  const { colors, esOscuro } = useTheme()
  const tieneAgua = !!datos.agua

  const fueraBg = esOscuro ? '#3a2208' : '#fff3e0'
  const fueraColor = esOscuro ? '#ffb74d' : '#e65100'

  return (
    <View style={styles.content}>
      <View style={styles.mealsRow}>
        {COMIDAS_INFO.map(c => {
          const valor = datos[c.clave] as string
          const fuera = !!datos[c.fueraClave]
          const registrado = !!valor && valor.trim().length > 0
          const iconoColor = fuera ? fueraColor : registrado ? colors.primary : colors.textMuted

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
              <FontAwesome
                name={c.icono}
                size={10}
                color={iconoColor}
              />
              <Text
                style={[
                  styles.mealPillText,
                  { color: colors.textMuted },
                  registrado && { color: colors.primary, fontWeight: '700' },
                  fuera && { color: fueraColor, fontWeight: '700' },
                ]}
              >
                {c.label}
              </Text>
              {fuera && (
                <FontAwesome
                  name="map-marker"
                  size={10}
                  color={fueraColor}
                />
              )}
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

        {!!datos.ejercicio && (
          <View style={styles.metricItem}>
            <FontAwesome name="heartbeat" size={12} color={colors.primary} />
            <Text style={[styles.metricText, { color: colors.textMuted }]}>
              {datos.ejercicio as string}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
})
