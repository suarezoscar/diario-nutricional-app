import React from 'react'
import type { WidgetTaskHandlerProps } from 'react-native-android-widget'
import { ComidaWidget } from './ComidaWidget'
import { cargarConfiguracion } from '../services/configService'
import { obtenerComidaActual, formatearFechaCorta, hoy } from '../utils/fechas'
import { COMIDAS } from '../config/comidas'

/**
 * Manejador en segundo plano para renderizar y actualizar el widget de Android.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, renderWidget } = props

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': {
      const config = await cargarConfiguracion()
      const claveActual = obtenerComidaActual(config.horarios)
      const defComida = COMIDAS.find(c => c.clave === claveActual) || COMIDAS[2]
      const horario = config.horarios[claveActual]

      renderWidget(
        <ComidaWidget
          comidaTitulo={defComida.titulo}
          comidaClave={claveActual}
          horarioRango={`${horario.inicio} - ${horario.fin}`}
          fechaHoy={formatearFechaCorta(hoy())}
        />,
      )
      break
    }
    default:
      break
  }
}
