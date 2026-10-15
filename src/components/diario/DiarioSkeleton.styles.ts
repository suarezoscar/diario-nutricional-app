import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para el skeleton de carga inicial de DiarioView.
 */
export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
  },
  titlePlaceholder: {
    width: 110,
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  buttonPlaceholder: {
    width: 48,
    height: 22,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
  camButtonPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
  },
  inputPlaceholder: {
    minHeight: 64,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    gap: 8,
    justifyContent: 'center',
  },
  linePlaceholder: {
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  aguaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  vasoPlaceholder: {
    width: 26,
    height: 32,
    borderRadius: 6,
    backgroundColor: theme.colors.primarySoft,
  },
})
