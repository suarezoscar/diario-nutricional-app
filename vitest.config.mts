import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      'react-native': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/react-native.js'),
      'expo-print': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-print.js'),
      'expo-sharing': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-sharing.js'),
      'expo-file-system': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-file-system.js'),
    },
  },
})
