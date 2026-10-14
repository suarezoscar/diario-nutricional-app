import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { formatearDiaMes, generarListaDias } from '../utils/fechas'
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

export function construirHtmlReporte(
  nombre: string,
  desde: string,
  hasta: string,
  dias: string[],
  registrosPorDia: Record<string, Registro>,
): string {
  const filasHtml = dias
    .map(fecha => {
      const reg = registrosPorDia[fecha] || {}
      const etiquetaDia = formatearDiaMes(fecha)

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
          <td class="col-dia"><strong>${etiquetaDia}</strong></td>
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
          text-transform: capitalize;
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
        <div class="meta">Período: <strong>${desde}</strong> al <strong>${hasta}</strong></div>
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
