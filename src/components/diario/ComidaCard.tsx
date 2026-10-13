import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { theme } from '../../utils/theme'
import { MAX_CARACTERES_COMIDA } from '../../config/constants'
import type { DefinicionComida } from '../../config/comidas'

interface ComidaCardProps {
  comida: DefinicionComida
  valor: string
  valorAnterior?: string
  fuera: boolean
  analizando: boolean
  onActualizarTexto: (texto: string) => void
  onToggleFuera: () => void
  onTomarFoto: () => void
}

export const ComidaCard: React.FC<ComidaCardProps> = ({
  comida,
  valor,
  valorAnterior,
  fuera,
  analizando,
  onActualizarTexto,
  onToggleFuera,
  onTomarFoto,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <FontAwesome
            name={comida.icono as keyof typeof FontAwesome.glyphMap}
            size={16}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.title}>{comida.titulo}</Text>
        </View>

        <View style={styles.actions}>
          {!!valorAnterior && valorAnterior.trim().length > 0 && (
            <TouchableOpacity
              style={styles.ayerBtn}
              onPress={() => onActualizarTexto(valorAnterior)}
              activeOpacity={0.7}
              accessibilityLabel="Copiar comida del día anterior"
            >
              <FontAwesome name="history" size={11} color={theme.colors.primary} style={styles.ayerIcon} />
              <Text style={styles.ayerBtnText}>Ayer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.fueraBtn, fuera && styles.fueraBtnActivo]}
            onPress={onToggleFuera}
            activeOpacity={0.7}
          >
            <Text style={[styles.fueraBtnText, fuera && styles.fueraBtnTextActivo]}>
              {fuera ? '✓ Fuera' : 'Fuera'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.camBtn}
            onPress={onTomarFoto}
            disabled={analizando}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            {analizando ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <FontAwesome name="camera" size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        multiline
        placeholder={comida.placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={valor}
        onChangeText={onActualizarTexto}
        maxLength={MAX_CARACTERES_COMIDA}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <View style={styles.footer}>
        <Text style={styles.countText}>
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  ayerIcon: {
    marginRight: 4,
  },
  ayerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fueraBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  fueraBtnActivo: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryLight,
  },
  fueraBtnText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  fueraBtnTextActivo: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  camBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: theme.colors.focusSoft,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  countText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
})
