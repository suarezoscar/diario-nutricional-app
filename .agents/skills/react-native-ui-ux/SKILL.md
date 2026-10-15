---
name: react-native-ui-ux
description: >-
  Guía experta de diseño UI/UX y heurísticas móviles para React Native y Expo.
  Activa esta skill para diseñar interfaces móviles modernas, ergonómicas y
  fluidas a 60 FPS, aplicando sistemas de diseño, micro-interacciones, gestión
  de teclado, accesibilidad, safe areas y feedback táctil.
---

# Skill de Diseño UI/UX para React Native & Expo

Esta skill proporciona los estándares, patrones arquitectónicos y heurísticas de usabilidad para diseñar interfaces móviles de alta fidelidad, ergonómicas, estéticas y con rendimiento nativo garantizado a 60 FPS.

---

## 1. Ergonomía Táctil y Zona del Pulgar (Thumb Zone)

En dispositivos móviles modernos (pantallas de 6" a 6.8"), más del 75% de las interacciones se realizan con una sola mano utilizando el pulgar.

* **Distribución de Zonas:**
  * **Zona Natural (Tercio Inferior):** Ubica aquí las acciones principales (Bottom Navigation, botones primarios de acción, FABs, campos de entrada frecuentes).
  * **Zona de Alcance Cómodo (Tercio Medio):** Tarjetas de contenido, listas navegables e información de lectura.
  * **Zona Difícil (Tercio Superior):** Reservada para elementos de solo lectura, estado o acciones secundarias/infrecuentes (título de cabecera, avatar de usuario, botón de ajustes).
* **Tamaño Mínimo de Área Táctil (Touch Targets):**
  * Android: mínimo **48 × 48 dp**.
  * iOS: mínimo **44 × 44 pt**.
  * **Regla `hitSlop`:** Si un icono visual es pequeño (ej. 16px - 20px), expande su zona interactiva con `hitSlop` sin alterar el layout:
    ```tsx
    <TouchableOpacity
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Cerrar modal"
    >
      <FontAwesome name="times" size={16} color={colors.text} />
    </TouchableOpacity>
    ```
* **Feedback Táctil Inmediato:** Todo elemento pulsable debe acusar recibo instantáneo del toque (`activeOpacity={0.65 - 0.75}` o `android_ripple={{ color: colors.primarySoft }}`).

---

## 2. Sistema de Diseño y Tokens Centralizados

Toda la interfaz debe alimentarse de tokens semánticos definidos centralizadamente (ej. `src/utils/theme.ts`).

* **Cuadrícula Base de 4/8 pt:**
  * Espaciados (`spacing`): `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`, `xxxl: 32`.
  * Nunca utilices valores arbitrarios (como `padding: 13` o `margin: 27`).
* **Radios de Curvatura Coherentes (`borderRadius`):**
  * `xs: 4` (badges muy pequeños), `sm: 8` (inputs, chips compactos), `md: 12` (botones, tarjetas estándar), `lg: 16` (modales, hojas inferiores), `full: 9999` (píldoras, avatares, chips circulares).
* **Tipografía y Legibilidad:**
  * Define siempre `lineHeight` junto a `fontSize` (el motor tipográfico de Android y iOS corta glifos descendentes si el line-height no está explícito).
  * Jerarquía clara: Título (20-22px, bold), Subtítulo (15-16px, semi-bold), Cuerpo (13-14px, regular), Muted/Caption (11-12px, regular).
* **Modo Oscuro Semántico y Elevaciones Tonales:**
  * En modo oscuro, las sombras negras son invisibles. Diferencia los niveles de elevación aclarando suavemente el color de fondo de las tarjetas respecto al fondo principal (elevación tonal).

---

## 3. Animaciones Nativas a 60 FPS (Hardware Acceleration)

Las animaciones móviles deben sentirse orgánicas y nunca competir con el hilo de ejecución de JavaScript.

* **Regla de Oro de Rendimiento:**
  * Anima **únicamente** propiedades de renderizado compuestas en GPU: `opacity` y `transform` (`translateX`, `translateY`, `scale`).
  * **Prohibido** animar propiedades de layout (`width`, `height`, `top`, `left`, `margin`, `padding`) con la API estándar de Animated, ya que provocan recalculo de diseño (*layout reflow*) y tirones en teléfonos antiguos.
  * Siempre declara `useNativeDriver: true`.
* **Duraciones y Curvas de Aceleración:**
  * **Micro-interacciones (toggles, botones, feedback):** 120 ms - 180 ms.
  * **Transiciones de pantalla y deslizamiento de tarjetas:** 180 ms - 240 ms con `Easing.out(Easing.cubic)`.
  * **Salidas y desvanecimiento:** 150 ms - 220 ms con `Easing.in(Easing.cubic)`.
* **Desplazamiento Direccional Coherente:**
  * Al avanzar cronológicamente o en pestañas a la derecha: el nuevo contenido entra desde la derecha (+X → 0).
  * Al retroceder: el contenido entra desde la izquierda (-X → 0).

---

## 4. Visibilidad del Estado del Sistema (Zero Layout Shifts)

El usuario debe comprender en todo momento qué está haciendo la app sin que la interfaz pegue saltos visuales molestos (*Cumulative Layout Shift*).

* **Indicadores Flotantes vs. Bloqueantes:**
  * Los avisos de guardado o sincronización deben flotar de forma sutil (cápsula flotante/toast) sin empujar el contenido hacia abajo.
  * Utiliza `pointerEvents="none"` en toasts flotantes para que no bloqueen toques en elementos subyacentes.
* **Carga Inicial vs. Carga en Segundo Plano:**
  * **Skeleton Screens:** Solo en la primera apertura en frío mientras se descargan o montan datos iniciales.
  * **Transiciones Directas:** Cuando los datos se leen de almacenamiento local (SQLite/AsyncStorage), anima el contenido directamente sin parpadeos de bloques grises.
* **Espacios Reservados:** Reserva alturas fijas para filas que puedan mostrar u ocultar estados (chips, spinners, textos de guardado).

---

## 5. Manejo de Teclado y Safe Areas

Los formularios móviles y campos de texto no deben quedar nunca cubiertos por el teclado virtual ni cortados por la barra de navegación del sistema.

* **Envoltorios Seguros:**
  * Usa `SafeAreaView` o `useSafeAreaInsets` para respetar la muesca (notch), isla dinámica y barra de gestos de Android/iOS.
* **Formularios con Scroll Automático:**
  * En pantallas con múltiples inputs, configura `KeyboardAvoidingView` adaptativo:
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
  * En enfocar campos inferiores, utiliza `scrollTo({ y, animated: true })` o `scrollToEnd({ animated: true })` con un pequeño retardo (~100-150ms).

---

## 6. Accesibilidad (a11y) y Estándares WCAG

* **Etiquetado de Controles Gráficos:**
  * Todo botón que solo contenga un icono debe incluir obligatoriamente `accessibilityLabel` descriptivo (ej: `accessibilityLabel="Ir al día anterior"`).
* **Contraste de Color:**
  * Ratio mínimo de **4.5:1** para texto sobre fondo (WCAG AA).
  * Ratio mínimo de **3:1** para bordes interactivos y componentes de interfaz.
* **Estados Accesibles:**
  * Declara `accessibilityRole="button" | "header" | "tab" | "alert"`.
  * Usa `accessibilityLiveRegion="polite"` en indicadores de estado dinámicos como guardado o sincronización.
