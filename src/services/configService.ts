import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ClaveComida } from '../types'

export type ModoTema = 'sistema' | 'claro' | 'oscuro'

export interface HorarioComida {
  inicio: string // Formato "HH:mm" (ej: "06:00")
  fin: string    // Formato "HH:mm" (ej: "11:00")
}

export type HorariosConfig = Record<ClaveComida, HorarioComida>

export interface NotificacionesConfig {
  recordatorioComidas: boolean
  recordatorioAgua: boolean
}

export interface ConfiguracionApp {
  tema: ModoTema
  horarios: HorariosConfig
  notificaciones: NotificacionesConfig
}

export const HORARIOS_POR_DEFECTO: HorariosConfig = {
  desayuno: { inicio: '06:00', fin: '11:00' },
  mediaManana: { inicio: '11:00', fin: '13:30' },
  comida: { inicio: '13:30', fin: '17:00' },
  merienda: { inicio: '17:00', fin: '20:00' },
  cena: { inicio: '20:00', fin: '06:00' },
}

export const CONFIGURACION_POR_DEFECTO: ConfiguracionApp = {
  tema: 'sistema',
  horarios: HORARIOS_POR_DEFECTO,
  notificaciones: {
    recordatorioComidas: false,
    recordatorioAgua: false,
  },
}

const STORAGE_KEY = '@diario_nutricional_config_v1'

/**
 * Carga la configuración local de la aplicación desde AsyncStorage.
 * Si no existe o falla la lectura, devuelve la configuración predeterminada.
 */
export async function cargarConfiguracion(): Promise<ConfiguracionApp> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return CONFIGURACION_POR_DEFECTO

    const parsed = JSON.parse(raw) as Partial<ConfiguracionApp>
    return {
      tema: parsed.tema || CONFIGURACION_POR_DEFECTO.tema,
      horarios: {
        ...CONFIGURACION_POR_DEFECTO.horarios,
        ...(parsed.horarios || {}),
      },
      notificaciones: {
        ...CONFIGURACION_POR_DEFECTO.notificaciones,
        ...(parsed.notificaciones || {}),
      },
    }
  } catch (err) {
    console.error('Error al cargar configuración local:', err)
    return CONFIGURACION_POR_DEFECTO
  }
}

/**
 * Persiste la configuración de la app en AsyncStorage de forma local.
 */
export async function guardarConfiguracion(config: ConfiguracionApp): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Error al guardar configuración local:', err)
  }
}
