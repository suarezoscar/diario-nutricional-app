import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { theme } from '../../../utils/theme'
import type { EstadoGuardado } from '../../../hooks/useDiario'
import { styles } from '../DiarioView.styles'

export interface BotonGuardarDiarioProps {
  guardando: boolean
  estadoGuardado: EstadoGuardado
  onGuardar: () => void
}

/**
 * Botón interactivo para guardar cambios explícitos en el diario nutricional.
 * Muestra retroalimentación visual según el estado (guardando, guardado o inactivo).
 *
 * @param props - Propiedades con estado de persistencia y manejador de guardado.
 * @returns Elemento táctil con iconos dinámicos y aviso de autoguardado.
 */
export const BotonGuardarDiario: React.FC<BotonGuardarDiarioProps> = React.memo(({
  guardando,
  estadoGuardado,
  onGuardar,
}) => {
  const { colors } = useTheme()

  return (
    <>
      <TouchableOpacity
        style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
        onPress={onGuardar}
        disabled={guardando}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Guardar cambios del diario"
      >
        {guardando ? (
          <View style={styles.saveBtnContent}>
            <ActivityIndicator color={theme.colors.white} size="small" />
            <Text style={styles.saveBtnText}>Guardando cambios...</Text>
          </View>
        ) : estadoGuardado === 'guardado' ? (
          <View style={styles.saveBtnContent}>
            <FontAwesome name="check-circle" size={16} color={theme.colors.white} />
            <Text style={styles.saveBtnText}>Cambios guardados</Text>
          </View>
        ) : (
          <View style={styles.saveBtnContent}>
            <FontAwesome name="floppy-o" size={16} color={theme.colors.white} />
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.autoSaveNotice, { color: colors.textMuted }]}>
        Tus datos se guardan automáticamente al escribir o cambiar de día.
      </Text>
    </>
  )
})
