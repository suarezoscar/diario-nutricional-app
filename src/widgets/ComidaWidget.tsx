import React from 'react'
import { FlexWidget } from 'react-native-android-widget'
import { WidgetHeader } from './components/WidgetHeader'
import { WidgetComidaInfo } from './components/WidgetComidaInfo'
import { WidgetBotones } from './components/WidgetBotones'

/**
 * Propiedades del componente ComidaWidget.
 */
export interface ComidaWidgetProps {
  /** Nombre amigable de la comida (ej: Desayuno, Almuerzo) */
  comidaTitulo: string
  /** Clave interna de la comida (ej: comida1, comida3) */
  comidaClave: string
  /** Rango horario asignado (ej: 07:00 - 10:00) */
  horarioRango: string
  /** Fecha de hoy formateada */
  fechaHoy: string
  /** Lista opcional de comidas pendientes de anotar */
  comidasPendientes?: string[]
}

/**
 * Componente visual del Widget nativo para la pantalla de inicio de Android.
 *
 * @param props - Propiedades del widget.
 * @returns Elemento FlexWidget con la estructura completa del widget.
 */
export function ComidaWidget({
  comidaTitulo,
  comidaClave,
  horarioRango,
  fechaHoy,
  comidasPendientes = [],
}: ComidaWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1b5e20',
        borderRadius: 18,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'diarionutricional://hoy' }}
    >
      <WidgetHeader fechaHoy={fechaHoy} />
      <WidgetComidaInfo
        comidaTitulo={comidaTitulo}
        comidaClave={comidaClave}
        horarioRango={horarioRango}
        comidasPendientes={comidasPendientes}
      />
      <WidgetBotones comidaClave={comidaClave} />
    </FlexWidget>
  )
}
