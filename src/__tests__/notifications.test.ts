import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Notifications from 'expo-notifications'
import {
  configurarNotificaciones,
  verificarPermisoNotificaciones,
  solicitarPermisoNotificaciones,
  programarRecordatoriosComidas,
  programarRecordatorioFinJornada,
  sincronizarNotificaciones,
  cancelarRecordatorioComida,
} from '../services/notificationService'
import { HORARIOS_POR_DEFECTO } from '../services/configService'
import type { Registro } from '../types'

describe('Servicio de Notificaciones y Recordatorios Locales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifica permisos de notificaciones correctamente', async () => {
    const permitido = await verificarPermisoNotificaciones()
    expect(permitido).toBe(true)
  })

  it('solicita permisos si aún no están concedidos', async () => {
    const concedido = await solicitarPermisoNotificaciones()
    expect(concedido).toBe(true)
  })

  it('cancela recordatorio de una comida específica', async () => {
    const spy = vi.spyOn(Notifications, 'cancelScheduledNotificationAsync')
    await cancelarRecordatorioComida('desayuno')
    expect(spy).toHaveBeenCalledWith('recordatorio_comida_desayuno')
  })

  it('programa recordatorios solo para las comidas no anotadas', async () => {
    const scheduleSpy = vi.spyOn(Notifications, 'scheduleNotificationAsync')
    const cancelSpy = vi.spyOn(Notifications, 'cancelScheduledNotificationAsync')

    // Desayuno y comida ya están anotados hoy
    const datosHoy: Partial<Registro> = {
      desayuno: 'Tostada con café',
      comida: 'Arroz con pollo',
    }

    await programarRecordatoriosComidas(HORARIOS_POR_DEFECTO, datosHoy)

    // Desayuno y comida deben haber sido cancelados
    expect(cancelSpy).toHaveBeenCalledWith('recordatorio_comida_desayuno')
    expect(cancelSpy).toHaveBeenCalledWith('recordatorio_comida_comida')

    // Media mañana, merienda y cena deben haberse programado
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'recordatorio_comida_mediaManana',
      }),
    )
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'recordatorio_comida_merienda',
      }),
    )
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'recordatorio_comida_cena',
      }),
    )
  })

  it('si todas las comidas están anotadas, cancela el recordatorio de fin de jornada', async () => {
    const cancelSpy = vi.spyOn(Notifications, 'cancelScheduledNotificationAsync')
    const scheduleSpy = vi.spyOn(Notifications, 'scheduleNotificationAsync')

    const datosCompletos: Partial<Registro> = {
      desayuno: 'Café',
      mediaMananaFuera: true,
      comida: 'Pasta',
      merienda: 'Fruta',
      cena: 'Sopa',
    }

    await programarRecordatorioFinJornada('22:00', datosCompletos)
    expect(cancelSpy).toHaveBeenCalledWith('recordatorio_fin_jornada')
    expect(scheduleSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'recordatorio_fin_jornada',
      }),
    )
  })

  it('si hay comidas pendientes, programa el recordatorio de fin de jornada con el texto adecuado', async () => {
    const scheduleSpy = vi.spyOn(Notifications, 'scheduleNotificationAsync')

    const datosIncompletos: Partial<Registro> = {
      desayuno: 'Café',
    }

    await programarRecordatorioFinJornada('22:30', datosIncompletos)
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'recordatorio_fin_jornada',
        content: expect.objectContaining({
          title: expect.stringContaining('Comidas pendientes'),
          body: expect.stringContaining('Aún no has anotado:'),
        }),
        trigger: expect.objectContaining({
          hour: 22,
          minute: 30,
        }),
      }),
    )
  })
})
