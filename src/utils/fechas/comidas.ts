import type { HorariosConfig } from '../../services/configService'
import type { ClaveComida } from '../../types'

export function horaTextoAMinutos(horaTexto: string): number {
  const partes = horaTexto.split(':').map(Number)
  return (partes[0] || 0) * 60 + (partes[1] || 0)
}

function estaEnRangoHorario(minutos: number, inicioStr: string, finStr: string): boolean {
  const inicio = horaTextoAMinutos(inicioStr)
  const fin = horaTextoAMinutos(finStr)
  if (inicio < fin) {
    return minutos >= inicio && minutos < fin
  }
  // Rango que cruza la medianoche (ej: 20:00 a 06:00)
  return minutos >= inicio || minutos < fin
}

/**
 * Determina y clasifica la casilla de comida según la hora y minuto del día.
 *
 * @param hora - Hora del día (0 a 23).
 * @param minuto - Minuto de la hora (0 a 59). Por defecto 0.
 * @param horarios - Configuración opcional personalizada de horarios.
 * @returns La clave de comida asignada.
 */
export function asignarComidaPorHora(
  hora: number,
  minuto: number = 0,
  horarios?: HorariosConfig,
): ClaveComida {
  const tiempoMinutos = hora * 60 + minuto

  if (horarios) {
    if (estaEnRangoHorario(tiempoMinutos, horarios.desayuno.inicio, horarios.desayuno.fin)) {
      return 'desayuno'
    }
    if (estaEnRangoHorario(tiempoMinutos, horarios.mediaManana.inicio, horarios.mediaManana.fin)) {
      return 'mediaManana'
    }
    if (estaEnRangoHorario(tiempoMinutos, horarios.comida.inicio, horarios.comida.fin)) {
      return 'comida'
    }
    if (estaEnRangoHorario(tiempoMinutos, horarios.merienda.inicio, horarios.merienda.fin)) {
      return 'merienda'
    }
    return 'cena'
  }

  // Rangos por defecto estándar
  if (tiempoMinutos >= 6 * 60 && tiempoMinutos < 11 * 60) {
    return 'desayuno'
  }
  if (tiempoMinutos >= 11 * 60 && tiempoMinutos < 13 * 60 + 30) {
    return 'mediaManana'
  }
  if (tiempoMinutos >= 13 * 60 + 30 && tiempoMinutos < 17 * 60) {
    return 'comida'
  }
  if (tiempoMinutos >= 17 * 60 && tiempoMinutos < 20 * 60) {
    return 'merienda'
  }
  return 'cena'
}

/**
 * Determina cuál es la comida en curso en el momento actual según la hora del reloj.
 *
 * @param horarios - Configuración opcional de franjas horarias personalizadas.
 * @returns Clave de la comida actual.
 */
export function obtenerComidaActual(horarios?: HorariosConfig): ClaveComida {
  const ahora = new Date()
  return asignarComidaPorHora(ahora.getHours(), ahora.getMinutes(), horarios)
}
