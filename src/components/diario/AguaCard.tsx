import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { theme } from '../../utils/theme'

interface AguaCardProps {
  valor: string
  onCambiar: (nuevoValor: string) => void
}

export const AguaCard: React.FC<AguaCardProps> = ({ valor, onCambiar }) => {
  const litros = parseFloat(valor) || 0

  const sumar = (delta: number) => {
    const nuevo = Math.max(0, +(litros + delta).toFixed(2))
    onCambiar(nuevo === 0 ? '' : nuevo.toString())
  }

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <FontAwesome name="tint" size={16} color={theme.colors.water} style={styles.icon} />
          <Text style={styles.title}>Agua consumida</Text>
        </View>
        <Text style={styles.litrosText}>{litros.toFixed(2)} L</Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity style={styles.btn} onPress={() => sumar(-1)} activeOpacity={0.65}>
          <Text style={styles.btnText}>-1L</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => sumar(-0.5)} activeOpacity={0.65}>
          <Text style={styles.btnText}>-0.5L</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPlus]} onPress={() => sumar(0.5)} activeOpacity={0.65}>
          <Text style={[styles.btnText, styles.btnPlusText]}>+0.5L</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPlus]} onPress={() => sumar(1)} activeOpacity={0.65}>
          <Text style={[styles.btnText, styles.btnPlusText]}>+1L</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )
}

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
    color: theme.colors.text,
  },
  litrosText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.water,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  btnPlus: {
    backgroundColor: theme.colors.waterSoft,
    borderColor: theme.colors.water,
  },
  btnPlusText: {
    color: theme.colors.water,
  },
})
