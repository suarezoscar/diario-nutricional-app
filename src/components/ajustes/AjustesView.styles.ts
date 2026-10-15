import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos visuales desacoplados para la vista de Ajustes y Configuración.
 */
export const styles = StyleSheet.create({
  scrollContent: { padding: theme.spacing.md, paddingBottom: 160, gap: theme.spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
  cardHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
  headerIcon: { marginRight: theme.spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  sectionDesc: { fontSize: 13, marginBottom: theme.spacing.md, lineHeight: 18 },
  temaSelector: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  temaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: theme.spacing.md, borderRadius: theme.radius.sm, borderWidth: 1.5,
  },
  temaBtnText: { fontSize: 13, fontWeight: '600' },
  temaNota: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  badgeGuardado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeGuardadoText: { fontSize: 11, fontWeight: '700' },
  horariosList: { marginBottom: theme.spacing.md },
  horarioItem: { paddingVertical: theme.spacing.sm, borderBottomWidth: 1, gap: 6 },
  horarioLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  horarioTitulo: { fontSize: 14, fontWeight: '700' },
  horarioControles: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    gap: theme.spacing.md, paddingLeft: 24,
  },
  timeBox: { alignItems: 'center' },
  timeLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniBtn: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  miniBtnText: { fontSize: 14, fontWeight: '700' },
  timeValue: { fontSize: 14, fontWeight: '700', minWidth: 46, textAlign: 'center' },
  timeSeparator: { fontSize: 12, marginTop: 14 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.sm, borderRadius: theme.radius.sm, borderWidth: 1,
  },
  resetBtnText: { fontSize: 12, fontWeight: '600' },
  badgeEstadoNotif: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.full },
  badgeEstadoNotifText: { fontSize: 10, fontWeight: '700' },
  notifOptionItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, gap: theme.spacing.sm,
  },
  notifOptionInfo: { flex: 1 },
  notifOptionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  notifOptionDesc: { fontSize: 11, lineHeight: 15 },
  notifSwitchBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: theme.radius.sm, borderWidth: 1, gap: 6,
  },
  notifSwitchText: { fontSize: 12 },
  horaFinRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.sm,
    borderWidth: 1, marginTop: theme.spacing.sm,
  },
  horaFinLabelWrap: { flexDirection: 'row', alignItems: 'center' },
  horaFinLabel: { fontSize: 12, fontWeight: '600' },
  testNotifBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: theme.radius.sm, borderWidth: 1, marginTop: theme.spacing.md,
  },
  testNotifBtnText: { fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 13 },
  infoVal: { fontSize: 13, fontWeight: '600' },
  actionsColumn: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
  updateCheckBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.sm, borderRadius: theme.radius.sm, borderWidth: 1,
  },
  updateCheckBtnText: { fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.sm, borderRadius: theme.radius.sm, borderWidth: 1,
  },
  logoutBtnText: { fontSize: 13, fontWeight: '600' },
})
