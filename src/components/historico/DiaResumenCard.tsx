import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { formatearFechaLarga, hoy } from '../../utils/fechas'
import { theme } from '../../utils/theme'
import type { DiaRangoResumen } from '../../hooks/useHistorico'

interface DiaResumenCardProps {
  dia: DiaRangoResumen
  onEditar: (fecha: string) => void
}

const COMIDAS_INFO: { clave: string; label: string; fueraClave: string }[] = [
  { clave: 'desayuno', label: 'Des', fueraClave: 'desayunoFuera' },
  { clave: 'mediaManana', label: 'MM', fueraClave: 'mediaMananaFuera' },
  { clave: 'comida', label: 'Com', fueraClave: 'comidaFuera' },
  { clave: 'merienda', label: 'Mer', fueraClave: 'meriendaFuera' },
  { clave: 'cena', label: 'Cen', fueraClave: 'cenaFuera' },
]

export const DiaResumenCard: React.FC<DiaResumenCardProps> = ({ dia, onEditar }) => {
  const { fecha, datos } = dia
  const esHoy = fecha === hoy()

  const tieneComidas = COMIDAS_INFO.some(c => !!datos[c.clave])
  const tieneAgua = !!datos.agua
  const tienePeso = !!datos.peso
  const sinDatos = !tieneComidas && !tieneAgua && !tienePeso

  return (
    <Card style={esHoy ? styles.cardHoy : undefined}>
      <View style={styles.header}>
        <View style={styles.dateWrap}>
          <Text style={[styles.dateText, esHoy && styles.dateTextHoy]}>
            {formatearFechaLarga(fecha)}
          </Text>
          {esHoy && (
            <View style={styles.badgeHoy}>
              <Text style={styles.badgeHoyText}>Hoy</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEditar(fecha)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome name="pencil" size={13} color={theme.colors.primary} />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {sinDatos ? (
        <Text style={styles.emptyText}>Sin registros este día.</Text>
      ) : (
        <View style={styles.content}>
          {/* Fila de comidas */}
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
                    registrado && styles.mealPillActive,
                    fuera && styles.mealPillFuera,
                  ]}
                >
                  <Text
                    style={[
                      styles.mealPillText,
                      registrado && styles.mealPillTextActive,
                      fuera && styles.mealPillTextFuera,
                    ]}
                  >
                    {c.label} {fuera ? '★' : ''}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Fila inferior con Agua y Ejercicio */}
          <View style={styles.footerRow}>
            {tieneAgua && (
              <View style={styles.metricItem}>
                <FontAwesome name="tint" size={12} color={theme.colors.water} />
                <Text style={styles.metricText}>{datos.agua} L</Text>
              </View>
            )}

            {tienePeso && (
              <View style={styles.metricItem}>
                <FontAwesome name="dashboard" size={12} color={theme.colors.primary} />
                <Text style={styles.metricText}>{datos.peso} kg</Text>
              </View>
            )}

            {!!datos.ejercicio && (
              <View style={styles.metricItem}>
                <FontAwesome name="heartbeat" size={12} color={theme.colors.primary} />
                <Text style={styles.metricText} numberOfLines={1}>
                  {datos.ejercicio as string}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  cardHoy: {
    borderColor: theme.colors.primaryLight,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  dateTextHoy: {
    color: theme.colors.primary,
  },
  badgeHoy: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  badgeHoyText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  content: {
    gap: 6,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mealPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  mealPillActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  mealPillFuera: {
    backgroundColor: '#fff3e0',
  },
  mealPillText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  mealPillTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  mealPillTextFuera: {
    color: '#e65100',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
})
