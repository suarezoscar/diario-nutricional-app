import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'
import { MAX_CARACTERES_COMIDA } from '../../config/constants'
import type { DefinicionComida } from '../../config/comidas'

interface ComidaCardProps {
  comida: DefinicionComida
  valor: string
  valorAnterior?: string
  fuera: boolean
  analizando: boolean
  esActual?: boolean
  debeEnfocar?: boolean
  onActualizarTexto: (texto: string) => void
  onToggleFuera: () => void
  onTomarFoto: () => void
}

/**
 * Skeleton animado que sustituye al TextInput mientras la IA
 * analiza la foto del plato seleccionado.
 */
const InputSkeletonIa: React.FC = () => {
  const { colors } = useTheme()
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [pulseAnim])

  return (
    <Animated.View
      style={[
        styles.skeletonContainer,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.primaryLight,
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={styles.skeletonHeader}>
        <FontAwesome name="magic" size={13} color={colors.primary} />
        <Text style={[styles.skeletonTitle, { color: colors.primary }]}>
          Identificando plato con IA...
        </Text>
      </View>
      <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '85%' }]} />
      <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '55%' }]} />
    </Animated.View>
  )
}

export const ComidaCard: React.FC<ComidaCardProps> = ({
  comida,
  valor,
  valorAnterior,
  fuera,
  analizando,
  esActual,
  debeEnfocar,
  onActualizarTexto,
  onToggleFuera,
  onTomarFoto,
}) => {
  const { colors } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  // Auto-enfoque inmediato y despliegue del teclado cuando se solicita (por ejemplo, desde el Widget)
  useEffect(() => {
    if (debeEnfocar && !analizando) {
      const timer1 = setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
      const timer2 = setTimeout(() => {
        inputRef.current?.focus()
      }, 400)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [debeEnfocar, analizando])

  return (
    <Card
      style={
        esActual
          ? [
              styles.cardActual,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryUltraSoft,
              },
            ]
          : undefined
      }
    >
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
              onPress={() => onActualizarTexto(valorAnterior)}
              activeOpacity={0.7}
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

      {analizando ? (
        <InputSkeletonIa />
      ) : (
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
            isFocused && {
              borderColor: colors.borderFocus,
              backgroundColor: colors.focusSoft,
            },
          ]}
          multiline
          placeholder={comida.placeholder}
          placeholderTextColor={colors.textMuted}
          value={valor}
          onChangeText={onActualizarTexto}
          maxLength={MAX_CARACTERES_COMIDA}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}

      <View style={styles.footer}>
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {valor.length}/{MAX_CARACTERES_COMIDA}
        </Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  ayerIcon: {
    marginRight: 4,
  },
  ayerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fueraBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  fueraBtnText: {
    fontSize: 12,
  },
  camBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  skeletonContainer: {
    minHeight: 64,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  skeletonTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonLine: {
    height: 10,
    borderRadius: 4,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  countText: {
    fontSize: 11,
  },
  cardActual: {
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  actualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    marginLeft: theme.spacing.xs,
  },
  actualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
})
