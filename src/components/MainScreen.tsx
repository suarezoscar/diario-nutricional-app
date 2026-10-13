import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header } from './common/Header'
import { BottomNav } from './navigation/BottomNav'
import { DiarioView } from './diario/DiarioView'
import { HistoricoView } from './historico/HistoricoView'
import { PesoView } from './peso/PesoView'
import { theme } from '../utils/theme'
import type { TabPrincipal, UsuarioAutenticado } from '../types'

interface MainScreenProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

export const MainScreen: React.FC<MainScreenProps> = ({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const [tabActiva, setTabActiva] = useState<TabPrincipal>('diario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | undefined>(undefined)

  const irADiaEnDiario = (fecha: string) => {
    setFechaSeleccionada(fecha)
    setTabActiva('diario')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabActiva === 'diario' && (
          <DiarioView
            usuario={usuario}
            fechaSeleccionada={fechaSeleccionada}
            onLogout={onLogout}
            onVerificarActualizacion={onVerificarActualizacion}
          />
        )}

        {tabActiva === 'historico' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <HistoricoView
              userId={usuario.uid}
              nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
              onEditarDia={irADiaEnDiario}
            />
          </View>
        )}

        {tabActiva === 'peso' && (
          <View style={styles.pageWrap}>
            <Header
              usuario={usuario}
              onLogout={onLogout}
              onVerificarActualizacion={onVerificarActualizacion}
            />
            <PesoView
              userId={usuario.uid}
              onSeleccionarDia={irADiaEnDiario}
            />
          </View>
        )}
      </View>

      <BottomNav tabActiva={tabActiva} onCambiarTab={setTabActiva} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  pageWrap: {
    flex: 1,
  },
})
