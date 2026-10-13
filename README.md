# Diario Nutricional - App Móvil (Android)

Aplicación móvil para Android construida con **React Native (Expo SDK 57)** y **TypeScript**.

## Características
- **Misma base de datos:** Sincronizado en tiempo real con Firestore y las mismas credenciales de usuario que la versión web.
- **Identificación de platos con IA:** Saca una foto con la cámara del móvil o selecciona de la galería; la IA transcribirá automáticamente el plato.
- **Persistencia de sesión segura:** Sesión guardada localmente con `AsyncStorage` (no hace falta volver a iniciar sesión cada vez).
- **Código limpio y modular:** Arquitectura desacoplada en `services`, `hooks`, `components` y `types` con archivos pequeños y mantenibles.

## Requisitos y Puesta en marcha

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm start
   ```

3. **Abrir en tu móvil Android:**
   - Descarga la app **Expo Go** desde Google Play Store en tu teléfono.
   - Escanea el código QR que aparecerá en tu terminal.

4. **Verificación de tipos:**
   ```bash
   pnpm run typecheck
   ```
