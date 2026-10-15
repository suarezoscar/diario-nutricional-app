import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la vista de control y evolución de peso (PesoView).
 */
export const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 160,
  },
  statsCard: {
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValSmall: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateSelectorSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  dateSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    gap: 8,
  },
  calendarIcon: { marginRight: 2 },
  datePickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  caretIcon: { marginLeft: 4 },
  todayQuickBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  todayQuickBtnText: { fontSize: 11, fontWeight: '700' },
  existingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  existingNoticeText: { fontSize: 12 },
  existingNoticeBold: { fontWeight: '700' },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.md,
  },
  historyDate: { fontSize: 13, textTransform: 'capitalize' },
  historyWeight: { fontSize: 14, fontWeight: '700' },
  deleteBtn: { padding: theme.spacing.xs },
})
