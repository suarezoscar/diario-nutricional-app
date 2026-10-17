import { COMIDAS } from '../../../config/comidas'
import type { HorariosConfig } from '../../../services/configService'
import type { ClaveComida } from '../../../types'

export interface ResultadoValidacionHorario {
  esValido: boolean
  error?: string
}

/**
 * Convierte una cadena de hora "HH:mm" a minutos en el marco de la jornada (de 04:00 a 04:00 del día siguiente).
 *
 * @param horaStr - Hora en formato "HH:mm".
 * @param esFinCena - Indica si la hora representa el fin de la cena.
 * @returns Minutos normalizados (0 a 1440).
 */
export function horaAJornadaMinutos(horaStr: string, esFinCena: boolean = false): number {
  const [h, m] = horaStr.split(':').map(Number)
  const hora = h || 0
  const minuto = m || 0

  if (hora === 4 && minuto === 0 && esFinCena) {
    return 24 * 60
  }

  if (hora >= 4) {
    return (hora - 4) * 60 + minuto
  }

  return (hora + 20) * 60 + minuto
}

/**
 * Valida si un cambio propuesto en los horarios cumple con las restricciones de la jornada:
 * 1. El desayuno no puede empezar antes de las 04:00 AM.
 * 2. La cena no puede finalizar después de las 04:00 AM.
 * 3. Dentro de cada comida, el inicio debe ser anterior al fin.
 * 4. Las comidas consecutivas no deben cruzarse en orden cronológico.
 *
 * @param comida - Clave de la comida modificada.
 * @param campo - Campo a modificar ('inicio' o 'fin').
 * @param nuevaHora - Nueva hora propuesta en formato "HH:mm".
 * @param horariosActuales - Configuración actual de horarios.
 * @returns Objeto con resultado de validez y mensaje explicativo si no es válido.
 */
export function validarCambioHorario(
  comida: ClaveComida,
  campo: 'inicio' | 'fin',
  nuevaHora: string,
  horariosActuales: HorariosConfig,
): ResultadoValidacionHorario {
  const [h, m] = nuevaHora.split(':').map(Number)
  const horaNum = h || 0

  // 1. Desayuno no puede comenzar antes de las 04:00 AM
  if (comida === 'desayuno' && campo === 'inicio' && horaNum < 4) {
    return {
      esValido: false,
      error: 'El desayuno no puede comenzar antes de las 04:00 AM.',
    }
  }

  // 2. Cena no puede finalizar después de las 04:00 AM
  if (comida === 'cena' && campo === 'fin') {
    const esMadrugadaValida = horaNum < 4 || (horaNum === 4 && (m || 0) === 0)
    const esNocheValida = horaNum >= 19
    if (!esMadrugadaValida && !esNocheValida) {
      return {
        esValido: false,
        error: 'La cena no puede finalizar después de las 04:00 AM.',
      }
    }
  }

  // Clonar y aplicar cambio temporal para verificar orden global
  const horariosCandidatos: HorariosConfig = {
    ...horariosActuales,
    [comida]: {
      ...horariosActuales[comida],
      [campo]: nuevaHora,
    },
  }

  // 3. Consistencia interna de la comida (inicio < fin)
  const inicioMin = horaAJornadaMinutos(horariosCandidatos[comida].inicio, false)
  const finMin = horaAJornadaMinutos(horariosCandidatos[comida].fin, comida === 'cena')

  if (inicioMin >= finMin) {
    const titulo = COMIDAS.find(c => c.clave === comida)?.titulo || comida
    return {
      esValido: false,
      error: `La hora de inicio de ${titulo.toLowerCase()} debe ser anterior a su hora de fin.`,
    }
  }

  // 4. Validar que no se crucen comidas consecutivas
  const ordenComidas: ClaveComida[] = ['desayuno', 'mediaManana', 'comida', 'merienda', 'cena']
  const idx = ordenComidas.indexOf(comida)

  if (idx > 0) {
    const anteriorClave = ordenComidas[idx - 1]
    const finAnterior = horaAJornadaMinutos(horariosCandidatos[anteriorClave].fin, false)
    const inicioActual = horaAJornadaMinutos(horariosCandidatos[comida].inicio, false)
    if (inicioActual < finAnterior) {
      const titActual = COMIDAS.find(c => c.clave === comida)?.titulo || comida
      const titAnt = COMIDAS.find(c => c.clave === anteriorClave)?.titulo || anteriorClave
      return {
        esValido: false,
        error: `${titActual} no puede comenzar antes del fin de ${titAnt.toLowerCase()} (${horariosCandidatos[anteriorClave].fin}).`,
      }
    }
  }

  if (idx < ordenComidas.length - 1) {
    const siguienteClave = ordenComidas[idx + 1]
    const finActual = horaAJornadaMinutos(horariosCandidatos[comida].fin, comida === 'cena')
    const inicioSiguiente = horaAJornadaMinutos(horariosCandidatos[siguienteClave].inicio, false)
    if (finActual > inicioSiguiente) {
      const titActual = COMIDAS.find(c => c.clave === comida)?.titulo || comida
      const titSig = COMIDAS.find(c => c.clave === siguienteClave)?.titulo || siguienteClave
      return {
        esValido: false,
        error: `${titActual} no puede terminar después del inicio de ${titSig.toLowerCase()} (${horariosCandidatos[siguienteClave].inicio}).`,
      }
    }
  }

  return { esValido: true }
}
