import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { COMIDAS } from '../../config/comidas'
import { formatearFechaLarga, hoy } from '../../utils/fechas'
import { useTheme } from '../../context/ThemeContext'
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
  const { colors, esOscuro } = useTheme()
  const { fecha, datos } = dia
  const esHoy = fecha === hoy()
  const [desplegado, setDesplegado] = useState(false)

  const tieneComidas = COMIDAS_INFO.some(c => !!datos[c.clave])
  const tieneAgua = !!datos.agua
  const tienePeso = !!datos.peso
  const sinDatos = !tieneComidas && !tieneAgua && !tienePeso

  const fueraBg = esOscuro ? '#3a2208' : '#fff3e0'
  const fueraColor = esOscuro ? '#ffb74d' : '#e65100'

  return (
    <Card style={esHoy ? [styles.cardHoy, { borderColor: colors.primaryLight }] : undefined}>
      <TouchableOpacity
        onPress={() => !sinDatos && setDesplegado(prev => !prev)}
        activeOpacity={sinDatos ? 1 : 0.75}
      >
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
            onPress={() => onEditar(fecha)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome name="pencil" size={13} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        {sinDatos ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros este día.</Text>
        ) : (
          <View style={styles.content}>
            {/* Fila de comidas (pills) */}
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

            {/* Fila inferior con Agua y Ejercicio */}
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
        )}
      </TouchableOpacity>

      {/* Detalle Desplegado Readonly */}
      {desplegado && !sinDatos && (
        <View style={styles.detalleContainer}>
          <View style={[styles.detalleDivider, { backgroundColor: colors.border }]} />
          {COMIDAS.map(c => {
            const texto = (datos[c.clave] as string)?.trim()
            const fuera = !!datos[c.claveFuera]
            if (!texto && !fuera) return null

            return (
              <View
                key={c.clave}
                style={[
                  styles.comidaItem,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <View style={styles.comidaHeader}>
                  <View style={styles.comidaTituloWrap}>
                    <FontAwesome
                      name={c.icono as any}
                      size={13}
                      color={colors.primary}
                    />
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
  chevronIcon: {
    marginLeft: 3,
  },
  detalleContainer: {
    marginTop: theme.spacing.xs,
  },
  detalleDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  comidaItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  comidaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  comidaTituloWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comidaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fueraBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  fueraBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e65100',
  },
  comidaTexto: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  comidaVaciaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  extraDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extraText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  extraBold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
})
