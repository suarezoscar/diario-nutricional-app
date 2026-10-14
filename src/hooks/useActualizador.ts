import { useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import {
  comprobarActualizacion,
  descargarEInstalarApk,
  abrirDescargaApk,
  type InfoActualizacion,
} from '../services/updateService'

export function useActualizador() {
  const [actualizacion, setActualizacion] = useState<InfoActualizacion | null>(null)
  const [descargando, setDescargando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  const verificar = useCallback(async (mostrarAlertaSiNoHay = false) => {
    try {
      const info = await comprobarActualizacion()
      if (info) {
        setActualizacion(info)
        setErrorDescarga(null)
        setProgreso(0)
      } else if (mostrarAlertaSiNoHay) {
        Alert.alert('Al día', 'Ya tienes la última versión instalada.')
      }
    } catch {
      if (mostrarAlertaSiNoHay) {
        Alert.alert('Error', 'No se pudo comprobar si hay actualizaciones.')
      }
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!actualizacion) return
    setDescargando(true)
    setErrorDescarga(null)
    setProgreso(0)

    try {
      await descargarEInstalarApk(actualizacion.urlDescarga, (pct) => {
        setProgreso(pct)
      })
      // Si el instalador se abrió con éxito, podemos ocultar el modal tras unos segundos
      setTimeout(() => {
        setDescargando(false)
      }, 1500)
    } catch (err: any) {
      console.error('Error durante la instalación:', err)
      setErrorDescarga(err?.message || 'Error al descargar o instalar la actualización.')
      setDescargando(false)
    }
  }, [actualizacion])

  const descartar = useCallback(() => {
    if (descargando) return
    setActualizacion(null)
    setErrorDescarga(null)
    setProgreso(0)
  }, [descargando])

  const abrirEnNavegador = useCallback(async () => {
    if (!actualizacion) return
    await abrirDescargaApk(actualizacion.urlDescarga)
  }, [actualizacion])

  useEffect(() => {
    // Comprobación silenciosa al inicio
    void verificar(false)
  }, [verificar])

  return {
    actualizacion,
    descargando,
    progreso,
    errorDescarga,
    instalar,
    descartar,
    abrirEnNavegador,
    verificarManual: () => void verificar(true),
  }
}
