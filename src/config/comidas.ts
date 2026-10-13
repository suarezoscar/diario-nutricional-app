import type { ClaveComida } from '../types'

export interface DefinicionComida {
  clave: ClaveComida
  claveFuera: `${ClaveComida}Fuera`
  titulo: string
  placeholder: string
  icono: string
}

export const COMIDAS: DefinicionComida[] = [
  {
    clave: 'desayuno',
    claveFuera: 'desayunoFuera',
    titulo: 'Desayuno',
    placeholder: 'Ej: Café con leche y tostada de tomate',
    icono: 'coffee',
  },
  {
    clave: 'mediaManana',
    claveFuera: 'mediaMananaFuera',
    titulo: 'Media mañana',
    placeholder: 'Ej: Fruta de temporada o frutos secos',
    icono: 'sun-o',
  },
  {
    clave: 'comida',
    claveFuera: 'comidaFuera',
    titulo: 'Comida',
    placeholder: 'Ej: Ensalada mixta y pollo a la plancha',
    icono: 'cutlery',
  },
  {
    clave: 'merienda',
    claveFuera: 'meriendaFuera',
    titulo: 'Merienda',
    placeholder: 'Ej: Yogur natural con nueces',
    icono: 'apple',
  },
  {
    clave: 'cena',
    claveFuera: 'cenaFuera',
    titulo: 'Cena',
    placeholder: 'Ej: Crema de calabacín y tortilla francesa',
    icono: 'moon-o',
  },
]
