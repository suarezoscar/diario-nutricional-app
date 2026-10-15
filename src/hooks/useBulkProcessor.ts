import { useState, useRef, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { describirPlatoConBase64 } from '../services/iaService'
import { cargarDia, guardarDia } from '../services/registroService'
import { asignarComidaPorHora, extraerFechaYHoraDeFoto } from '../utils/fechas'
import { cargarConfiguracion } from '../services/configService'
import type { ClaveComida, Registro } from '../types'

export interface ItemFotoLote {
  id: string
  uri: string
  base64?: string
  comidaClave: ClaveComida
  fecha: string
  horaFormateada?: string
  descripcion: string
  estado: 'pendiente' | 'analizando' | 'listo' | 'error'
  error?: string
}

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

        setItems(prev =>
          prev.map(it => (it.id === item.id ? { ...it, estado: 'analizando' } : it)),
        )

        try {
          const desc = await describirPlatoConBase64(item.base64)
          setItems(prev =>
            prev.map(it =>
              it.id === item.id
                ? { ...it, estado: 'listo', descripcion: desc, base64: undefined }
                : it,
            ),
          )
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error en IA'
          setItems(prev =>
            prev.map(it =>
              it.id === item.id
                ? { ...it, estado: 'error', error: msg, base64: undefined }
                : it,
            ),
          )
        }
      }
    }

    const trabajadores = Array.from({ length: CONCURRENCIA }, () => trabajador())
    await Promise.all(trabajadores)
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
    const listos = items.filter(it => it.descripcion.trim().length > 0)
    if (listos.length === 0) return 0

    setGuardando(true)
    try {
      const diasAgrupados: Record<string, Partial<Registro>> = {}

      for (const item of listos) {
        if (!diasAgrupados[item.fecha]) {
          const diaActual = await cargarDia(userId, item.fecha)
          diasAgrupados[item.fecha] = { ...diaActual }
        }

        const actual = (diasAgrupados[item.fecha][item.comidaClave] as string) || ''
        const nuevoTexto = actual ? `${actual}\n${item.descripcion}` : item.descripcion
        diasAgrupados[item.fecha][item.comidaClave] = nuevoTexto
      }

      for (const [f, datosActualizados] of Object.entries(diasAgrupados)) {
        await guardarDia(userId, f, datosActualizados)
      }

      setItems([])
      return listos.length
    } finally {
      setGuardando(false)
    }
  }, [items, userId])

  return {
    items,
    procesando,
    guardando,
    seleccionarFotos,
    actualizarItem,
    eliminarItem,
    guardarLote,
    limpiar,
  }
}
