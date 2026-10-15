import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'

/**
 * Propiedades del componente WidgetHeader.
 */
interface WidgetHeaderProps {
  /** Texto legible de la fecha de hoy */
  fechaHoy: string
}

/**
 * Cabecera superior del Widget Android con el título de la app y la fecha actual.
 *
 * @param props - Propiedades del encabezado.
 * @returns Elemento FlexWidget con el encabezado.
 */
export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ fechaHoy }) => (
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
      style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}
    />
    <TextWidget
      text={`Hoy, ${fechaHoy}`}
      style={{ color: '#c8e6c9', fontSize: 11, fontWeight: 'bold' }}
    />
  </FlexWidget>
)
