import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'

/**
 * Propiedades del componente WidgetBotones.
 */
interface WidgetBotonesProps {
  /** Clave de la comida actual para deep linking */
  comidaClave: string
}

/**
 * Botones de acción rápida (Foto con IA y Escribir) para el Widget de Android.
 *
 * @param props - Propiedades con la clave de comida.
 * @returns Elemento FlexWidget con los botones de acción rápida.
 */
export const WidgetBotones: React.FC<WidgetBotonesProps> = ({ comidaClave }) => (
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
      <TextWidget text="📸" style={{ fontSize: 20, marginBottom: 1 }} />
      <TextWidget text="Foto (IA)" style={{ color: '#1b5e20', fontSize: 13, fontWeight: 'bold' }} />
      <TextWidget text="Auto-detectar" style={{ color: '#557257', fontSize: 9 }} />
    </FlexWidget>

    {/* Botón Escribir (abre teclado directamente) */}
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
      <TextWidget text="✍️" style={{ fontSize: 20, marginBottom: 1 }} />
      <TextWidget text="Escribir" style={{ color: '#1b5e20', fontSize: 13, fontWeight: 'bold' }} />
      <TextWidget text="Abrir teclado" style={{ color: '#557257', fontSize: 9 }} />
    </FlexWidget>
  </FlexWidget>
)
