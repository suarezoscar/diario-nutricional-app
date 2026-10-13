import React from 'react'
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useBulkProcessor } from '../../hooks/useBulkProcessor'
import { theme } from '../../utils/theme'
import type { ClaveComida } from '../../types'

interface BulkUploadModalProps {
  visible: boolean
  userId: string
  onClose: () => void
  onCompletado: () => void
}

const OPCIONES_COMIDA: { clave: ClaveComida; label: string }[] = [
  { clave: 'desayuno', label: 'Desayuno' },
  { clave: 'mediaManana', label: 'Med. Mañ.' },
  { clave: 'comida', label: 'Comida' },
  { clave: 'merienda', label: 'Merienda' },
  { clave: 'cena', label: 'Cena' },
]

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  visible,
  userId,
  onClose,
  onCompletado,
}) => {
  const {
    items,
    procesando,
    guardando,
    seleccionarFotos,
    actualizarItem,
    eliminarItem,
    guardarLote,
    limpiar,
  } = useBulkProcessor(userId)

  const handleCerrar = () => {
    limpiar()
    onClose()
  }

  const handleGuardar = async () => {
    const listos = items.filter(it => it.descripcion.trim().length > 0)
    if (listos.length === 0) {
      Alert.alert('Sin datos', 'No hay fotos con descripción listas para guardar.')
      return
    }

    const total = await guardarLote()
    Alert.alert('¡Guardado!', `Se han registrado ${total} comidas en tu diario.`)
    onCompletado()
    handleCerrar()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCerrar}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <FontAwesome name="camera-retro" size={18} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>Subida múltiple (IA)</Text>
          </View>
          <TouchableOpacity onPress={handleCerrar} style={styles.closeBtn}>
            <FontAwesome name="times" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
        >
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={seleccionarFotos}
            activeOpacity={0.7}
          >
            <FontAwesome name="plus-circle" size={18} color={theme.colors.primary} />
            <Text style={styles.pickerBtnText}>Seleccionar fotos de la galería</Text>
          </TouchableOpacity>

          {procesando && (
            <View style={styles.analyzingBanner}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.analyzingText}>Analizando platos con IA...</Text>
            </View>
          )}

          {items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Image source={{ uri: item.uri }} style={styles.thumb} />
                <View style={styles.itemInfo}>
                  <View style={styles.statusRow}>
                    {item.estado === 'analizando' && (
                      <View style={styles.statusPill}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.statusText}>Analizando...</Text>
                      </View>
                    )}
                    {item.estado === 'listo' && (
                      <View style={[styles.statusPill, styles.statusPillOk]}>
                        <FontAwesome name="check" size={11} color={theme.colors.primary} />
                        <Text style={[styles.statusText, styles.statusTextOk]}>Listo</Text>
                      </View>
                    )}
                    {item.estado === 'error' && (
                      <View style={[styles.statusPill, styles.statusPillErr]}>
                        <FontAwesome name="exclamation-triangle" size={11} color={theme.colors.error} />
                        <Text style={[styles.statusText, styles.statusTextErr]}>Reintentar</Text>
                      </View>
                    )}
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealSelector}>
                    {OPCIONES_COMIDA.map(op => {
                      const activo = item.comidaClave === op.clave
                      return (
                        <TouchableOpacity
                          key={op.clave}
                          style={[styles.mealBtn, activo && styles.mealBtnActivo]}
                          onPress={() => actualizarItem(item.id, { comidaClave: op.clave })}
                        >
                          <Text style={[styles.mealBtnText, activo && styles.mealBtnTextActivo]}>
                            {op.label}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>

                <TouchableOpacity
                  onPress={() => eliminarItem(item.id)}
                  style={styles.delBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome name="trash-o" size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.descInput}
                multiline
                placeholder="Descripción del plato generada por IA..."
                placeholderTextColor={theme.colors.textMuted}
                value={item.descripcion}
                onChangeText={txt => actualizarItem(item.id, { descripcion: txt })}
              />
            </View>
          ))}
        </ScrollView>

        {items.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
              onPress={handleGuardar}
              disabled={guardando}
              activeOpacity={0.8}
            >
              {guardando ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.guardarBtnText}>
                  Guardar en mi diario ({items.filter(i => i.descripcion.trim().length > 0).length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 3,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  analyzingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
  },
  analyzingText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  itemCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.sm,
  },
  itemInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  statusRow: {
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillOk: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  statusPillErr: {
    backgroundColor: theme.colors.errorSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  statusTextOk: {
    color: theme.colors.primary,
  },
  statusTextErr: {
    color: theme.colors.error,
  },
  mealSelector: {
    marginTop: 4,
  },
  mealBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    marginRight: 4,
  },
  mealBtnActivo: {
    backgroundColor: theme.colors.primarySoft,
  },
  mealBtnText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  mealBtnTextActivo: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  delBtn: {
    padding: theme.spacing.xs,
    marginLeft: 4,
  },
  descInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 13,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 50,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  guardarBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  guardarBtnDisabled: {
    opacity: 0.7,
  },
  guardarBtnText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
})
