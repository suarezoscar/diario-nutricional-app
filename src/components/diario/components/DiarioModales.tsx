import React from 'react'
import { CalendarModal } from '../../common/CalendarModal'
import { ExportarPdfModal } from '../ExportarPdfModal'
import { BulkUploadModal } from '../BulkUploadModal'
import type { UsuarioAutenticado } from '../../../types'

export interface DiarioModalesProps {
  visibleCalendar: boolean
  fecha: string
  onSeleccionarFecha: (f: string) => void
  onCerrarCalendario: () => void
  visiblePdf: boolean
  usuario: UsuarioAutenticado
  onCerrarPdf: () => void
  visibleBulk: boolean
  onCerrarBulk: () => void
  onRecargarDia: () => void
}

/**
 * Contenedor de modales contextuales para el diario (calendario, exportación PDF y subida masiva).
 *
 * @param props - Estados de visibilidad y callbacks para los modales del diario.
 * @returns Fragmento con los tres modales superpuestos.
 */
export const DiarioModales: React.FC<DiarioModalesProps> = React.memo(({
  visibleCalendar,
  fecha,
  onSeleccionarFecha,
  onCerrarCalendario,
  visiblePdf,
  usuario,
  onCerrarPdf,
  visibleBulk,
  onCerrarBulk,
  onRecargarDia,
}) => {
  return (
    <>
      <CalendarModal
        visible={visibleCalendar}
        modo="single"
        fechaSeleccionada={fecha}
        titulo="Ir a un día"
        onSeleccionarFecha={onSeleccionarFecha}
        onClose={onCerrarCalendario}
      />

      <ExportarPdfModal
        visible={visiblePdf}
        userId={usuario.uid}
        nombreUsuario={usuario.displayName || usuario.email || 'Usuario'}
        onClose={onCerrarPdf}
      />

      <BulkUploadModal
        visible={visibleBulk}
        userId={usuario.uid}
        onClose={onCerrarBulk}
        onCompletado={onRecargarDia}
      />
    </>
  )
})
