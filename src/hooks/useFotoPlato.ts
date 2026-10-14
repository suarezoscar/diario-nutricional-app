import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { describirPlatoConBase64 } from '../services/iaService'

/**
 * Hook para gestionar la captura o selección de fotos de platos y su análisis con IA.
 * Permite identificar individualmente qué comida está siendo analizada para mostrar
 * un skeleton o estado de carga solo en dicha comida.
 */
export function useFotoPlato() {
  const [comidaAnalizando, setComidaAnalizando] = useState<string | null>(null)

  const procesarFoto = async (
    comidaClave: string,
    onResultado: (texto: string) => void,
    fuente: 'camara' | 'galeria',
  ) => {
    try {
      if (fuente === 'camara') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para fotografiar el plato.')
          return
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar la foto.')
          return
        }
      }

      const opciones: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      }

      const resultado =
        fuente === 'camara'
          ? await ImagePicker.launchCameraAsync(opciones)
          : await ImagePicker.launchImageLibraryAsync(opciones)

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        return
      }

      const asset = resultado.assets[0]
      if (!asset.base64) {
        Alert.alert('Error', 'No se pudo obtener los datos de la imagen')
        return
      }

      const base64 = asset.base64
      const mimeType = asset.mimeType || 'image/jpeg'

      setComidaAnalizando(comidaClave)
      const descripcion = await describirPlatoConBase64(base64, mimeType)
      onResultado(descripcion)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar la fotografía'
      Alert.alert('Error IA', msg)
    } finally {
      setComidaAnalizando(null)
    }
  }

  const tomarFotoOSeleccionar = useCallback(
    (comidaClave: string, onResultado: (texto: string) => void) => {
      Alert.alert(
        'Foto del plato (IA)',
        '¿Cómo deseas añadir la foto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Galería', onPress: () => void procesarFoto(comidaClave, onResultado, 'galeria') },
          { text: 'Cámara', onPress: () => void procesarFoto(comidaClave, onResultado, 'camara') },
        ],
        { cancelable: true },
      )
    },
    [],
  )

  return {
    analizando: Boolean(comidaAnalizando),
    comidaAnalizando,
    tomarFotoOSeleccionar,
  }
}
