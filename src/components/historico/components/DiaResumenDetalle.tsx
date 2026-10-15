import React from 'react'
import { View, Text } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { COMIDAS } from '../../../config/comidas'
import { useTheme } from '../../../context/ThemeContext'
import type { Registro } from '../../../types'
import { styles } from '../DiaResumenCard.styles'

export interface DiaResumenDetalleProps {
  datos: Partial<Registro>
}

/**
 * Detalle desplegado de lectura para un día en el histórico.
 * Muestra el contenido textual de cada comida, marcas de comida fuera y notas adicionales.
 *
 * @param props - Registro de datos del día a desplegar.
 * @returns Bloque con desglose ordenado de las comidas del día.
 */
export const DiaResumenDetalle: React.FC<DiaResumenDetalleProps> = React.memo(({ datos }) => {
  const { colors, esOscuro } = useTheme()
  const tieneAgua = !!datos.agua
  const tienePeso = !!datos.peso
  const fueraBg = esOscuro ? '#3a2208' : '#fff3e0'
  const fueraColor = esOscuro ? '#ffb74d' : '#e65100'

  return (
    <View style={styles.detalleContainer}>
      <View style={[styles.detalleDivider, { backgroundColor: colors.border }]} />
      {COMIDAS.map(c => {
        const texto = (datos[c.clave] as string)?.trim()
        const fuera = !!datos[c.claveFuera]
        if (!texto && !fuera) return null

        return (
          <View
            key={c.clave}
            style={[styles.comidaItem, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={styles.comidaHeader}>
              <View style={styles.comidaTituloWrap}>
                <FontAwesome name={c.icono as any} size={13} color={colors.primary} />
                <Text style={[styles.comidaTitulo, { color: colors.primary }]}>{c.titulo}</Text>
              </View>
              {fuera && (
                <View style={[styles.fueraBadge, { backgroundColor: fueraBg }]}>
                  <Text style={[styles.fueraBadgeText, { color: fueraColor }]}>Fuera</Text>
                </View>
              )}
            </View>
            {texto ? (
              <Text style={[styles.comidaTexto, { color: colors.text }]}>{texto}</Text>
            ) : (
              <Text style={[styles.comidaVaciaText, { color: colors.textMuted }]}>Comida fuera sin notas</Text>
            )}
          </View>
        )
      })}

      {(tieneAgua || tienePeso || !!datos.ejercicio) && (
        <View style={[styles.extraDetalles, { borderTopColor: colors.border }]}>
          {tieneAgua && (
            <View style={styles.extraItem}>
              <FontAwesome name="tint" size={12} color={colors.water} />
              <Text style={[styles.extraText, { color: colors.textMuted }]}>
                Agua: <Text style={[styles.extraBold, { color: colors.text }]}>{datos.agua} L</Text>
              </Text>
            </View>
          )}
          {tienePeso && (
            <View style={styles.extraItem}>
              <FontAwesome name="dashboard" size={12} color={colors.primary} />
              <Text style={[styles.extraText, { color: colors.textMuted }]}>
                Peso: <Text style={[styles.extraBold, { color: colors.text }]}>{datos.peso} kg</Text>
              </Text>
            </View>
          )}
          {!!datos.ejercicio && (
            <View style={styles.extraItem}>
              <FontAwesome name="heartbeat" size={12} color={colors.primary} />
              <Text style={[styles.extraText, { color: colors.textMuted }]}>
                Ejercicio: <Text style={[styles.extraBold, { color: colors.text }]}>{datos.ejercicio as string}</Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
})
