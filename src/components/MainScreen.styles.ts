import { StyleSheet } from 'react-native'
import { theme } from '../utils/theme'

/**
 * Estilos aislados para la pantalla contenedora principal (MainScreen).
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  pageWrap: {
    flex: 1,
  },
})
