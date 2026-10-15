import React, { useState, useCallback } from 'react'
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Platform, StatusBar as RNStatusBar,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBulkProcessor } from '../../hooks/useBulkProcessor'
import { CalendarModal } from '../common/CalendarModal'
import { useTheme } from '../../context/ThemeContext'
import { styles } from './BulkUploadModal.styles'
import { BulkUploadHeader } from './components/BulkUploadHeader'
import { BulkUploadItemCard } from './components/BulkUploadItemCard'
import { BulkUploadFooter } from './components/BulkUploadFooter'

export interface BulkUploadModalProps {
  visible: boolean
  userId: string
  onClose: () => void
  onCompletado: () => void
}

/**
 * Modal de subida y procesamiento por IA en lote de fotografías de comidas.
 * Permite seleccionar múltiples imágenes de la galería, asignarlas automáticamente
 * a fechas y tipos de comida según sus metadatos EXIF, e insertarlas en el diario.
 *
 * @param props - Visibilidad, usuario y callbacks de finalización.
 * @returns Modal a pantalla completa con gestión de fotos en lote.
 */
export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  visible,
  userId,
  onClose,
  onCompletado,
}) => {
  const insets = useSafeAreaInsets()
  const { colors, esOscuro } = useTheme()
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
    16,
  )

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

  const [itemEditandoFecha, setItemEditandoFecha] = useState<{ id: string; fecha: string } | null>(null)

  const handleCerrar = useCallback(() => {
    limpiar()
    onClose()
  }, [limpiar, onClose])

  const handleGuardar = useCallback(async () => {
    const listos = items.filter(it => it.descripcion.trim().length > 0)
    if (listos.length === 0) {
      Alert.alert('Sin datos', 'No hay fotos con descripción listas para guardar.')
      return
    }

    const total = await guardarLote()
    Alert.alert('¡Guardado!', `Se han registrado ${total} platos en tu diario.`)
    onCompletado()
    handleCerrar()
  }, [items, guardarLote, onCompletado, handleCerrar])

  const handleEditarFecha = useCallback((id: string, fecha: string) => {
    setItemEditandoFecha({ id, fecha })
  }, [])

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCerrar} statusBarTranslucent={true}>
      <RNStatusBar barStyle={esOscuro ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BulkUploadHeader topPadding={topPadding} onClose={handleCerrar} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
        >
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.primaryLight }]}
            onPress={seleccionarFotos}
            activeOpacity={0.7}
            accessibilityLabel="Seleccionar fotos de la galería"
          >
            <FontAwesome name="plus-circle" size={18} color={colors.primary} />
            <Text style={[styles.pickerBtnText, { color: colors.primary }]}>Seleccionar fotos de la galería</Text>
          </TouchableOpacity>

          {procesando && (
            <View style={[styles.analyzingBanner, { backgroundColor: colors.primarySoft }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.analyzingText, { color: colors.primary }]}>Analizando platos con IA...</Text>
            </View>
          )}

          {items.map(item => (
            <BulkUploadItemCard
              key={item.id}
              item={item}
              onEditarFecha={handleEditarFecha}
              onActualizarItem={actualizarItem}
              onEliminarItem={eliminarItem}
            />
          ))}
        </ScrollView>

        <BulkUploadFooter
          itemsCount={items.filter(i => i.descripcion.trim().length > 0).length}
          guardando={guardando}
          onGuardar={handleGuardar}
        />
      </View>

      <CalendarModal
        visible={itemEditandoFecha !== null}
        modo="single"
        titulo="Asignar día a la foto"
        fechaSeleccionada={itemEditandoFecha?.fecha}
        onSeleccionarFecha={nuevaFecha => {
          if (itemEditandoFecha) {
            actualizarItem(itemEditandoFecha.id, { fecha: nuevaFecha })
          }
          setItemEditandoFecha(null)
        }}
        onClose={() => setItemEditandoFecha(null)}
      />
    </Modal>
  )
}
