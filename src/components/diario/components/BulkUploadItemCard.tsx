import React from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { formatearFechaCorta } from '../../../utils/fechas'
import type { ClaveComida } from '../../../types'
import type { ItemFotoLote } from '../../../hooks/useBulkProcessor'
import { styles } from '../BulkUploadModal.styles'

export const OPCIONES_COMIDA: { clave: ClaveComida; label: string }[] = [
  { clave: 'desayuno', label: 'Desayuno' },
  { clave: 'mediaManana', label: 'Med. Mañ.' },
  { clave: 'comida', label: 'Comida' },
  { clave: 'merienda', label: 'Merienda' },
  { clave: 'cena', label: 'Cena' },
]

const HIT_SLOP_8 = Object.freeze({ top: 8, bottom: 8, left: 8, right: 8 })

export interface BulkUploadItemCardProps {
  item: ItemFotoLote
  onEditarFecha: (id: string, fecha: string) => void
  onActualizarItem: (id: string, cambios: Partial<ItemFotoLote>) => void
  onEliminarItem: (id: string) => void
}

/**
 * Tarjeta individual para inspeccionar y editar un plato procesado en lote.
 * Permite cambiar la comida asignada, corregir la fecha o afinar la descripción generada por IA.
 *
 * @param props - Elemento de la cola, callbacks de edición y borrado.
 * @returns Tarjeta contenedora con previsualización, selector de comida y texto editable.
 */
export const BulkUploadItemCard: React.FC<BulkUploadItemCardProps> = React.memo(({
  item,
  onEditarFecha,
  onActualizarItem,
  onEliminarItem,
}) => {
  const { colors } = useTheme()

  return (
    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.uri }} style={styles.thumb} />
        <View style={styles.itemInfo}>
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={[styles.dateBadge, { backgroundColor: colors.background, borderColor: colors.primaryLight }]}
              onPress={() => onEditarFecha(item.id, item.fecha)}
              activeOpacity={0.7}
              hitSlop={HIT_SLOP_8}
              accessibilityLabel="Cambiar día asignado a la foto"
            >
              <FontAwesome name="calendar" size={11} color={colors.primary} />
              <Text style={[styles.dateBadgeText, { color: colors.primary }]}>
                {formatearFechaCorta(item.fecha)}
                {item.horaFormateada ? ` (${item.horaFormateada})` : ''}
              </Text>
              <FontAwesome name="pencil" size={10} color={colors.textMuted} />
            </TouchableOpacity>

            {item.estado === 'analizando' && (
              <View style={styles.statusPill}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textMuted }]}>Analizando...</Text>
              </View>
            )}
            {item.estado === 'listo' && (
              <View style={[styles.statusPill, { backgroundColor: colors.primarySoft }]}>
                <FontAwesome name="check" size={10} color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.primary }]}>Listo</Text>
              </View>
            )}
            {item.estado === 'error' && (
              <View style={[styles.statusPill, { backgroundColor: colors.errorSoft }]}>
                <FontAwesome name="exclamation-triangle" size={10} color={colors.error} />
                <Text style={[styles.statusText, { color: colors.error }]}>Error</Text>
              </View>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealSelector}>
            {OPCIONES_COMIDA.map(op => {
              const activo = item.comidaClave === op.clave
              return (
                <TouchableOpacity
                  key={op.clave}
                  style={[
                    styles.mealBtn,
                    { backgroundColor: colors.background },
                    activo && { backgroundColor: colors.primarySoft },
                  ]}
                  onPress={() => onActualizarItem(item.id, { comidaClave: op.clave })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.mealBtnText,
                      { color: colors.textMuted },
                      activo && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {op.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => onEliminarItem(item.id)}
          style={styles.delBtn}
          hitSlop={HIT_SLOP_8}
          activeOpacity={0.7}
          accessibilityLabel="Eliminar foto de la cola"
        >
          <FontAwesome name="trash-o" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.descInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
        multiline
        placeholder="Descripción del plato generada por IA..."
        placeholderTextColor={colors.textMuted}
        value={item.descripcion}
        onChangeText={txt => onActualizarItem(item.id, { descripcion: txt })}
      />
    </View>
  )
})
