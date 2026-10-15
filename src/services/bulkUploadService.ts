import { cargarDia, guardarDia } from './registroService'
import type { ClaveComida, Registro } from '../types'

/**
 * Representa una fotografía individual dentro del lote con su estado de análisis por IA.
 */
export interface ItemFotoLote {
  /** Identificador único temporal del elemento */
  id: string
  /** URI local de la imagen en el dispositivo */
  uri: string
  /** Contenido de la imagen en base64 para envío a la API de IA */
  base64?: string
  /** Tipo de comida asignado automáticamente por hora */
  comidaClave: ClaveComida
  /** Fecha en formato YYYY-MM-DD */
  fecha: string
  /** Hora legible de la toma de la foto */
  horaFormateada?: string
  /** Descripción del plato devuelta por la IA o editada por el usuario */
  descripcion: string
  /** Estado del procesamiento de la imagen */
  estado: 'pendiente' | 'analizando' | 'listo' | 'error'
  /** Mensaje de error en caso de fallo */
  error?: string
}

/**
 * Agrupa los elementos procesados de un lote por fecha y actualiza los registros diarios.
 *
 * @param userId - Identificador único del usuario.
 * @param items - Lista de elementos del lote analizados con descripciones no vacías.
 * @returns Número total de elementos consolidados y guardados exitosamente.
 */
export async function persistirLoteEnDias(
  userId: string,
  items: ItemFotoLote[],
): Promise<number> {
  const listos = items.filter(it => it.descripcion.trim().length > 0)
  if (listos.length === 0) return 0

  const diasAgrupados: Record<string, Partial<Registro>> = {}

  for (const item of listos) {
    if (!diasAgrupados[item.fecha]) {
      const diaActual = await cargarDia(userId, item.fecha)
      diasAgrupados[item.fecha] = { ...diaActual }
    }

    const actual = (diasAgrupados[item.fecha][item.comidaClave] as string) || ''
    const nuevoTexto = actual ? `${actual}\n${item.descripcion}` : item.descripcion
    diasAgrupados[item.fecha][item.comidaClave] = nuevoTexto
  }

  for (const [f, datosActualizados] of Object.entries(diasAgrupados)) {
    await guardarDia(userId, f, datosActualizados)
  }

  return listos.length
}
