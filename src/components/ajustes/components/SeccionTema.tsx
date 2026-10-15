import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../../common/Card'
import { useTheme } from '../../../context/ThemeContext'
import type { ModoTema } from '../../../services/configService'
import { styles } from '../AjustesView.styles'

const OPCIONES_TEMA: { id: ModoTema; label: string; icon: keyof typeof FontAwesome.glyphMap }[] = [
  { id: 'sistema', label: 'Sistema', icon: 'adjust' },
  { id: 'claro', label: 'Claro', icon: 'sun-o' },
  { id: 'oscuro', label: 'Oscuro', icon: 'moon-o' },
]

/**
 * Sección de configuración del tema visual (claro, oscuro o según el sistema).
 */
export const SeccionTema: React.FC = React.memo(() => {
  const { modoTema, cambiarModoTema, esOscuro, colors } = useTheme()

  return (
    <Card>
      <View style={styles.cardHeader}>
        <FontAwesome name="paint-brush" size={16} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Apariencia</Text>
      </View>

      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
        Elige si prefieres tema claro, oscuro o sincronizarte automáticamente con el sistema de tu teléfono.
      </Text>

      <View style={styles.temaSelector}>
        {OPCIONES_TEMA.map(op => {
          const activo = modoTema === op.id
          return (
            <TouchableOpacity
              key={op.id}
              style={[
                styles.temaBtn,
                { borderColor: colors.border, backgroundColor: colors.background },
                activo && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
              ]}
              onPress={() => void cambiarModoTema(op.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Modo ${op.label}`}
              accessibilityState={{ selected: activo }}
            >
              <FontAwesome
                name={op.icon}
                size={16}
                color={activo ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.temaBtnText,
                  { color: colors.textMuted },
                  activo && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {op.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <Text style={[styles.temaNota, { color: colors.textMuted }]}>
        {modoTema === 'sistema'
          ? `Actualmente en modo ${esOscuro ? 'oscuro' : 'claro'} (según tu dispositivo).`
          : `Modo ${modoTema} seleccionado permanentemente.`}
      </Text>
    </Card>
  )
})
