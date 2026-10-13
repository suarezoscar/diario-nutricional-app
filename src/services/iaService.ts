import { API_DESCRIPCION_URL } from '../config/constants'

export interface RespuestaDescripcion {
  descripcion: string
}

export async function describirPlatoConBase64(
  base64: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const respuesta = await fetch(API_DESCRIPCION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64,
      mimeType,
    }),
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || `Error al procesar la imagen (${respuesta.status})`)
  }

  const data: RespuestaDescripcion = await respuesta.json()
  return data.descripcion.trim()
}
