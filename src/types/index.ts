export type ClaveComida = 'desayuno' | 'mediaManana' | 'comida' | 'merienda' | 'cena'

export interface Registro {
  userId: string
  fecha: string // formato YYYY-MM-DD
  desayuno?: string
  mediaManana?: string
  comida?: string
  merienda?: string
  cena?: string
  agua?: string
  peso?: string
  ejercicio?: string
  desayunoFuera?: boolean
  mediaMananaFuera?: boolean
  comidaFuera?: boolean
  meriendaFuera?: boolean
  cenaFuera?: boolean
  [key: string]: unknown
}

export interface UsuarioAutenticado {
  uid: string
  email: string | null
  displayName: string | null
}

export interface PuntoPeso {
  fecha: string
  peso: number
}

export type PesosPorFecha = Record<string, number>

export type TabPrincipal = 'diario' | 'historico' | 'peso'
