import { Linking } from 'react-native'
import { APP_VERSION, GITHUB_LATEST_RELEASE_URL } from '../config/constants'

export interface InfoActualizacion {
  versionNueva: string
  urlDescarga: string
  notas: string
}

/**
 * Compara dos versiones semánticas (ej: '1.0.1' y '1.0.0').
 * Devuelve 1 si v1 > v2, -1 si v1 < v2, y 0 si son iguales.
 */
export function compararVersiones(v1: string, v2: string): number {
  const limpiar = (v: string) => v.replace(/^v/, '').trim()
  const p1 = limpiar(v1).split('.').map(Number)
  const p2 = limpiar(v2).split('.').map(Number)

  const longitud = Math.max(p1.length, p2.length)
  for (let i = 0; i < longitud; i++) {
    const num1 = p1[i] || 0
    const num2 = p2[i] || 0
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}

/**
 * Consulta la última release pública en GitHub y verifica si es superior a la actual.
 */
export async function comprobarActualizacion(): Promise<InfoActualizacion | null> {
  try {
    const res = await fetch(GITHUB_LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!res.ok) return null

    const data = await res.json()
    const versionRemota = data.tag_name || ''
    if (!versionRemota) return null

    if (compararVersiones(versionRemota, APP_VERSION) <= 0) {
      return null
    }

    // Buscar el archivo APK entre los assets de la release
    const assetApk = data.assets?.find((a: { name?: string; browser_download_url?: string }) =>
      a.name?.endsWith('.apk'),
    )

    if (!assetApk || !assetApk.browser_download_url) {
      return null
    }

    return {
      versionNueva: versionRemota,
      urlDescarga: assetApk.browser_download_url,
      notas: data.body || '',
    }
  } catch (err) {
    console.warn('No se pudo comprobar actualizaciones:', err)
    return null
  }
}

/**
 * Abre la descarga del APK directamente en el navegador del dispositivo para su instalación.
 */
export async function abrirDescargaApk(url: string): Promise<void> {
  const soportado = await Linking.canOpenURL(url)
  if (soportado) {
    await Linking.openURL(url)
  }
}
