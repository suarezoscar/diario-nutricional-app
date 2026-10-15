import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'

interface AguaCardProps {
  valor: string
  onCambiar: (nuevoValor: string) => void
}

export const AguaCard: React.FC<AguaCardProps> = React.memo(({ valor, onCambiar }) => {
  const { colors } = useTheme()
  const litros = parseFloat(valor) || 0

  const sumar = useCallback((delta: number) => {
    const actual = parseFloat(valor) || 0
    const nuevo = Math.max(0, +(actual + delta).toFixed(2))
    onCambiar(nuevo === 0 ? '' : nuevo.toString())
  }, [valor, onCambiar])

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <FontAwesome name="tint" size={16} color={colors.water} style={styles.icon} />
          <Text style={[styles.title, { color: colors.text }]}>Agua consumida</Text>
        </View>
        <Text style={[styles.litrosText, { color: colors.water }]}>{litros.toFixed(2)} L</Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => sumar(-1)}
          activeOpacity={0.65}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>-1L</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => sumar(-0.5)}
          activeOpacity={0.65}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>-0.5L</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            styles.btnPlus,
            { backgroundColor: colors.waterSoft, borderColor: colors.water },
          ]}
          onPress={() => sumar(0.5)}
          activeOpacity={0.65}
        >
          <Text style={[styles.btnText, styles.btnPlusText, { color: colors.water }]}>+0.5L</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            styles.btnPlus,
            { backgroundColor: colors.waterSoft, borderColor: colors.water },
          ]}
          onPress={() => sumar(1)}
          activeOpacity={0.65}
        >
          <Text style={[styles.btnText, styles.btnPlusText, { color: colors.water }]}>+1L</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )
})

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  litrosText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnPlus: {},
  btnPlusText: {},
})
