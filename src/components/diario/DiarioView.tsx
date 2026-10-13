import React from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { Header } from '../common/Header'
import { DateBar } from '../common/DateBar'
import { ComidaCard } from './ComidaCard'
import { AguaCard } from './AguaCard'
import { PesoCard } from './PesoCard'
import { useDiario } from '../../hooks/useDiario'
import { useFotoPlato } from '../../hooks/useFotoPlato'
import { COMIDAS } from '../../config/comidas'
import { theme } from '../../utils/theme'
import type { UsuarioAutenticado } from '../../types'

interface DiarioViewProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
}

export const DiarioView: React.FC<DiarioViewProps> = ({ usuario, onLogout }) => {
  const {
    fecha,
    datos,
    cargando,
    guardando,
    cambiarDia,
    irAHoy,
    actualizarCampo,
    guardar,
  } = useDiario(usuario.uid)

  const { analizando, tomarFotoOSeleccionar } = useFotoPlato()

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header usuario={usuario} onLogout={onLogout} />
      <DateBar fecha={fecha} onCambiarDia={cambiarDia} onIrAHoy={irAHoy} />

      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando diario...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {COMIDAS.map(comida => {
            const valor = (datos[comida.clave] as string) || ''
            const fuera = !!datos[comida.claveFuera]

            return (
              <ComidaCard
                key={comida.clave}
                comida={comida}
                valor={valor}
                fuera={fuera}
                analizando={analizando}
                onActualizarTexto={texto => actualizarCampo(comida.clave, texto)}
                onToggleFuera={() => actualizarCampo(comida.claveFuera, !fuera)}
                onTomarFoto={() => {
                  tomarFotoOSeleccionar(textoDescrito => {
                    const textoActual = (datos[comida.clave] as string) || ''
                    const nuevo = textoActual ? `${textoActual}\n${textoDescrito}` : textoDescrito
                    actualizarCampo(comida.clave, nuevo)
                  })
                }}
              />
            )
          })}

          <AguaCard
            valor={(datos.agua as string) || ''}
            onCambiar={val => actualizarCampo('agua', val)}
          />

          <PesoCard
            peso={(datos.peso as string) || ''}
            ejercicio={(datos.ejercicio as string) || ''}
            onCambiarPeso={val => actualizarCampo('peso', val)}
            onCambiarEjercicio={val => actualizarCampo('ejercicio', val)}
          />

          <TouchableOpacity
            style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
            onPress={guardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    elevation: 2,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})
