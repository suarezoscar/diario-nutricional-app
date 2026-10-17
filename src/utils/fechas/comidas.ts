import { desplazarDia, hoy } from './operaciones'
import type { HorariosConfig } from '../../services/configService'
import type { ClaveComida } from '../../types'

/**
 * Convierte una representación textual "HH:mm" a minutos totales transcurridos desde medianoche.
 *
 * @param horaTexto - Cadena de hora en formato "HH:mm".
 * @returns Cantidad de minutos (0 a 1439).
 */
export function horaTextoAMinutos(horaTexto: string): number {
  const partes = horaTexto.split(':').map(Number)
  return (partes[0] || 0) * 60 + (partes[1] || 0)
}

/**
 * Comprueba si un momento del día en minutos se encuentra dentro de un intervalo horario.
 * Soporta de forma nativa intervalos que cruzan la medianoche (ej. 21:00 a 01:00).
 *
 * @param minutos - Minutos transcurridos en el día actual (0 a 1439).
 * @param inicioStr - Hora de inicio en formato "HH:mm".
 * @param finStr - Hora de finalización en formato "HH:mm".
 * @returns `true` si los minutos caen dentro del intervalo; de lo contrario `false`.
 */
export function estaEnRangoHorario(minutos: number, inicioStr: string, finStr: string): boolean {
  const inicio = horaTextoAMinutos(inicioStr)
  const fin = horaTextoAMinutos(finStr)
  if (inicio < fin) {
    return minutos >= inicio && minutos < fin
  }
  // Rango que cruza la medianoche (ej: 21:00 a 01:00)
  return minutos >= inicio || minutos < fin
}

/**
 * Determina y clasifica la casilla de comida según la hora y minuto del día.
 * Si la hora no coincide con ninguna franja (ej. en la noche tras concluir la cena),
 * devuelve 'desayuno' como siguiente comida natural del ciclo nutricional.
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
    if (estaEnRangoHorario(tiempoMinutos, horarios.cena.inicio, horarios.cena.fin)) {
      return 'cena'
    }
    return 'desayuno'
  }

  // Rangos estándar por defecto
  if (tiempoMinutos >= 6 * 60 && tiempoMinutos < 11 * 60) return 'desayuno'
  if (tiempoMinutos >= 11 * 60 && tiempoMinutos < 13 * 60 + 30) return 'mediaManana'
  if (tiempoMinutos >= 13 * 60 + 30 && tiempoMinutos < 17 * 60) return 'comida'
  if (tiempoMinutos >= 17 * 60 && tiempoMinutos < 20 * 60) return 'merienda'
  if (tiempoMinutos >= 20 * 60 && tiempoMinutos < 23 * 60 + 30) return 'cena'
  return 'desayuno'
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

/**
 * Determina la fecha operativa del diario considerando la jornada nocturna.
 * Si el reloj marca la madrugada (antes de las 06:00) y la comida activa sigue siendo la cena,
 * la fecha operativa corresponde al día anterior (ayer).
 *
 * @param horarios - Configuración opcional de horarios de comidas.
 * @returns Cadena con la fecha operativa en formato `YYYY-MM-DD`.
 */
export function obtenerFechaOperativa(horarios?: HorariosConfig): string {
  const ahora = new Date()
  const hora = ahora.getHours()
  const minuto = ahora.getMinutes()

  if (hora < 6 && asignarComidaPorHora(hora, minuto, horarios) === 'cena') {
    return desplazarDia(hoy(), -1)
  }

  return hoy()
}

/**
 * Resuelve la fecha de destino para un registro de comida recibido por enlace o notificación.
 * Si se especifica una fecha explícita, se respeta; en caso contrario, si se trata de la cena
 * y la hora actual es antes del mediodía, se asume que pertenece a la jornada de ayer.
 *
 * @param clave - Clave de la comida.
 * @param fechaParam - Fecha opcional proporcionada en la URL.
 * @param horarios - Configuración opcional de horarios.
 * @returns Cadena con la fecha de destino en formato `YYYY-MM-DD`.
 */
export function calcularFechaParaComida(
  clave?: string,
  fechaParam?: string,
  horarios?: HorariosConfig,
): string {
  if (fechaParam && typeof fechaParam === 'string' && fechaParam.length === 10) {
    return fechaParam
  }
  const horaActual = new Date().getHours()
  if (clave === 'cena' && horaActual < 12) {
    return desplazarDia(hoy(), -1)
  }
  return obtenerFechaOperativa(horarios)
}
