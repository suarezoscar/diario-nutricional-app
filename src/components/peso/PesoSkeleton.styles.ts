import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para los skeletons de la pantalla de peso (PesoSkeleton).
 */
export const styles = StyleSheet.create({
  statsCardSkeleton: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statLabelPlaceholder: {
    width: 65,
    height: 10,
    borderRadius: 3,
  },
  statValPlaceholder: {
    width: 50,
    height: 18,
    borderRadius: 4,
  },
  chartContainer: {
    height: 170,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    height: 1,
  },
  chartContent: {
    position: 'absolute',
    bottom: 0,
    left: theme.spacing.md,
    right: theme.spacing.md,
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartCol: {
    alignItems: 'center',
    gap: 4,
  },
  chartPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  chartBar: {
    width: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
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
    gap: 6,
  },
  historyDatePlaceholder: {
    height: 13,
    borderRadius: 4,
  },
  historyWeightPlaceholder: {
    height: 16,
    width: 60,
    borderRadius: 4,
  },
  deleteBtnPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: theme.spacing.sm,
  },
})
