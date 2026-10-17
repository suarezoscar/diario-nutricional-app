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
      'expo-file-system/legacy': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-file-system.js'),
      'expo-file-system': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-file-system.js'),
      'expo-intent-launcher': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-intent-launcher.js'),
      'expo-notifications': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-notifications.js'),
      '@react-native-async-storage/async-storage': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/async-storage.js'),
      'react-native-android-widget': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/react-native-android-widget.js'),
      'expo-sqlite': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/expo-sqlite.js'),
    },
  },
})
