import { StyleSheet } from 'react-native'
import { theme } from '../../utils/theme'

/**
 * Estilos aislados para la vista principal del Diario (DiarioView).
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    elevation: 2,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  autoSaveNotice: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
})
