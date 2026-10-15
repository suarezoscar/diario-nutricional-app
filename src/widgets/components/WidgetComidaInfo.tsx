import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'
import { formatearListaPendientes } from '../../utils/widgetUtils'

/**
 * Propiedades del componente WidgetComidaInfo.
 */
interface WidgetComidaInfoProps {
  /** Título de la comida en curso */
  comidaTitulo: string
  /** Clave identificadora de la comida */
  comidaClave: string
  /** Rango horario asignado a la comida */
  horarioRango: string
  /** Lista opcional de comidas pendientes */
  comidasPendientes?: string[]
}

/**
 * Franja informativa del Widget Android que muestra la comida en curso y pendientes.
 *
 * @param props - Propiedades de estado de la comida.
 * @returns Elemento FlexWidget interactivo con la información de comida.
 */
export const WidgetComidaInfo: React.FC<WidgetComidaInfoProps> = ({
  comidaTitulo,
  comidaClave,
  horarioRango,
  comidasPendientes = [],
}) => {
  const hayPendientes = comidasPendientes.length > 0
  const textoPendientes = hayPendientes
    ? `Pendiente anotar: ${formatearListaPendientes(comidasPendientes)}`
    : '¡Todo anotado hoy! 😊'

  return (
    <FlexWidget
      style={{
        backgroundColor: '#27682c',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexDirection: 'column',
        width: 'match_parent',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=texto` }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text={`🍽️ ${comidaTitulo}`}
            style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}
          />
          <TextWidget
            text=" ● En curso"
            style={{ color: '#a5d6a7', fontSize: 10, fontWeight: 'bold' }}
          />
        </FlexWidget>

        <TextWidget
          text={horarioRango}
          style={{ color: '#e8f5e9', fontSize: 10 }}
        />
      </FlexWidget>

      <FlexWidget style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget
          text={hayPendientes ? `⏳ ${textoPendientes}` : `✨ ${textoPendientes}`}
          style={{
            color: hayPendientes ? '#ffe082' : '#a5d6a7',
            fontSize: 10,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  )
}
