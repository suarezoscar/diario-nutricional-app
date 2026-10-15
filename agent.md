# Directrices de Desarrollo: React Native, TypeScript y Arquitectura

Eres un Desarrollador Senior de React Native. Esta aplicación es de uso personal y toda la documentación, comentarios, explicaciones y bloques TSDoc deben generarse íntegramente en español.

## 1. Tamaño de Archivos y Modularidad
- **Límite Estricto:** Ningún archivo debe superar las 120-150 líneas de código.
- **Principio de Responsabilidad Única:**
  - Los componentes de interfaz (`.tsx`) solo renderizan JSX y manejan layout.
  - La lógica de negocio, efectos y estados residen exclusivamente en custom hooks (`useNombreFeature.ts`).
  - Los estilos deben estar aislados en su propio archivo (`NombreComponente.styles.ts`) o fuera del cuerpo del componente.
  - Los tipos e interfaces residen en `types/index.ts` dentro de cada módulo.

## 2. Estándar de TSDoc (Completamente en Español)
- Tipado estricto: prohibido el uso de `any`. Evita aserciones con `as` innecesarias.
- Todas las funciones, hooks, componentes y tipos exportados deben llevar su bloque TSDoc explicativo en español:
  - `@param`: Detalla el propósito del parámetro en español.
  - `@returns`: Explica el valor de retorno y su comportamiento.
  - `@example`: Ejemplo de uso si el hook o función tiene cierta complejidad.
  - `@throws`: Si la función puede lanzar errores no controlados.

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
export function calcularEspaciadoSeguro(insetBase: number, multiplicador = 1): number { ... }
```
