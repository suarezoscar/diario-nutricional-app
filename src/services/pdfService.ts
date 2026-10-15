import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { generarListaDias } from '../utils/fechas'
import { cargarRango } from './registroService'
import { construirHtmlReporte } from './pdf/plantillaReporteHtml'

export { construirHtmlReporte }

interface ParametrosExportacion {
  userId: string
  nombre: string
  desde: string
  hasta: string
}

/**
 * Genera el documento PDF y abre el diálogo nativo de compartir (`expo-sharing`).
 *
 * @param parametros - Objeto con `userId`, `nombre`, `desde` y `hasta`.
 * @returns Promesa que resuelve una vez abierto el diálogo nativo.
 */
export async function exportarPDFPorRango({
  userId,
  nombre,
  desde,
  hasta,
}: ParametrosExportacion): Promise<void> {
  const dias = generarListaDias(desde, hasta)
  const registros = await cargarRango(userId, desde, hasta)
  const html = construirHtmlReporte(nombre, desde, hasta, dias, registros)

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Diario Nutricional (${desde} al ${hasta})`,
      UTI: 'com.adobe.pdf',
    })
  }
}

/**
 * Genera el documento PDF y abre el servicio de impresión nativo del dispositivo.
 *
 * @param parametros - Objeto con `userId`, `nombre`, `desde` y `hasta`.
 * @returns Promesa que resuelve al invocar el diálogo nativo de impresión.
 */
export async function imprimirPDFPorRango({
  userId,
  nombre,
  desde,
  hasta,
}: ParametrosExportacion): Promise<void> {
  const dias = generarListaDias(desde, hasta)
  const registros = await cargarRango(userId, desde, hasta)
  const html = construirHtmlReporte(nombre, desde, hasta, dias, registros)

  await Print.printAsync({
    html,
  })
}
