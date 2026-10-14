import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Card } from '../common/Card'
import { useTheme } from '../../context/ThemeContext'
import {
  cargarConfiguracion,
  guardarConfiguracion,
  HORARIOS_POR_DEFECTO,
  CONFIGURACION_POR_DEFECTO,
  type HorariosConfig,
  type NotificacionesConfig,
  type ModoTema,
} from '../../services/configService'
import {
  solicitarPermisoNotificaciones,
  sincronizarNotificaciones,
  enviarNotificacionPrueba,
} from '../../services/notificationService'
import { APP_VERSION } from '../../config/constants'
import { COMIDAS } from '../../config/comidas'
import { theme } from '../../utils/theme'
import type { ClaveComida, UsuarioAutenticado } from '../../types'

interface AjustesViewProps {
  usuario: UsuarioAutenticado
  onLogout: () => void
  onVerificarActualizacion?: () => void
}

/**
 * Ajusta una cadena de hora "HH:mm" sumando o restando minutos (en pasos de 15 min).
 */
function ajustarHora(horaStr: string, deltaMinutos: number): string {
  const [h, m] = horaStr.split(':').map(Number)
  let total = ((h || 0) * 60 + (m || 0) + deltaMinutos) % (24 * 60)
  if (total < 0) total += 24 * 60
  const nuevoH = Math.floor(total / 60)
  const nuevoM = total % 60
  return `${nuevoH.toString().padStart(2, '0')}:${nuevoM.toString().padStart(2, '0')}`
}

