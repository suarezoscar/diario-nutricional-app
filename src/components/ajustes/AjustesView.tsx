import React from 'react'
import { ScrollView } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import type { UsuarioAutenticado } from '../../types'
import { useAjustes } from './hooks/useAjustes'
import { SeccionTema } from './components/SeccionTema'
import { SeccionHorarios } from './components/SeccionHorarios'
import { SeccionNotificaciones } from './components/SeccionNotificaciones'
import { SeccionCuenta } from './components/SeccionCuenta'
import { styles } from './AjustesView.styles'

export interface AjustesViewProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

/**
 * Vista principal de Ajustes y Configuración de la aplicación.
 * Orquesta de forma modular la apariencia, horarios, recordatorios y cuenta.
 */
export const AjustesView: React.FC<AjustesViewProps> = React.memo(({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const { colors } = useTheme()
  const {
    horarios,
    notificaciones,
    guardadoFeedback,
    toggleRecordatorioComidas,
    toggleRecordatorioFinJornada,
    modificarHoraFinJornada,
    handleProbarNotificacion,
    modificarHorario,
    restablecerValoresPorDefecto,
  } = useAjustes()

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SeccionTema />

      <SeccionHorarios
        horarios={horarios}
        guardadoFeedback={guardadoFeedback}
        onModificarHorario={modificarHorario}
        onRestablecer={restablecerValoresPorDefecto}
      />

      <SeccionNotificaciones
        notificaciones={notificaciones}
        onToggleComidas={toggleRecordatorioComidas}
        onToggleFinJornada={toggleRecordatorioFinJornada}
        onModificarHoraFin={modificarHoraFinJornada}
        onProbarNotificacion={handleProbarNotificacion}
      />

      <SeccionCuenta
        usuario={usuario}
        onLogout={onLogout}
        onVerificarActualizacion={onVerificarActualizacion}
      />
    </ScrollView>
  )
})
