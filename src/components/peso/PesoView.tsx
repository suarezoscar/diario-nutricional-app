import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { WeightChart } from './WeightChart'
import { usePesoHistorial } from '../../hooks/usePesoHistorial'
import { hoy, formatearFechaLarga } from '../../utils/fechas'
import { theme } from '../../utils/theme'

interface PesoViewProps {
  userId: string
  onSeleccionarDia?: (fecha: string) => void
}

export const PesoView: React.FC<PesoViewProps> = ({ userId, onSeleccionarDia }) => {
  const { chartData, estadisticas, cargando, guardando, guardar, borrar } =
    usePesoHistorial(userId)

  const [nuevoPeso, setNuevoPeso] = useState('')
  const [fechaPeso, setFechaPeso] = useState(hoy())
  const [isFocused, setIsFocused] = useState(false)

  const handleGuardar = async () => {
    const val = parseFloat(nuevoPeso.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      Alert.alert('Valor inválido', 'Introduce un peso numérico válido en kg.')
      return
    }
    await guardar(fechaPeso, val)
    setNuevoPeso('')
  }

  const confirmarBorrado = (fecha: string, valor: number) => {
    Alert.alert(
      'Eliminar registro',
      `¿Deseas eliminar el registro de ${valor} kg del ${fecha}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => borrar(fecha) },
      ],
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Tarjeta de métricas */}
      {estadisticas && (
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ÚLTIMO PESO</Text>
              <Text style={styles.statVal}>{estadisticas.ultimoPeso} kg</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VARIACIÓN</Text>
              <Text
                style={[
                  styles.statVal,
                  estadisticas.diferencia < 0
                    ? styles.statValDown
                    : estadisticas.diferencia > 0
                    ? styles.statValUp
                    : null,
                ]}
              >
                {estadisticas.diferencia > 0 ? `+${estadisticas.diferencia}` : estadisticas.diferencia} kg
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MÍN / MÁX</Text>
              <Text style={styles.statValSmall}>
                {estadisticas.min} / {estadisticas.max}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Gráfica de evolución */}
      <Card>
        <View style={styles.cardHeader}>
          <FontAwesome name="line-chart" size={16} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.cardTitle}>Evolución de peso</Text>
        </View>
        {cargando ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <WeightChart data={chartData} />
        )}
      </Card>

      {/* Formulario de registro rápido */}
      <Card>
        <View style={styles.cardHeader}>
          <FontAwesome name="plus-circle" size={16} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.cardTitle}>Registrar nuevo peso</Text>
        </View>

        <View style={styles.formRow}>
          <TextInput
            style={[styles.input, isFocused && styles.inputFocused]}
            placeholder="Ej: 72.5"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            value={nuevoPeso}
            onChangeText={setNuevoPeso}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity
            style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
            onPress={handleGuardar}
            disabled={guardando}
            activeOpacity={0.7}
          >
            {guardando ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </Card>

      {/* Historial cronológico inverso */}
      <Card>
        <View style={styles.cardHeader}>
          <FontAwesome name="history" size={16} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.cardTitle}>Historial ({chartData.length})</Text>
        </View>

        {[...chartData].reverse().map(item => (
          <View key={item.fecha} style={styles.historyRow}>
            <TouchableOpacity
              style={styles.historyInfo}
              onPress={() => onSeleccionarDia?.(item.fecha)}
              activeOpacity={onSeleccionarDia ? 0.7 : 1}
            >
              <Text style={styles.historyDate}>{formatearFechaLarga(item.fecha)}</Text>
              <Text style={styles.historyWeight}>{item.peso} kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => confirmarBorrado(item.fecha, item.peso)}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <FontAwesome name="trash-o" size={15} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  statsCard: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryLight,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statValDown: {
    color: theme.colors.primary,
  },
  statValUp: {
    color: theme.colors.error,
  },
  statValSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: theme.colors.white,
    elevation: 2,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.md,
  },
  historyDate: {
    fontSize: 13,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  historyWeight: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
  },
})
