import { useState, useRef, useEffect } from 'react'
import { ScrollView } from 'react-native'
import type { Registro } from '../../../types'

export interface UseDiarioWidgetSyncParams {
  accionWidget?: { clave: string; accion: 'foto' | 'texto'; timestamp: number }
  cargando: boolean
  datosDiaRef: React.MutableRefObject<Partial<Registro>>
  onTomarFoto: (clave: string, callback: (texto: string) => void) => void
  onActualizarCampo: (campo: keyof Registro, valor: string | boolean) => void
}

/**
 * Hook para procesar eventos provenientes de widgets externos de Android.
 * Soporta activación rápida de cámara IA y foco con auto-scroll a la comida correspondiente.
 *
 * @param params - Parámetros con el evento de widget, estado de carga y referencias.
 * @returns Referencias al ScrollView y layouts, junto con el estado del elemento enfocado.
 */
export function useDiarioWidgetSync({
  accionWidget,
  cargando,
  datosDiaRef,
  onTomarFoto,
  onActualizarCampo,
}: UseDiarioWidgetSyncParams) {
  const [comidaAEnfocar, setComidaAEnfocar] = useState<{ clave: string; timestamp: number } | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const ultimaAccionRef = useRef<number>(0)
  const cardLayoutsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    if (accionWidget && accionWidget.timestamp !== ultimaAccionRef.current) {
      ultimaAccionRef.current = accionWidget.timestamp
      if (accionWidget.accion === 'foto') {
        setTimeout(() => {
          onTomarFoto(accionWidget.clave, textoDescrito => {
            const textoActual = (datosDiaRef.current[accionWidget.clave] as string) || ''
            const nuevo = textoActual ? `${textoActual}\n${textoDescrito}` : textoDescrito
            onActualizarCampo(accionWidget.clave, nuevo)
          })
        }, 350)
      } else if (accionWidget.accion === 'texto') {
        setComidaAEnfocar({ clave: accionWidget.clave, timestamp: accionWidget.timestamp })
        const posY = cardLayoutsRef.current[accionWidget.clave]
        if (posY !== undefined) {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, posY - 20), animated: true })
        }
      }
    }
  }, [accionWidget, onTomarFoto, onActualizarCampo, datosDiaRef])

  useEffect(() => {
    if (comidaAEnfocar && !cargando) {
      const posY = cardLayoutsRef.current[comidaAEnfocar.clave]
      if (posY !== undefined) {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, posY - 20), animated: true })
      }
    }
  }, [comidaAEnfocar, cargando])

  return {
    scrollViewRef,
    cardLayoutsRef,
    comidaAEnfocar,
  }
}
