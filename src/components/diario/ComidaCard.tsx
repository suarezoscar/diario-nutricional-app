import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { Card } from '../common/Card'
import { useTheme } from '../../context/ThemeContext'
import { MAX_CARACTERES_COMIDA } from '../../config/constants'
import type { DefinicionComida } from '../../config/comidas'
import type { Registro } from '../../types'
import { styles } from './ComidaCard.styles'
import { ComidaHeader } from './components/ComidaHeader'
import { InputSkeletonIa } from './components/InputSkeletonIa'
import { useComidaCard } from './hooks/useComidaCard'

export interface ComidaCardProps {
  comida: DefinicionComida
  valor: string
  valorAnterior?: string
  fuera: boolean
  analizando: boolean
  esActual?: boolean
  debeEnfocar?: boolean
  onActualizarCampo?: (campo: keyof Registro, valor: string | boolean) => void
  onTomarFotoComida?: (clave: string) => void
  onActualizarTexto?: (texto: string) => void
  onToggleFuera?: () => void
  onTomarFoto?: () => void
}

/**
 * Componente de tarjeta para registrar y editar una comida diaria (desayuno, almuerzo, etc.).
 * Soporta entrada de texto, transcripción por IA fotográfica y copia rápida del día previo.
 *
 * @param props - Propiedades de visualización y callbacks para gestionar la comida.
 * @returns Tarjeta contenedora de la comida con área de texto y acciones contextuales.
 *
 * @example
 * ```tsx
 * <ComidaCard
 *   comida={comidaDef}
 *   valor={textoPlato}
 *   fuera={false}
 *   analizando={false}
 *   onActualizarCampo={actualizar}
 * />
 * ```
 */
export const ComidaCard: React.FC<ComidaCardProps> = React.memo(({
  comida,
  valor,
  valorAnterior,
  fuera,
  analizando,
  esActual,
  debeEnfocar,
  onActualizarCampo,
  onTomarFotoComida,
  onActualizarTexto,
  onToggleFuera,
  onTomarFoto,
}) => {
  const { colors } = useTheme()
  const {
    isFocused,
    inputRef,
    handleFocus,
    handleBlur,
    handleTexto,
    handleToggle,
    handleCopiarAyer,
    handleFoto,
  } = useComidaCard({
    comida,
    valorAnterior,
    fuera,
    analizando,
    debeEnfocar,
    onActualizarCampo,
    onTomarFotoComida,
    onActualizarTexto,
    onToggleFuera,
    onTomarFoto,
  })

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
      <ComidaHeader
        comida={comida}
        esActual={esActual}
        valorAnterior={valorAnterior}
        fuera={fuera}
        analizando={analizando}
        onCopiarAyer={handleCopiarAyer}
        onToggleFuera={handleToggle}
        onTomarFoto={handleFoto}
      />

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
          onChangeText={handleTexto}
          maxLength={MAX_CARACTERES_COMIDA}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}

      <View style={styles.footer}>
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {valor.length}/{MAX_CARACTERES_COMIDA}
        </Text>
      </View>
    </Card>
  )
})
