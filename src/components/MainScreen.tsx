import React from 'react'
import { View, Animated } from 'react-native'
import { Header } from './common/Header'
import { BottomNav } from './navigation/BottomNav'
import { DiarioView } from './diario/DiarioView'
import { HistoricoView } from './historico/HistoricoView'
import { PesoView } from './peso/PesoView'
import { AjustesView } from './ajustes/AjustesView'
import { useTheme } from '../context/ThemeContext'
import type { UsuarioAutenticado } from '../types'
import { styles } from './MainScreen.styles'
import { useMainScreen } from './hooks/useMainScreen'

export interface MainScreenProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

/**
 * Pantalla principal y marco de navegación de la aplicación.
 * Aloja las cuatro vistas principales (Diario, Histórico, Peso, Ajustes)
 * con transiciones horizontales direccionales nativas a 60 FPS y barra inferior.
 *
 * @param props - Usuario autenticado y callbacks de cierre de sesión y actualizaciones.
 * @returns Estructura principal con cabeceras contextuales, vista activa y barra de navegación.
 */
export const MainScreen: React.FC<MainScreenProps> = ({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const { colors } = useTheme()
  const m = useMainScreen({ userId: usuario.uid })

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: m.tabFadeAnim,
            transform: [{ translateX: m.tabSlideAnim }],
          },
        ]}
      >
        {m.tabActiva === 'diario' && (
          <DiarioView
            usuario={usuario}
            fechaSeleccionada={m.fechaSeleccionada}
            onLimpiarFechaSeleccionada={m.handleLimpiarFecha}
            accionWidget={m.accionWidget}
            onLogout={onLogout}
            onVerificarActualizacion={onVerificarActualizacion}
          />
        )}

        {m.tabActiva === 'historico' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
              onAbrirPdf={m.handleAbrirHistoricoPdf}
            />
            <HistoricoView
              userId={usuario.uid}
              nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
              onEditarDia={m.irADiaEnDiario}
              showPdfModalExterno={m.showHistoricoPdf}
              onCerrarPdfModalExterno={m.handleCerrarHistoricoPdf}
            />
          </View>
        )}

        {m.tabActiva === 'peso' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <PesoView
              userId={usuario.uid}
              onSeleccionarDia={m.irADiaEnDiario}
            />
          </View>
        )}

        {m.tabActiva === 'ajustes' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <AjustesView
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
          </View>
        )}
      </Animated.View>

      <BottomNav tabActiva={m.tabActiva} onCambiarTab={m.cambiarTabConAnimacion} />
    </View>
  )
}
