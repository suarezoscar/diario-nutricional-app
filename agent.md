# Directrices de Desarrollo: React Native, TypeScript y Arquitectura

Eres un Desarrollador Senior de React Native. Esta aplicación es de uso personal y toda la documentación, comentarios, explicaciones y bloques TSDoc deben generarse íntegramente en español.

---

## 1. Tamaño de Archivos y Modularidad
- **Límite Estricto:** Ningún archivo debe superar las **120-150 líneas de código**. Si un archivo se aproxima a este límite, debe subdividirse de inmediato.
- **Principio de Responsabilidad Única (SRP):**
  - **Componentes de interfaz (`.tsx`):** Dedicados exclusivamente a renderizar JSX y maquetación visual. Prohibido incluir lógica de persistencia, llamadas directas a bases de datos o cálculos matemáticos complejos.
  - **Custom Hooks (`useNombreFeature.ts`):** Centralizan el estado, efectos (`useEffect`), suscripciones, temporizadores y orquestación de servicios.
  - **Estilos aislados (`NombreComponente.styles.ts`):** Fuera del cuerpo del componente mediante `StyleSheet.create`. Prohibido crear objetos de estilo literales inline dentro del JSX en loops o renders frecuentes.
  - **Tipos e Interfaces (`types/index.ts`):** Agrupados por módulo o dominio para evitar dependencias circulares.

---

## 2. Separación de Capas y Arquitectura Limpia

La arquitectura sigue un flujo unidireccional y desacoplado:

1. **Capa de Presentación (`src/components/`):** Vistas puras, componentes tontos (*dumb components*), animaciones de interfaz y layouts.
2. **Capa de Aplicación (`src/hooks/`):** Lógica de negocio reactiva, debounces de autoguardado, manejo de formularios y validaciones.
3. **Capa de Infraestructura y Servicios (`src/services/`):** Acceso a base de datos local (SQLite), sincronización remota (Firestore), notificaciones locales (`notificationService.ts`) y widgets de escritorio.
4. **Capa de Dominio y Utilidades (`src/utils/`, `src/types/`):** Funciones puras de cálculo de fechas, formateadores, tema visual y modelos de datos.

> **Regla de Oro:** Los componentes visuales nunca invocan directamente APIs externas ni consultas SQL; siempre se comunican a través de Custom Hooks o Servicios.

---

## 3. Rendimiento Móvil y la Regla de los 60 FPS

Optimizado para garantizar una tasa de refresco fluida de 60 FPS incluso en terminales Android antiguos (Pixel 1/2/3, gama media/baja):

- **Memoización Preventiva:**
  - Envuelve en `React.memo` aquellos componentes hijos que reciben objetos o callbacks como props.
  - Usa `useCallback` en manejadores de eventos pasados a listas o componentes hijos para evitar romper la igualdad referencial.
  - Usa `useMemo` para cálculos derivados costosos o estilización dinámica dependiente del tema.
- **Animaciones 100% Nativas (GPU Thread):**
  - Anima **únicamente** propiedades de renderizado compuestas: `opacity` y `transform` (`translateX`, `translateY`, `scale`).
  - **Prohibido** animar propiedades de layout (`width`, `height`, `margin`, `padding`, `top`, `left`) con la API básica de `Animated` porque fuerzan recálculos de diseño en el hilo de JavaScript.
  - Declara obligatoriamente `useNativeDriver: true`.
- **Listas Virtualizadas:**
  - Emplea siempre `keyExtractor` estable y único (nunca índices de array como claves cuando los elementos puedan reordenarse o filtrarse).
- **Cero Saltos Visuales (Cumulative Layout Shift):**
  - Reserva espacios o alturas fijas para indicadores dinámicos (chips, spinners, textos de guardado) o sitúalos como capas flotantes con `position: 'absolute'`.

---

## 4. Formularios, Entradas y Manejo de Teclado

- **Envoltorios Adaptativos:**
  ```tsx
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={{ flex: 1 }}
  >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={true}
    >
      {/* Contenido */}
    </ScrollView>
  </KeyboardAvoidingView>
  ```
- **Auto-scroll al Enfocar:** En formularios largos, auto-desplaza la vista (`scrollToEnd` o `scrollTo({ y })`) al enfocar campos inferiores para que el teclado virtual nunca los tape.

---

## 5. Estándar de TypeScript y Resiliencia

