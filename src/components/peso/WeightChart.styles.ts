import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la gráfica SVG de evolución de peso (WeightChart).
 */
export const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
})
