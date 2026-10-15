/**
 * Ajusta una cadena de hora "HH:mm" sumando o restando minutos (en pasos de 15 o 30 min).
 *
 * @param horaStr - Hora en formato "HH:mm".
 * @param deltaMinutos - Minutos a sumar o restar.
 * @returns Cadena con la nueva hora formateada "HH:mm".
 */
export function ajustarHora(horaStr: string, deltaMinutos: number): string {
  const [h, m] = horaStr.split(':').map(Number)
  let total = ((h || 0) * 60 + (m || 0) + deltaMinutos) % (24 * 60)
  if (total < 0) total += 24 * 60
  const nuevoH = Math.floor(total / 60)
  const nuevoM = total % 60
  return `${nuevoH.toString().padStart(2, '0')}:${nuevoM.toString().padStart(2, '0')}`
}
