import { useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import {
  comprobarActualizacion,
  abrirDescargaApk,
  type InfoActualizacion,
} from '../services/updateService'

export function useActualizador() {
  const [actualizacion, setActualizacion] = useState<InfoActualizacion | null>(null)

  const verificar = useCallback(async (mostrarAlertaSiNoHay = false) => {
    const info = await comprobarActualizacion()
    if (info) {
      setActualizacion(info)
      Alert.alert(
        'Actualización disponible',
        `Existe una nueva versión (${info.versionNueva}). ¿Deseas descargarla e instalarla ahora?`,
        [
          { text: 'Más tarde', style: 'cancel' },
          {
            text: 'Descargar e Instalar',
            onPress: () => void abrirDescargaApk(info.urlDescarga),
          },
        ],
        { cancelable: true },
      )
    } else if (mostrarAlertaSiNoHay) {
      Alert.alert('Al día', 'Ya tienes la última versión instalada.')
    }
  }, [])

  useEffect(() => {
    // Comprobación silenciosa al inicio
    void verificar(false)
  }, [verificar])

  return {
    actualizacion,
    verificarManual: () => void verificar(true),
  }
}
