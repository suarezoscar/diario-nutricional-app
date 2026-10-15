import { useMemo } from 'react'
import type { PuntoPeso } from '../../../types'

export const CHART_W = 340
export const CHART_H = 170
export const PAD_L = 38
export const PAD_R = 14
export const PAD_T = 16
export const PAD_B = 26
export const PLOT_W = CHART_W - PAD_L - PAD_R
export const PLOT_H = CHART_H - PAD_T - PAD_B

export interface GridLineInfo {
  y: number
  label: string
}

export interface CircleInfo {
  fecha: string
  cx: number
  cy: number
}

export interface XLabelInfo {
  fecha: string
  x: number
  fechaCorta: string
}

/**
 * Hook para calcular la geometría vectorial SVG (líneas, coordenadas y escalas) de la gráfica de evolución de peso.
 *
 * @param data - Arreglo de registros cronológicos de peso.
 * @returns Geometría precalculada para renderizado vectorial sin bloqueos en el hilo UI.
 */
export function useWeightChartGeometry(data: PuntoPeso[]) {
  return useMemo(() => {
    if (!data || data.length === 0) return null

    const values = data.map(d => d.peso)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const range = maxV - minV || 1
    const yMin = minV - range * 0.2
    const yMax = maxV + range * 0.2
    const ySpan = yMax - yMin

    const scaleX = (i: number) => PAD_L + (i / Math.max(data.length - 1, 1)) * PLOT_W
    const scaleY = (v: number) => PAD_T + (1 - (v - yMin) / ySpan) * PLOT_H

    const gridLines: GridLineInfo[] = Array.from({ length: 4 }, (_, i) => {
      const v = yMin + (ySpan / 3) * i
      return { y: scaleY(v), label: v.toFixed(1) }
    })

    const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`).join(' ')
    const fillPoints = [
      `${PAD_L},${scaleY(yMin)}`,
      ...data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`),
      `${scaleX(data.length - 1)},${scaleY(yMin)}`,
    ].join(' ')

    const circles: CircleInfo[] = data.map((d, i) => ({
      fecha: d.fecha,
      cx: scaleX(i),
      cy: scaleY(d.peso),
    }))

    const step = Math.max(1, Math.ceil(data.length / 5))
    const xLabels: XLabelInfo[] = data
      .map((d, idx) => ({ d, idx }))
      .filter(({ idx }) => idx % step === 0 || idx === data.length - 1)
      .map(({ d, idx }) => {
        const partes = d.fecha.split('-')
        return {
          fecha: d.fecha,
          x: scaleX(idx),
          fechaCorta: `${partes[2]}/${partes[1]}`,
        }
      })

    return {
      gridLines,
      points,
      fillPoints,
      circles,
      xLabels,
    }
  }, [data])
}