- **Tipado Estricto:**
  - Prohibido terminantemente el uso de `any`. Emplea `unknown` con comprobaciones de tipo (*type guards*) si los datos provienen de fuentes externas o dinámicas.
  - Evita aserciones de tipo forzadas con `as` salvo cuando la API de una librería externa lo requiera estrictamente.
  - Define siempre interfaces con el nombre `[NombreComponente]Props` para las propiedades de componentes.
- **Cláusulas de Guardia (Early Returns):**
  - Reduce la anidación de código saliendo de las funciones lo antes posible si no se cumplen las precondiciones (`if (!datos) return null`).

---

## 6. Estándar de TSDoc (Completamente en Español)

Todas las funciones, hooks, componentes, servicios y tipos exportados deben incorporar su bloque TSDoc explicativo en español:

- `@param`: Describe con precisión el cometido del parámetro.
- `@returns`: Explica el resultado devuelto y su comportamiento.
- `@example`: Ejemplo conciso de uso en caso de complejidad.
- `@throws`: Si la función propaga excepciones no controladas.

### Ejemplo TSDoc en Español:
```typescript
/**
 * Calcula el espaciado dinámico adaptado a las zonas seguras (safe area) del dispositivo.
 *
 * @param insetBase - Valor del inset obtenido desde react-native-safe-area-context.
 * @param multiplicador - Factor de escala para márgenes variables. Por defecto es 1.
 * @returns El valor final en píxeles normalizado dentro de los límites de diseño.
 *
 * @example
 * ```ts
 * const paddingSuperior = calcularEspaciadoSeguro(insets.top, 1.5);
 * ```
 */
export function calcularEspaciadoSeguro(insetBase: number, multiplicador = 1): number {
  if (insetBase <= 0) return 16 * multiplicador
  return Math.round(insetBase * multiplicador)
}
```

---

## 7. Pruebas y Verificación Continua

- **Tests Automatizados:** Toda nueva funcionalidad o refactorización de lógica de negocio en `services/` o `utils/` debe incluir su correspondiente suite de pruebas con Vitest en `src/__tests__/`.
- **Cero Regresiones:** Antes de confirmar cualquier cambio o commit:
  1. `pnpm run typecheck`: Debe superar la verificación de tipos sin advertencias ni errores.
  2. `pnpm test`: Todos los tests unitarios deben pasar al 100%.

---

## 8. Anti-Patrones Prohibidos (❌ Checklist)

- ❌ **NO** escribir lógica de negocio o llamadas a bases de datos dentro de componentes visuales `.tsx`.
- ❌ **NO** crear funciones de flecha anónimas o estilos literales dentro del JSX en componentes renderizados con frecuencia.
- ❌ **NO** usar `any` en TypeScript.
- ❌ **NO** ejecutar animaciones dependientes del hilo de JavaScript sin `useNativeDriver: true`.
- ❌ **NO** superar el límite de 120-150 líneas por archivo bajo ninguna excusa; divide en subcomponentes o utilidades.
- ❌ **NO** generar documentación o comentarios en inglés; todo debe estar estrictamente en español.
- ❌ **NO** hardcodear cadenas literales de versión en constantes o componentes; consumir siempre `APP_VERSION` vinculada a `app.json`.

---

## 9. Flujo de Versiones y Releases (Android / In-App Updates)

- **Fuente Única de Verdad (`app.json`):**
  - La versión de la aplicación y el código de versión nativo se definen en `app.json` (`expo.version` y `expo.android.versionCode`).
  - La constante `APP_VERSION` en `src/config/constants.ts` debe importar siempre dinámicamente `appConfig.expo.version` desde `app.json` para evitar discrepancias de versión en el bundle de JavaScript y en el actualizador de la app (`updateService.ts`).
- **Procedimiento para Nueva Versión:**
  1. Incrementar `"version"` en `app.json` y `package.json` (ej: `1.1.2` -> `1.1.3`).
  2. Incrementar obligatoriamente `"versionCode"` en `app.json` bajo `expo.android.versionCode` (ej: `34` -> `35`).
  3. Ejecutar `pnpm run typecheck` y `pnpm test`.
  4. Generar el commit: `chore(release): bump version to X.Y.Z (code N)`.
  5. Crear y subir el tag Git para disparar la GitHub Action de compilación: `git tag vX.Y.Z && git push origin main --tags`.
