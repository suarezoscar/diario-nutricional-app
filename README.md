# Diario Nutricional - App Móvil (Android)

Aplicación móvil para Android construida con **React Native (Expo SDK 57)** y **TypeScript**.

## Características
- **Misma base de datos:** Sincronizado en tiempo real con Firestore y las mismas credenciales de usuario que la versión web.
- **Identificación de platos con IA:** Saca una foto con la cámara del móvil o selecciona de la galería; la IA transcribirá automáticamente el plato.
- **Persistencia de sesión segura:** Sesión guardada localmente con `AsyncStorage` (no hace falta volver a iniciar sesión cada vez).
- **Auto-actualizaciones in-app:** Al abrir la aplicación, comprueba automáticamente la API de GitHub Releases; si hay un APK nuevo, ofrece descargarlo e instalarlo con un solo toque.
- **Compilación continua:** Flujo de GitHub Actions listo para generar y publicar el APK firmado automáticamente.

## Requisitos y Puesta en marcha

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Iniciar en modo desarrollo (Expo Go):**
   ```bash
   pnpm start
   ```
   Escanea el código QR desde la aplicación gratuita **Expo Go** en tu móvil Android.

3. **Verificación de tipos:**
   ```bash
   pnpm run typecheck
   ```

---

## Cómo publicar una nueva versión (APK automático)

Cada vez que quieras crear una nueva versión instalable:

1. Incrementa `version` y `versionCode` en `app.json` y `src/config/constants.ts` (ej: `1.0.1` y `2`).
2. Sube un tag de Git a GitHub:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. El flujo de **GitHub Actions** compilará el APK firmado con la misma clave consistente y publicará la release en GitHub.
4. Cuando abras la app en tu teléfono, detectará la versión `v1.0.1` y te pedirá actualizar automáticamente.
