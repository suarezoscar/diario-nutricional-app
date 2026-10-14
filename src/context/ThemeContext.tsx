import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import { paletteLight, paletteDark, theme, type ThemeColors } from '../utils/theme'
import { cargarConfiguracion, guardarConfiguracion, type ModoTema } from '../services/configService'

interface ThemeContextValue {
  modoTema: ModoTema
  esOscuro: boolean
  colors: ThemeColors
  cambiarModoTema: (nuevoModo: ModoTema) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  modoTema: 'sistema',
  esOscuro: false,
  colors: paletteLight,
  cambiarModoTema: async () => {},
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const schemeSistema = useColorScheme()
  const [modoTema, setModoTema] = useState<ModoTema>('sistema')
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    async function inicializar() {
      const config = await cargarConfiguracion()
      setModoTema(config.tema)
      setCargado(true)
    }
    void inicializar()
  }, [])

  const esOscuro = useMemo(() => {
    if (modoTema === 'oscuro') return true
    if (modoTema === 'claro') return false
    return schemeSistema === 'dark'
  }, [modoTema, schemeSistema])

  const colors = useMemo(() => {
    return esOscuro ? paletteDark : paletteLight
  }, [esOscuro])

  // Sincronizar el objeto global theme.colors para compatibilidad con estilos estáticos
  useEffect(() => {
    Object.assign(theme.colors, colors)
  }, [colors])

  const cambiarModoTema = useCallback(
    async (nuevoModo: ModoTema) => {
      setModoTema(nuevoModo)
      const config = await cargarConfiguracion()
      await guardarConfiguracion({
        ...config,
        tema: nuevoModo,
      })
    },
    [],
  )

  const value = useMemo(
    () => ({
      modoTema,
      esOscuro,
      colors,
      cambiarModoTema,
    }),
    [modoTema, esOscuro, colors, cambiarModoTema],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook personalizado para acceder al tema activo y cambiar la preferencia de modo oscuro.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
