import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { requestWidgetUpdate } from 'react-native-android-widget'
import { COMIDAS } from '../config/comidas'
import { hoy, formatearFechaCorta, obtenerComidaActual } from '../utils/fechas'
import { cargarConfiguracion } from './configService'
import { ComidaWidget, type ComidaWidgetProps } from '../widgets/ComidaWidget'
import { obtenerComidasPendientes } from '../utils/widgetUtils'
import type { Registro } from '../types'

export const STORAGE_KEY_HOY_REGISTRO = '@diario_nutricional_widget_hoy_v1'

/**
 * Guarda en caché local el registro de hoy para que el widget pueda leerlo
 * de forma instantánea y sin conexión a red.
 */
export async function guardarCacheHoyWidget(fecha: string, datos: Partial<Registro>): Promise<void> {
  try {
    const payload = JSON.stringify({ fecha, datos })
    await AsyncStorage.setItem(STORAGE_KEY_HOY_REGISTRO, payload)
  } catch (err) {
    console.warn('Error al guardar caché de hoy para widget:', err)
  }
}

/**
 * Carga el registro de hoy guardado en caché local.
 * Si no existe o corresponde a una fecha anterior, devuelve null.
 */
export async function cargarCacheHoyWidget(): Promise<Partial<Registro> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_HOY_REGISTRO)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { fecha: string; datos: Partial<Registro> }
    if (parsed.fecha !== hoy()) {
      return null
    }
    return parsed.datos || null
  } catch {
    return null
  }
}

/**
 * Genera el conjunto de propiedades necesarias para renderizar ComidaWidget.
 */
export async function obtenerWidgetProps(): Promise<ComidaWidgetProps> {
  const config = await cargarConfiguracion()
  const claveActual = obtenerComidaActual(config.horarios)
  const defComida = COMIDAS.find(c => c.clave === claveActual) || COMIDAS[2]
  const horario = config.horarios[claveActual]
  const datosHoy = await cargarCacheHoyWidget()
  const comidasPendientes = obtenerComidasPendientes(claveActual, datosHoy)

  return {
    comidaTitulo: defComida.titulo,
    comidaClave: claveActual,
    horarioRango: `${horario.inicio} - ${horario.fin}`,
    fechaHoy: formatearFechaCorta(hoy()),
    comidasPendientes,
  }
}

/**
 * Solicita una actualización inmediata del widget en el escritorio de Android
 * con los datos sincronizados más recientes.
 */
export async function actualizarWidgetAndroid(): Promise<void> {
  if (Platform.OS !== 'android') return

  try {
    const props = await obtenerWidgetProps()
    await requestWidgetUpdate({
      widgetName: 'ComidaWidget',
      renderWidget: () => <ComidaWidget {...props} />,
    })
  } catch {
    // Falla de forma segura si el widget no está instalado en el escritorio o en tests
  }
}

/**
 * Guarda en caché local los datos de hoy y refresca el widget de Android.
 */
export async function guardarCacheHoyYSincronizarWidget(datos: Partial<Registro>): Promise<void> {
  try {
    await guardarCacheHoyWidget(hoy(), datos)
    await actualizarWidgetAndroid()
  } catch (err) {
    console.warn('Error al sincronizar datos con el widget:', err)
  }
}
