import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la tarjeta individual de comida (ComidaCard)
 * y sus subcomponentes interactivos.
 */
export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  ayerIcon: {
    marginRight: 4,
  },
  ayerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fueraBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  fueraBtnText: {
    fontSize: 12,
  },
  camBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  skeletonContainer: {
    minHeight: 64,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  skeletonTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonLine: {
    height: 10,
    borderRadius: 4,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  countText: {
    fontSize: 11,
  },
  cardActual: {
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  actualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    marginLeft: theme.spacing.xs,
  },
  actualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
})
