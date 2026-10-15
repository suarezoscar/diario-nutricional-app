import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la barra horizontal de navegación de fechas (DateBar).
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
  },
  dateButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIcon: {
    marginRight: 2,
  },
  caretIcon: {
    marginLeft: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginTop: 4,
    width: '100%',
    position: 'relative',
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    height: 22,
  },
  dayChipButton: {},
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  historyIcon: {
    marginRight: 4,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
