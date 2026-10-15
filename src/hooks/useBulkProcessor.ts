import { useState, useRef, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { describirPlatoConBase64 } from '../services/iaService'
import { asignarComidaPorHora, extraerFechaYHoraDeFoto } from '../utils/fechas'
import { cargarConfiguracion } from '../services/configService'
import { persistirLoteEnDias, type ItemFotoLote } from '../services/bulkUploadService'

export type { ItemFotoLote }

/**
 * Custom Hook para gestionar la carga masiva y análisis concurrente de fotografías mediante IA.
 *
 * @param userId - Identificador único del usuario autenticado.
 * @returns Colección de elementos, estados de procesamiento y manejadores.
 */
export function useBulkProcessor(userId: string) {
  const [items, setItems] = useState<ItemFotoLote[]>([])
  const [procesando, setProcesando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const canceladoRef = useRef(false)

  const procesarCola = useCallback(async (colaItems: ItemFotoLote[]) => {
    setProcesando(true)
    canceladoRef.current = false
    const CONCURRENCIA = 2
    let indice = 0

    async function trabajador() {
      while (indice < colaItems.length) {
        if (canceladoRef.current) break
        const curIdx = indice++
        const item = colaItems[curIdx]
        if (!item || item.estado === 'listo' || !item.base64) continue

        setItems(prev => prev.map(it => (it.id === item.id ? { ...it, estado: 'analizando' } : it)))
        try {
          const desc = await describirPlatoConBase64(item.base64)
          setItems(prev => prev.map(it => (it.id === item.id ? { ...it, estado: 'listo', descripcion: desc, base64: undefined } : it)))
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error en IA'
          setItems(prev => prev.map(it => (it.id === item.id ? { ...it, estado: 'error', error: msg, base64: undefined } : it)))
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCIA }, () => trabajador()))
    setProcesando(false)
  }, [])

  const seleccionarFotos = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      exif: true,
    })

    if (res.canceled || !res.assets || res.assets.length === 0) return

    const config = await cargarConfiguracion()
    const nuevos: ItemFotoLote[] = await Promise.all(
      res.assets.map(async (asset, idx) => {
        const info = await extraerFechaYHoraDeFoto(asset)
        const comidaSugerida = asignarComidaPorHora(info.hora, info.minuto, config.horarios)
        return {
          id: `${Date.now()}_${idx}`,
          uri: asset.uri,
          base64: asset.base64 || undefined,
          comidaClave: comidaSugerida,
          fecha: info.fecha,
          horaFormateada: info.horaFormateada,
          descripcion: '',
          estado: 'pendiente' as const,
        }
      }),
    )

    setItems(prev => [...prev, ...nuevos])
    procesarCola(nuevos)
  }, [procesarCola])

  const actualizarItem = useCallback((id: string, patch: Partial<ItemFotoLote>) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
  }, [])

  const eliminarItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }, [])

  const limpiar = useCallback(() => {
    canceladoRef.current = true
    setItems([])
  }, [])

  const guardarLote = useCallback(async () => {
    setGuardando(true)
    try {
      const guardados = await persistirLoteEnDias(userId, items)
      if (guardados > 0) setItems([])
      return guardados
    } finally {
      setGuardando(false)
    }
  }, [items, userId])

  return {
    items, procesando, guardando, seleccionarFotos, actualizarItem, eliminarItem, guardarLote, limpiar,
  }
}