export const AjustesView: React.FC<AjustesViewProps> = ({
  usuario,
  onLogout,
  onVerificarActualizacion,
}) => {
  const { modoTema, cambiarModoTema, esOscuro, colors } = useTheme()
  const [horarios, setHorarios] = useState<HorariosConfig>(HORARIOS_POR_DEFECTO)
  const [notificaciones, setNotificaciones] = useState<NotificacionesConfig>(
    CONFIGURACION_POR_DEFECTO.notificaciones,
  )
  const [guardadoFeedback, setGuardadoFeedback] = useState(false)

  useEffect(() => {
    async function inicializar() {
      const cfg = await cargarConfiguracion()
      setHorarios(cfg.horarios)
      setNotificaciones(cfg.notificaciones)
    }
    void inicializar()
  }, [])

  const persistirHorarios = async (nuevos: HorariosConfig) => {
    setHorarios(nuevos)
    const cfg = await cargarConfiguracion()
    await guardarConfiguracion({
      ...cfg,
      horarios: nuevos,
    })
    await sincronizarNotificaciones()
    setGuardadoFeedback(true)
    setTimeout(() => setGuardadoFeedback(false), 2000)
  }

  const persistirNotificaciones = async (nuevas: NotificacionesConfig) => {
    setNotificaciones(nuevas)
    const cfg = await cargarConfiguracion()
    await guardarConfiguracion({
      ...cfg,
      notificaciones: nuevas,
    })
    await sincronizarNotificaciones()
    setGuardadoFeedback(true)
    setTimeout(() => setGuardadoFeedback(false), 2000)
  }

  const toggleRecordatorioComidas = async () => {
    if (!notificaciones.recordatorioComidas) {
      const permitido = await solicitarPermisoNotificaciones()
      if (!permitido) {
        Alert.alert(
          'Permiso de notificaciones',
          'Para recibir recordatorios debes activar las notificaciones en los ajustes del dispositivo.',
          [{ text: 'Entendido' }],
        )
        return
      }
      await persistirNotificaciones({ ...notificaciones, recordatorioComidas: true })
    } else {
      await persistirNotificaciones({ ...notificaciones, recordatorioComidas: false })
    }
  }

  const toggleRecordatorioFinJornada = async () => {
    if (!notificaciones.recordatorioFinJornada) {
      const permitido = await solicitarPermisoNotificaciones()
      if (!permitido) {
        Alert.alert(
          'Permiso de notificaciones',
          'Para recibir recordatorios debes activar las notificaciones en los ajustes del dispositivo.',
          [{ text: 'Entendido' }],
        )
        return
      }
      await persistirNotificaciones({ ...notificaciones, recordatorioFinJornada: true })
    } else {
      await persistirNotificaciones({ ...notificaciones, recordatorioFinJornada: false })
    }
  }

  const modificarHoraFinJornada = (delta: number) => {
    const actual = notificaciones.horaFinJornada || '22:00'
    const nuevaHora = ajustarHora(actual, delta)
    void persistirNotificaciones({
      ...notificaciones,
      horaFinJornada: nuevaHora,
    })
  }

  const handleProbarNotificacion = async () => {
    try {
      await enviarNotificacionPrueba()
      Alert.alert(
        'Notificación enviada',
        'La notificación aparecerá en tu teléfono en un instante. Púlsala para comprobar que abre el día de hoy.',
        [{ text: 'Genial' }],
      )
    } catch {
      Alert.alert(
        'Permiso denegado',
        'No se pudo enviar la notificación. Asegúrate de permitir las notificaciones en los ajustes de tu teléfono.',
      )
    }
  }

  const modificarHorario = (comida: ClaveComida, campo: 'inicio' | 'fin', delta: number) => {
    const actual = horarios[comida][campo]
    const nuevaHora = ajustarHora(actual, delta)
    const nuevos: HorariosConfig = {
      ...horarios,
      [comida]: {
        ...horarios[comida],
        [campo]: nuevaHora,
      },
    }
    void persistirHorarios(nuevos)
  }

  const restablecerValoresPorDefecto = () => {
    Alert.alert(
      'Restablecer horarios',
      '¿Deseas volver a los horarios recomendados por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => void persistirHorarios(HORARIOS_POR_DEFECTO),
        },
      ],
    )
  }

  const opcionesTema: { id: ModoTema; label: string; icon: keyof typeof FontAwesome.glyphMap }[] = [
    { id: 'sistema', label: 'Sistema', icon: 'adjust' },
    { id: 'claro', label: 'Claro', icon: 'sun-o' },
    { id: 'oscuro', label: 'Oscuro', icon: 'moon-o' },
  ]

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. SECCIÓN: APARIENCIA Y MODO OSCURO */}
      <Card>
        <View style={styles.cardHeader}>
          <FontAwesome name="paint-brush" size={16} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Apariencia</Text>
        </View>

        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Elige si prefieres tema claro, oscuro o sincronizarte automáticamente con el sistema de tu teléfono.
        </Text>

        <View style={styles.temaSelector}>
          {opcionesTema.map(op => {
            const activo = modoTema === op.id
            return (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.temaBtn,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  activo && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                ]}
                onPress={() => void cambiarModoTema(op.id)}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name={op.icon}
                  size={16}
                  color={activo ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.temaBtnText,
                    { color: colors.textMuted },
                    activo && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {op.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.temaNota, { color: colors.textMuted }]}>
          {modoTema === 'sistema'
            ? `Actualmente en modo ${esOscuro ? 'oscuro' : 'claro'} (según tu dispositivo).`
            : `Modo ${modoTema} seleccionado permanentemente.`}
        </Text>
      </Card>

      {/* 2. SECCIÓN: HORARIOS DE COMIDAS */}
      <Card>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <FontAwesome name="clock-o" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Horarios de Comidas</Text>
          </View>
          {guardadoFeedback && (
            <View style={styles.badgeGuardado}>
              <FontAwesome name="check" size={10} color={colors.primary} />
              <Text style={[styles.badgeGuardadoText, { color: colors.primary }]}>Guardado</Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Ajusta tus franjas horarias habituales para que la subida múltiple con IA y el widget clasifiquen cada plato con precisión.
        </Text>

        <View style={styles.horariosList}>
          {COMIDAS.map(c => {
            const h = horarios[c.clave] || HORARIOS_POR_DEFECTO[c.clave]
            return (
              <View key={c.clave} style={[styles.horarioItem, { borderBottomColor: colors.border }]}>
                <View style={styles.horarioLabelWrap}>
                  <FontAwesome
                    name={c.icono as keyof typeof FontAwesome.glyphMap}
                    size={14}
                    color={colors.primary}
                    style={{ width: 18 }}
                  />
                  <Text style={[styles.horarioTitulo, { color: colors.text }]}>{c.titulo}</Text>
                </View>

                <View style={styles.horarioControles}>
                  {/* Inicio */}
                  <View style={styles.timeBox}>
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Inicio</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => modificarHorario(c.clave, 'inicio', -30)}
                      >
                        <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{h.inicio}</Text>
                      <TouchableOpacity
                        style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => modificarHorario(c.clave, 'inicio', 30)}
                      >
                        <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>a</Text>

                  {/* Fin */}
                  <View style={styles.timeBox}>
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Fin</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => modificarHorario(c.clave, 'fin', -30)}
                      >
                        <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{h.fin}</Text>
                      <TouchableOpacity
                        style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => modificarHorario(c.clave, 'fin', 30)}
                      >
                        <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={restablecerValoresPorDefecto}
          activeOpacity={0.7}
        >
          <FontAwesome name="refresh" size={12} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.resetBtnText, { color: colors.primary }]}>
            Restablecer horarios por defecto
          </Text>
        </TouchableOpacity>
      </Card>

      {/* 3. SECCIÓN: NOTIFICACIONES Y RECORDATORIOS */}
      <Card>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <FontAwesome name="bell-o" size={16} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Notificaciones</Text>
          </View>
          <View
            style={[
              styles.badgeEstadoNotif,
              (notificaciones.recordatorioComidas || notificaciones.recordatorioFinJornada)
                ? { backgroundColor: colors.primarySoft }
                : { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.badgeEstadoNotifText,
                (notificaciones.recordatorioComidas || notificaciones.recordatorioFinJornada)
                  ? { color: colors.primary }
                  : { color: colors.textMuted },
              ]}
            >
              {notificaciones.recordatorioComidas || notificaciones.recordatorioFinJornada
                ? 'Activas'
                : 'Desactivadas'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Programa recordatorios locales en tu móvil para registrar comidas a tiempo o al finalizar tu día. Al pulsar el aviso se abrirá directamente el diario de hoy.
        </Text>

        {/* Opción 1: Recordatorio individual al terminar el horario de cada comida */}
        <View style={[styles.notifOptionItem, { borderBottomColor: colors.border }]}>
          <View style={styles.notifOptionInfo}>
            <Text style={[styles.notifOptionTitle, { color: colors.text }]}>
              Avisar al terminar cada comida
            </Text>
            <Text style={[styles.notifOptionDesc, { color: colors.textMuted }]}>
              Te avisa al finalizar el horario de una comida si aún no la has anotado.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.notifSwitchBtn,
              { borderColor: colors.border, backgroundColor: colors.background },
              notificaciones.recordatorioComidas && {
                borderColor: colors.primary,
                backgroundColor: colors.primarySoft,
              },
            ]}
            onPress={toggleRecordatorioComidas}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={notificaciones.recordatorioComidas ? 'check-circle' : 'circle-o'}
              size={14}
              color={notificaciones.recordatorioComidas ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.notifSwitchText,
                { color: colors.textMuted },
                notificaciones.recordatorioComidas && {
                  color: colors.primary,
                  fontWeight: '700',
                },
              ]}
            >
              {notificaciones.recordatorioComidas ? 'Activo' : 'Inactivo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Opción 2: Recordatorio al final de la jornada */}
        <View style={[styles.notifOptionItem, { borderBottomColor: colors.border }]}>
          <View style={styles.notifOptionInfo}>
            <Text style={[styles.notifOptionTitle, { color: colors.text }]}>
              Resumen al final de la jornada
            </Text>
            <Text style={[styles.notifOptionDesc, { color: colors.textMuted }]}>
              Te envía un aviso con la lista de comidas que quedaron pendientes hoy.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.notifSwitchBtn,
              { borderColor: colors.border, backgroundColor: colors.background },
              notificaciones.recordatorioFinJornada && {
                borderColor: colors.primary,
                backgroundColor: colors.primarySoft,
              },
            ]}
            onPress={toggleRecordatorioFinJornada}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={notificaciones.recordatorioFinJornada ? 'check-circle' : 'circle-o'}
              size={14}
              color={notificaciones.recordatorioFinJornada ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.notifSwitchText,
                { color: colors.textMuted },
                notificaciones.recordatorioFinJornada && {
                  color: colors.primary,
                  fontWeight: '700',
                },
              ]}
            >
              {notificaciones.recordatorioFinJornada ? 'Activo' : 'Inactivo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ajuste de hora si el recordatorio final está activado */}
        {notificaciones.recordatorioFinJornada && (
          <View style={[styles.horaFinRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.horaFinLabelWrap}>
              <FontAwesome name="moon-o" size={13} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.horaFinLabel, { color: colors.text }]}>Hora del aviso final:</Text>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => modificarHoraFinJornada(-30)}
              >
                <Text style={[styles.miniBtnText, { color: colors.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: colors.text }]}>
                {notificaciones.horaFinJornada || '22:00'}
              </Text>
              <TouchableOpacity
                style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => modificarHoraFinJornada(30)}
              >
                <Text style={[styles.miniBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botón Probar Notificación */}
        <TouchableOpacity
          style={[styles.testNotifBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={handleProbarNotificacion}
          activeOpacity={0.7}
        >
          <FontAwesome name="paper-plane-o" size={12} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.testNotifBtnText, { color: colors.primary }]}>
            Enviar notificación de prueba ahora
          </Text>
        </TouchableOpacity>
      </Card>

      {/* 4. SECCIÓN: CUENTA E INFORMACIÓN */}
      <Card>
        <View style={styles.cardHeader}>
          <FontAwesome name="user-circle-o" size={16} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Cuenta y Aplicación</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Usuario:</Text>
          <Text style={[styles.infoVal, { color: colors.text }]}>
            {usuario.email || usuario.displayName || 'Usuario'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Versión:</Text>
          <Text style={[styles.infoVal, { color: colors.text }]}>v{APP_VERSION}</Text>
        </View>

        <View style={styles.actionsColumn}>
          {onVerificarActualizacion && (
            <TouchableOpacity
              style={[styles.updateCheckBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={onVerificarActualizacion}
              activeOpacity={0.7}
            >
              <FontAwesome name="cloud-download" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.updateCheckBtnText, { color: colors.primary }]}>
                Comprobar actualizaciones
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: colors.errorSoft,
                borderColor: esOscuro ? '#4a2020' : '#ffcdd2',
              },
            ]}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <FontAwesome name="sign-out" size={14} color={colors.error} style={{ marginRight: 6 }} />
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 160,
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  temaSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  temaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
  },
  temaBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  temaNota: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeGuardado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeGuardadoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  horariosList: {
    marginBottom: theme.spacing.md,
  },
  horarioItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    gap: 6,
  },
  horarioLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horarioTitulo: {
    fontSize: 14,
    fontWeight: '700',
  },
  horarioControles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.md,
    paddingLeft: 24,
  },
  timeBox: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 46,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 12,
    marginTop: 14,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeEstadoNotif: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  badgeEstadoNotifText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notifOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
  },
  notifOptionInfo: {
    flex: 1,
  },
  notifOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  notifOptionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  notifSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  notifSwitchText: {
    fontSize: 12,
  },
  horaFinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
  },
  horaFinLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horaFinLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginTop: theme.spacing.md,
  },
  testNotifBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsColumn: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  updateCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  updateCheckBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    backgroundColor: '#ffebee',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d32f2f',
  },
})
