import { COMIDAS } from '../config/comidas'
import type { ClaveComida, Registro } from '../types'

/**
 * Comprueba si una comida específica ha sido anotada en el registro
 * (cuenta como anotada si tiene texto o si fue marcada como 'fuera').
 */
export function estaComidaAnotada(
  clave: ClaveComida,
  claveFuera: `${ClaveComida}Fuera`,
  datos?: Partial<Registro> | null,
): boolean {
  if (!datos) return false
  const fuera = !!datos[claveFuera]
  if (fuera) return true
  const texto = datos[clave]
  return typeof texto === 'string' && texto.trim().length > 0
}

/**
 * Determina qué comidas están pendientes de anotar en el día de hoy.
 *
 * Criterio:
 * - Antes de las 06:00 AM, el día nutricional de hoy aún no ha comenzado (devuelve []).
 * - A partir de las 06:00 AM, se evalúan en orden cronológico todas las comidas
 *   desde el desayuno hasta la comida actual en curso (inclusive).
 *   Cualquier comida que no tenga anotación ni esté marcada como 'fuera' se añade a la lista.
 *
 * @param comidaActual - Clave de la comida actualmente en curso (ej: 'merienda').
 * @param datosHoy - Datos del registro de hoy (de Firestore o caché local).
 * @param horaActual - Hora del reloj (0-23), por defecto la hora del sistema.
 * @returns Lista con los nombres legibles de las comidas pendientes (ej: ['Desayuno', 'Comida']).
 */
export function obtenerComidasPendientes(
  comidaActual: ClaveComida,
  datosHoy?: Partial<Registro> | null,
  horaActual?: number,
): string[] {
  const hora = horaActual !== undefined ? horaActual : new Date().getHours()

  // Antes de las 06:00 AM ninguna comida del día de hoy está pendiente todavía
  if (hora < 6) {
    return []
  }

  const indiceActual = COMIDAS.findIndex(c => c.clave === comidaActual)
  if (indiceActual === -1) return []

  const comidasAEvaluar = COMIDAS.slice(0, indiceActual + 1)
  const pendientes: string[] = []

  for (const comida of comidasAEvaluar) {
    if (!estaComidaAnotada(comida.clave, comida.claveFuera, datosHoy)) {
      pendientes.push(comida.titulo)
    }
  }

  return pendientes
}

/**
 * Formatea una lista de nombres de comidas en lenguaje natural en español:
 * - 0 elementos: ''
 * - 1 elemento: 'Desayuno'
 * - 2 elementos: 'Desayuno y Media mañana'
 * - 3+ elementos: 'Desayuno, Media mañana, Comida y Merienda'
 */
export function formatearListaPendientes(titulos: string[]): string {
  if (!titulos || titulos.length === 0) return ''
  if (titulos.length === 1) return titulos[0]
  if (titulos.length === 2) return `${titulos[0]} y ${titulos[1]}`
  const ultimos = titulos[titulos.length - 1]
  const anteriores = titulos.slice(0, -1).join(', ')
  return `${anteriores} y ${ultimos}`
}
