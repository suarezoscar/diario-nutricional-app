import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'
import { formatearListaPendientes } from '../utils/widgetUtils'

export interface ComidaWidgetProps {
  comidaTitulo: string
  comidaClave: string
  horarioRango: string
  fechaHoy: string
  comidasPendientes?: string[]
}

/**
 * Componente visual del Widget nativo para la pantalla de inicio (escritorio) de Android.
 * Muestra:
 * 1. Cabecera limpia con el nombre de la app y la fecha de hoy (pulsar en el widget ya abre hoy).
 * 2. Franja de comida en curso con horario y resumen de comidas pendientes de anotar
 *    (o mensaje con carita sonriente si todo está al día).
 * 3. Botones protagonistas de acción rápida: Foto (IA) y Escribir (abre teclado en comida actual).
 */
export function ComidaWidget({
  comidaTitulo,
  comidaClave,
  horarioRango,
  fechaHoy,
  comidasPendientes = [],
}: ComidaWidgetProps) {
  const hayPendientes = comidasPendientes.length > 0
  const textoPendientes = hayPendientes
    ? `Pendiente anotar: ${formatearListaPendientes(comidasPendientes)}`
    : '¡Todo anotado hoy! 😊'

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
      {/* 1. Cabecera del Widget: Nombre de la App y Fecha de Hoy (sin botón redundante) */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="🥗 Diario Nutricional"
          style={{
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={`Hoy, ${fechaHoy}`}
          style={{
            color: '#c8e6c9',
            fontSize: 11,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* 2. Franja de Comida en Curso y Estado de Anotaciones Pendientes */}
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
        {/* Comida en curso y Horario */}
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
              style={{
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            />
            <TextWidget
              text=" ● En curso"
              style={{
                color: '#a5d6a7',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
          </FlexWidget>

          <TextWidget
            text={horarioRango}
            style={{
              color: '#e8f5e9',
              fontSize: 10,
            }}
          />
        </FlexWidget>

        {/* Indicador de Comidas Pendientes o Todo al Día */}
        <FlexWidget
          style={{
            marginTop: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
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

      {/* 3. Botones Protagonistas de Acción Rápida (Cámara IA y Escribir con teclado) */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 'match_parent',
          flexGap: 10,
          marginTop: 6,
        }}
      >
        {/* Botón Cámara con IA */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 14,
            paddingVertical: 9,
            paddingHorizontal: 6,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=foto` }}
        >
          <TextWidget
            text="📸"
            style={{
              fontSize: 20,
              marginBottom: 1,
            }}
          />
          <TextWidget
            text="Foto (IA)"
            style={{
              color: '#1b5e20',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text="Auto-detectar"
            style={{
              color: '#557257',
              fontSize: 9,
            }}
          />
        </FlexWidget>

        {/* Botón Escribir (despliega teclado de inmediato) */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 14,
            paddingVertical: 9,
            paddingHorizontal: 6,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=texto` }}
        >
          <TextWidget
            text="✍️"
            style={{
              fontSize: 20,
              marginBottom: 1,
            }}
          />
          <TextWidget
            text="Escribir"
            style={{
              color: '#1b5e20',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text="Abrir teclado"
            style={{
              color: '#557257',
              fontSize: 9,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  )
}
