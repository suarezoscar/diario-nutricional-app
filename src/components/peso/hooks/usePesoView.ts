import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { usePesoHistorial } from '../../../hooks/usePesoHistorial'
import { hoy, formatearFechaLarga } from '../../../utils/fechas'

export interface UsePesoViewParams {
  userId: string
}

/**
 * Hook de lógica de negocio para la vista de peso.
 * Administra el estado del formulario de peso, validaciones numéricas,
 * eliminación confirmada y sincronización con el selector de fecha.
 *
 * @param params - Identificador del usuario autenticado.
 * @returns Estado consolidado y manejadores para la pantalla de peso.
 */
export function usePesoView({ userId }: UsePesoViewParams) {
  const historial = usePesoHistorial(userId)
  const [nuevoPeso, setNuevoPeso] = useState('')
  const [fechaPeso, setFechaPeso] = useState(hoy())
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleGuardar = useCallback(async () => {
    const val = parseFloat(nuevoPeso.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      Alert.alert('Valor inválido', 'Introduce un peso numérico válido en kg.')
      return
    }
    await historial.guardar(fechaPeso, val)
    setNuevoPeso('')
  }, [nuevoPeso, fechaPeso, historial])

  const confirmarBorrado = useCallback((fecha: string, valor: number) => {
    Alert.alert(
      'Eliminar registro',
      `¿Deseas eliminar el registro de ${valor} kg del ${formatearFechaLarga(fecha)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => historial.borrar(fecha) },
      ],
    )
  }, [historial])

  const handleSeleccionarFecha = useCallback((f: string) => {
    setFechaPeso(f)
    setShowCalendarModal(false)
  }, [])

  const handleIrAHoy = useCallback(() => setFechaPeso(hoy()), [])
  const handleAbrirCalendario = useCallback(() => setShowCalendarModal(true), [])
  const handleCerrarCalendario = useCallback(() => setShowCalendarModal(false), [])

  return {
    ...historial,
    nuevoPeso,
    fechaPeso,
    showCalendarModal,
    isFocused,
    setNuevoPeso,
    setIsFocused,
    handleGuardar,
    confirmarBorrado,
    handleSeleccionarFecha,
    handleIrAHoy,
    handleAbrirCalendario,
    handleCerrarCalendario,
  }
}
