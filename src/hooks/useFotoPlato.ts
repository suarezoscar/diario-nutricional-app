import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { describirPlatoConBase64 } from '../services/iaService'

export function useFotoPlato() {
  const [analizando, setAnalizando] = useState(false)

  const procesarFoto = async (
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

      setAnalizando(true)
      const descripcion = await describirPlatoConBase64(base64, mimeType)
      onResultado(descripcion)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar la fotografía'
      Alert.alert('Error IA', msg)
    } finally {
      setAnalizando(false)
    }
  }

  const tomarFotoOSeleccionar = useCallback(
    (onResultado: (texto: string) => void) => {
      Alert.alert(
        'Foto del plato (IA)',
        '¿Cómo deseas añadir la foto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Galería', onPress: () => void procesarFoto(onResultado, 'galeria') },
          { text: 'Cámara', onPress: () => void procesarFoto(onResultado, 'camara') },
        ],
        { cancelable: true },
      )
    },
    [],
  )

  return {
    analizando,
    tomarFotoOSeleccionar,
  }
}
