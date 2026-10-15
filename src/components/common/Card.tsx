import React from 'react'
import { View, StyleSheet, type ViewProps } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { theme } from '../../utils/theme'

export const Card: React.FC<ViewProps> = React.memo(({ style, children, ...props }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    elevation: 2,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
})
