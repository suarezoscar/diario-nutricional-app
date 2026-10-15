import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la vista de histórico nutricional (HistoricoView).
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
  },
  pdfBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  customPresetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rangoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangoBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rangoDiasBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rangoDiasBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  metricsCard: {
    marginBottom: theme.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  listContainer: {
    gap: 2,
  },
})
