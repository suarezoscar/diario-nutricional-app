import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import { COMIDAS } from '../../../config/comidas'
import { HORARIOS_POR_DEFECTO, type HorariosConfig } from '../../../services/configService'
import type { ClaveComida } from '../../../types'
import { styles } from '../AjustesView.styles'

export interface SeccionHorariosProps {
  horarios: HorariosConfig
  guardadoFeedback: boolean
  onModificarHorario: (comida: ClaveComida, campo: 'inicio' | 'fin', delta: number) => void
  onRestablecer: () => void
}

/**
 * Sección de configuración de franjas horarias por comida con selectores paso a paso.
 */
export const SeccionHorarios: React.FC<SeccionHorariosProps> = React.memo(({
  horarios,
  guardadoFeedback,
  onModificarHorario,
  onRestablecer,
}) => {
  const { colors } = useTheme()

  return (
    <Card>
      <View style={styles.cardHeaderBetween}>
        <View style={styles.cardHeader}>
          <FontAwesome name="clock-o" size={16} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Horarios de Comidas</Text>
        </View>
        {guardadoFeedback && (
          <View style={styles.badgeGuardado}>
            <FontAwesome name="check" size={10} color={colors.primary} />
            <Text style={[styles.badgeGuardadoText, { color: colors.primary }]}>Guardado</Text>
          </View>
        )}
      </View>

      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
        Ajusta tus franjas horarias para clasificar automáticamente tus fotos y comidas.
      </Text>

      <View style={styles.horariosList}>
        {COMIDAS.map(c => {
          const h = horarios[c.clave] || HORARIOS_POR_DEFECTO[c.clave]
          return (
            <View key={c.clave} style={[styles.horarioItem, { borderBottomColor: colors.border }]}>
              <View style={styles.horarioLabelWrap}>
                <FontAwesome
                  name={c.icono as keyof typeof FontAwesome.glyphMap}
                  size={14}
                  color={colors.primary}
                  style={{ width: 18 }}
                />
                <Text style={[styles.horarioTitulo, { color: colors.text }]}>{c.titulo}</Text>
              </View>

              <View style={styles.horarioControles}>
                {/* Control Inicio */}
                <View style={styles.timeBox}>
                  <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Inicio</Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                      onPress={() => onModificarHorario(c.clave, 'inicio', -30)}
                      accessibilityLabel={`Restar 30 min a inicio de ${c.titulo}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{h.inicio}</Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                      onPress={() => onModificarHorario(c.clave, 'inicio', 30)}
                      accessibilityLabel={`Sumar 30 min a inicio de ${c.titulo}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>a</Text>

                {/* Control Fin */}
                <View style={styles.timeBox}>
                  <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Fin</Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                      onPress={() => onModificarHorario(c.clave, 'fin', -30)}
                      accessibilityLabel={`Restar 30 min a fin de ${c.titulo}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{h.fin}</Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                      onPress={() => onModificarHorario(c.clave, 'fin', 30)}
                      accessibilityLabel={`Sumar 30 min a fin de ${c.titulo}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      <TouchableOpacity
        style={[styles.resetBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        onPress={onRestablecer}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Restablecer horarios a los valores por defecto"
      >
        <FontAwesome name="refresh" size={12} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[styles.resetBtnText, { color: colors.primary }]}>
          Restablecer horarios por defecto
        </Text>
      </TouchableOpacity>
    </Card>
  )
})
