import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'

interface ComidaWidgetProps {
  comidaTitulo: string
  comidaClave: string
  horarioRango: string
  fechaHoy: string
}

/**
 * Componente visual del Widget nativo para la pantalla de inicio (escritorio) de Android.
 * Renderiza la comida en curso, botón para ir a hoy y accesos rápidos de Foto y Texto.
 */
export function ComidaWidget({
  comidaTitulo,
  comidaClave,
  horarioRango,
  fechaHoy,
}: ComidaWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1b5e20',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'diarionutricional://hoy' }}
    >
      {/* Cabecera del Widget: Nombre de la App y botón Ir a Hoy */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text="Diario Nutricional"
            style={{
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text={fechaHoy}
            style={{
              color: '#c8e6c9',
              fontSize: 10,
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            backgroundColor: '#2e7d32',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: 'diarionutricional://hoy' }}
        >
          <TextWidget
            text="📅 Ir a Hoy"
            style={{
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Comida en curso */}
      <FlexWidget
        style={{
          backgroundColor: '#2e7d32',
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 6,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=texto` }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text={`🍽️ En curso: ${comidaTitulo}`}
            style={{
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text={horarioRango}
            style={{
              color: '#e8f5e9',
              fontSize: 10,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Botones de acción rápida para la comida actual */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 'match_parent',
          flexGap: 8,
        }}
      >
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            paddingVertical: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=foto` }}
        >
          <TextWidget
            text="📸 Foto (IA)"
            style={{
              color: '#1b5e20',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            paddingVertical: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: `diarionutricional://comida?clave=${comidaClave}&accion=texto` }}
        >
          <TextWidget
            text="✍️ Escribir"
            style={{
              color: '#1b5e20',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  )
}
