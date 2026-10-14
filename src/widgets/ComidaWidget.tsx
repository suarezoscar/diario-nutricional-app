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
        borderRadius: 18,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'diarionutricional://hoy' }}
    >
      {/* 1. Cabecera del Widget: Nombre de la App y botón Ir a Hoy */}
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
            text="🥗 Diario Nutricional"
            style={{
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
          <TextWidget
            text={`Hoy, ${fechaHoy}`}
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
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: '#43a047',
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

      {/* 2. Franja de Comida en Curso y Horario */}
      <FlexWidget
        style={{
          backgroundColor: '#27682c',
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
            paddingVertical: 10,
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
              fontSize: 22,
              marginBottom: 2,
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
            paddingVertical: 10,
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
              fontSize: 22,
              marginBottom: 2,
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
