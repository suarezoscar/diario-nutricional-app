import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import {
  formatearFechaPdf,
  formatearFechaEspanolaCompleta,
  generarListaDias,
} from '../utils/fechas'
import { cargarRango } from './registroService'
import type { Registro } from '../types'

interface ParametrosExportacion {
  userId: string
  nombre: string
  desde: string
  hasta: string
}

function formatearCeldaComida(texto?: string, fuera?: boolean): string {
  if (!texto || !texto.trim()) return '-'
  const limpio = texto.trim().replace(/\n/g, '<br/>')
  if (fuera) {
    return `<span style="color:#d32f2f;font-weight:bold;">[FUERA]</span> ${limpio}`
  }
  return limpio
}

/**
 * Construye el documento HTML5 completo para el reporte en formato A4 apaisado (landscape).
 *
 * @remarks
 * Características del reporte:
 * - Omite completamente el campo de peso conforme a las pautas de privacidad y foco del usuario.
 * - Incluye columna exclusiva de Ejercicio.
 * - Resalta visualmente las comidas realizadas fuera de casa con la etiqueta `[FUERA]`.
 * - Formatea las fechas del período y cabeceras en español estándar.
 *
 * @param nombre - Nombre legible del usuario para el título.
 * @param desde - Fecha de inicio del reporte (`YYYY-MM-DD`).
 * @param hasta - Fecha de fin del reporte (`YYYY-MM-DD`).
 * @param dias - Array con la lista de fechas consecutivas a incluir.
 * @param registrosPorDia - Diccionario con los registros nutricionales por fecha.
 * @returns Cadena con el código HTML5 completo listo para imprimir en PDF.
 */
export function construirHtmlReporte(
  nombre: string,
  desde: string,
  hasta: string,
  dias: string[],
  registrosPorDia: Record<string, Partial<Registro>>,
): string {
  const filasHtml = dias
    .map(fecha => {
      const reg = registrosPorDia[fecha] || {}
      const infoDia = formatearFechaPdf(fecha)

      const desayuno = formatearCeldaComida(reg.desayuno, reg.desayunoFuera)
      const mediaManana = formatearCeldaComida(reg.mediaManana, reg.mediaMananaFuera)
      const comida = formatearCeldaComida(reg.comida, reg.comidaFuera)
      const merienda = formatearCeldaComida(reg.merienda, reg.meriendaFuera)
      const cena = formatearCeldaComida(reg.cena, reg.cenaFuera)

      const agua = reg.agua ? `${reg.agua} L` : '-'
      const ejercicio =
        reg.ejercicio && reg.ejercicio.trim()
          ? reg.ejercicio.trim().replace(/\n/g, '<br/>')
          : '-'

      return `
        <tr>
          <td class="col-dia">
            <span class="dia-nombre">${infoDia.diaSemana}</span><br/>
            <span class="dia-fecha">${infoDia.fechaNumero}</span>
          </td>
          <td>${desayuno}</td>
          <td>${mediaManana}</td>
          <td>${comida}</td>
          <td>${merienda}</td>
          <td>${cena}</td>
          <td class="col-centro">${agua}</td>
          <td>${ejercicio}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: A4 landscape;
          margin: 8mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #212121;
          margin: 0;
          padding: 0;
          font-size: 9pt;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          border-bottom: 2px solid #2e7d32;
          padding-bottom: 4px;
        }
        .header h1 {
          font-size: 14pt;
          color: #2e7d32;
          margin: 0;
        }
        .header .meta {
          font-size: 8.5pt;
          color: #555555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #dcdcdc;
          padding: 4px 6px;
          vertical-align: top;
          word-wrap: break-word;
          font-size: 8pt;
        }
        th {
          background-color: #2e7d32;
          color: #ffffff;
          font-weight: 600;
          text-align: left;
          font-size: 8.5pt;
        }
        tr:nth-child(even) {
          background-color: #f7faf7;
        }
        .col-dia {
          width: 9%;
        }
        .dia-nombre {
          font-weight: 700;
          color: #1b5e20;
          font-size: 8pt;
        }
        .dia-fecha {
          font-size: 7.5pt;
          color: #555555;
        }
        .col-centro {
          text-align: center;
          width: 6%;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🥗 Diario Nutricional — ${nombre}</h1>
        <div class="meta">Período: <strong>${formatearFechaEspanolaCompleta(desde)}</strong> al <strong>${formatearFechaEspanolaCompleta(hasta)}</strong></div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="col-dia">Día</th>
            <th>Desayuno</th>
            <th>Media mañana</th>
            <th>Comida</th>
            <th>Merienda</th>
            <th>Cena</th>
            <th class="col-centro">Agua</th>
            <th>Ejercicio</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>
    </body>
    </html>
  `
}

/**
 * Genera el documento PDF a partir de los datos en Firestore para el rango solicitado
 * y abre el diálogo nativo de compartir (`expo-sharing`) en el dispositivo móvil.
 *
 * @param parametros - Objeto con `userId`, `nombre`, `desde` y `hasta`.
 * @returns Promesa que resuelve una vez abierto el diálogo nativo de compartir.
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
