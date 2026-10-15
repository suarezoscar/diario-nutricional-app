import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import type { DefinicionComida } from '../../../config/comidas'
import { styles } from '../ComidaCard.styles'

const HIT_SLOP_8 = Object.freeze({ top: 8, bottom: 8, left: 8, right: 8 })

export interface ComidaHeaderProps {
  comida: DefinicionComida
  esActual?: boolean
  valorAnterior?: string
  fuera: boolean
  analizando: boolean
  onCopiarAyer: () => void
  onToggleFuera: () => void
  onTomarFoto: () => void
}

/**
 * Cabecera superior de la tarjeta de comida.
 * Renderiza el título, icono, etiqueta de estado actual y botones de acción rápida.
 *
 * @param props - Propiedades que controlan el estado visual y las acciones del encabezado.
 * @returns Encabezado interactivo con botones ergonómicos.
 */
export const ComidaHeader: React.FC<ComidaHeaderProps> = React.memo(({
  comida,
  esActual,
  valorAnterior,
  fuera,
  analizando,
  onCopiarAyer,
  onToggleFuera,
  onTomarFoto,
}) => {
  const { colors } = useTheme()

  return (
    <View style={styles.header}>
      <View style={styles.titleWrap}>
        <FontAwesome
          name={comida.icono as keyof typeof FontAwesome.glyphMap}
          size={16}
          color={colors.primary}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: colors.text }]}>{comida.titulo}</Text>
        {esActual && (
          <View style={[styles.actualBadge, { backgroundColor: colors.primarySoft }]}>
            <FontAwesome name="clock-o" size={10} color={colors.primary} />
            <Text style={[styles.actualBadgeText, { color: colors.primary }]}>En curso</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {!!valorAnterior && valorAnterior.trim().length > 0 && (
          <TouchableOpacity
            style={[
              styles.ayerBtn,
              { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
            ]}
            onPress={onCopiarAyer}
            activeOpacity={0.7}
            hitSlop={HIT_SLOP_8}
            accessibilityLabel="Copiar comida del día anterior"
          >
            <FontAwesome name="history" size={11} color={colors.primary} style={styles.ayerIcon} />
            <Text style={[styles.ayerBtnText, { color: colors.primary }]}>Ayer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.fueraBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
            fuera && { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
          ]}
          onPress={onToggleFuera}
          activeOpacity={0.7}
          hitSlop={HIT_SLOP_8}
          accessibilityLabel={fuera ? 'Marcar comida como hecha en casa' : 'Marcar comida como fuera de casa'}
        >
          <Text
            style={[
              styles.fueraBtnText,
              { color: colors.textMuted },
              fuera && { color: colors.primary, fontWeight: '700' },
            ]}
          >
            {fuera ? '✓ Fuera' : 'Fuera'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.camBtn}
          onPress={onTomarFoto}
          disabled={analizando}
          hitSlop={HIT_SLOP_8}
          activeOpacity={0.7}
          accessibilityLabel="Fotografiar plato para IA"
        >
          <FontAwesome
            name="camera"
            size={16}
            color={analizando ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
})
