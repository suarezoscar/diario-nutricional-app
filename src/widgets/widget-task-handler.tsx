import React from 'react'
import type { WidgetTaskHandlerProps } from 'react-native-android-widget'
import { ComidaWidget } from './ComidaWidget'
import { obtenerWidgetProps } from '../services/widgetService'

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
      const widgetProps = await obtenerWidgetProps()
      renderWidget(<ComidaWidget {...widgetProps} />)
      break
    }
    default:
      break
  }
}
