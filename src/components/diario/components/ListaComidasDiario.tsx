import React from 'react'
import { View, ScrollView } from 'react-native'
import { COMIDAS } from '../../../config/comidas'
import type { Registro } from '../../../types'
import { ComidaCard } from '../ComidaCard'

export interface ListaComidasDiarioProps {
  fecha: string
  datosDia: Partial<Registro>
  datosAntDia?: Partial<Registro>
  comidaActual: string | null
  comidaAnalizando: string | null
  comidaAEnfocar: { clave: string; timestamp: number } | null
  accionWidgetTimestamp?: number
  cardLayoutsRef: React.MutableRefObject<Record<string, number>>
  scrollViewRef: React.RefObject<ScrollView | null>
  onActualizarCampo: (campo: keyof Registro, valor: string | boolean) => void
  onTomarFotoComida: (clave: string) => void
}

/**
 * Lista de tarjetas de comida para el día seleccionado en el diario.
 * Coordina las posiciones de layout para auto-scroll y estados de análisis por IA.
 *
 * @param props - Propiedades para renderizar y enlazar las comidas del día.
 * @returns Lista de componentes ComidaCard renderizados dentro de View contenedores.
 */
export const ListaComidasDiario: React.FC<ListaComidasDiarioProps> = React.memo(({
  fecha,
  datosDia,
  datosAntDia,
  comidaActual,
  comidaAnalizando,
  comidaAEnfocar,
  accionWidgetTimestamp,
  cardLayoutsRef,
  scrollViewRef,
  onActualizarCampo,
  onTomarFotoComida,
}) => {
  return (
    <>
      {COMIDAS.map(comida => {
        const valor = (datosDia[comida.clave] as string) || ''
        const valorAnterior = (datosAntDia?.[comida.clave] as string) || ''
        const fuera = !!datosDia[comida.claveFuera]
        const estaAnalizando = comidaAnalizando === comida.clave
        const debeEnfocar =
          comidaAEnfocar?.clave === comida.clave &&
          comidaAEnfocar?.timestamp === accionWidgetTimestamp

        return (
          <View
            key={`${comida.clave}_${fecha}`}
            onLayout={e => {
              const y = e.nativeEvent.layout.y
              cardLayoutsRef.current[comida.clave] = y
              if (comidaAEnfocar?.clave === comida.clave) {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true })
              }
            }}
          >
            <ComidaCard
              comida={comida}
              valor={valor}
              valorAnterior={valorAnterior}
              fuera={fuera}
              analizando={estaAnalizando}
              esActual={comidaActual === comida.clave}
              debeEnfocar={debeEnfocar}
              onActualizarCampo={onActualizarCampo}
              onTomarFotoComida={onTomarFotoComida}
            />
          </View>
        )
      })}
    </>
  )
})
