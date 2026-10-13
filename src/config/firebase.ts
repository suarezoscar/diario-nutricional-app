import { initializeApp, getApps, getApp } from 'firebase/app'
import * as firebaseAuth from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyA9J9FJ6LT_ekEzMN0R3tGPx7i7j8Cez24',
  authDomain: 'diario-nutricional-9105b.firebaseapp.com',
  projectId: 'diario-nutricional-9105b',
  storageBucket: 'diario-nutricional-9105b.firebasestorage.app',
  messagingSenderId: '324028540051',
  appId: '1:324028540051:web:1917c32d772d5220301966',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// En React Native, getReactNativePersistence es provisto en tiempo de ejecución por el export 'react-native'
const getReactNativePersistence = (firebaseAuth as unknown as {
  getReactNativePersistence?: (storage: typeof AsyncStorage) => firebaseAuth.Persistence
}).getReactNativePersistence

export const auth = (() => {
  try {
    if (getReactNativePersistence) {
      return firebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    }
    return firebaseAuth.getAuth(app)
  } catch {
    return firebaseAuth.getAuth(app)
  }
})()

export const db = getFirestore(app)
