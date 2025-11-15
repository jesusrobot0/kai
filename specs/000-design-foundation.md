# 000 - Design Foundation

**Fecha**: 2025-11-13
**Estado**: 📐 En Definición

## Resumen

Fundamentos de diseño visual y UX para **Kai**. El estilo visual está inspirado en la estética minimalista y refinada de Apple y Claude, priorizando claridad, espacios generosos y jerarquía visual clara.

---

## Filosofía de Diseño

### Principios Core

1. **Clarity First** - La información debe ser fácil de escanear y entender
2. **Generous Spacing** - Respiro visual entre elementos
3. **Subtle Elegance** - Detalles refinados sin ser llamativos
4. **Purposeful Motion** - Animaciones suaves que guían y contextualizan
5. **Content-Focused** - El UI debe desaparecer para dejar protagonismo al contenido

### Inspiración Visual

**Apple (macOS/iOS)**:
- Jerarquía visual clara
- Uso generoso de whitespace
- Tipografía refinada (SF Pro)
- Efectos sutiles (glassmorphism, shadows)
- Transiciones fluidas

**Claude**:
- Diseño limpio y conversacional
- Espaciado generoso
- Bordes redondeados suaves
- Color usado con propósito
- UI minimalista que no distrae

---

## Sistema de Color

### Color Space: OKLCH

El proyecto usa **OKLCH** (Oklab LCH) en lugar de HSL por sus ventajas:
- Perceptualmente uniforme (cambios numéricos = cambios visuales consistentes)
- Gamut más amplio (colores más vibrantes sin saturación)
- Mejor para accesibilidad (contraste predecible)

Formato: `oklch(lightness chroma hue)`
- Lightness: 0-1 (0 = negro, 1 = blanco)
- Chroma: 0-0.4 (intensidad de color)
- Hue: 0-360 (matiz en grados)

### Paleta Base (Zinc + Verde)

```css
/* Light Mode */
:root {
  /* Backgrounds */
  --background: oklch(1 0 0);                    /* White */
  --card: oklch(1 0 0);
  --popover: oklch(1 0 0);

  /* Foregrounds */
  --foreground: oklch(0.141 0.005 285.823);      /* Almost black */
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover-foreground: oklch(0.141 0.005 285.823);

  /* Grays (Zinc scale) */
  --muted: oklch(0.967 0.001 286.375);           /* Light gray */
  --muted-foreground: oklch(0.552 0.016 285.938); /* Medium gray */

  /* Borders & Inputs */
  --border: oklch(0.92 0.004 286.32);            /* Subtle border */
  --input: oklch(0.92 0.004 286.32);

  /* Primary (Verde profesional - hue 145°) */
  --primary: oklch(0.50 0.18 145);               /* Medium green */
  --primary-foreground: oklch(0.985 0 0);        /* White */
  --ring: oklch(0.50 0.18 145);                  /* Focus ring */

  /* Accent (Verde suave para hover) */
  --accent: oklch(0.96 0.06 145);                /* Very light green */
  --accent-foreground: oklch(0.35 0.15 145);     /* Dark green */

  /* Semantic Colors */
  --destructive: oklch(0.577 0.245 27.325);      /* Red */
  --destructive-foreground: oklch(0.985 0 0);    /* White */
}
```

### Dark Mode

```css
.dark {
  /* Backgrounds */
  --background: oklch(0.141 0.005 285.823);      /* Almost black */
  --foreground: oklch(0.985 0 0);                /* White */
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);

  /* Grays (Zinc scale) */
  --muted: oklch(0.274 0.006 286.033);           /* Dark gray */
  --muted-foreground: oklch(0.705 0.015 286.067); /* Light gray */

  /* Borders & Inputs */
  --border: oklch(1 0 0 / 10%);                  /* Subtle border */
  --input: oklch(1 0 0 / 15%);

  /* Primary (Verde brillante) */
  --primary: oklch(0.70 0.20 145);               /* Bright green */
  --primary-foreground: oklch(0.15 0.10 145);    /* Very dark green */
  --ring: oklch(0.70 0.20 145);                  /* Focus ring */

  /* Accent (Verde oscuro para hover) */
  --accent: oklch(0.28 0.10 145);                /* Dark green */
  --accent-foreground: oklch(0.85 0.15 145);     /* Light green */

  /* Semantic Colors */
  --destructive: oklch(0.704 0.191 22.216);      /* Red */
  --destructive-foreground: oklch(0.985 0 0);    /* White */
}
```

### Color de Proyecto/Categoría

Paleta predefinida para Projects y Categories:

```
Indigo:  #6366f1  (Default Projects)
Purple:  #8b5cf6  (Default Categories)
Blue:    #3b82f6
Teal:    #14b8a6
Green:   #10b981
Yellow:  #f59e0b
Orange:  #f97316
Red:     #ef4444
Pink:    #ec4899
```

---

## Tipografía

### Font Stack

```css
/* Sans-serif (UI) */
font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* Monospace (Code/Data) */
font-family: 'Geist Mono', 'SF Mono', Monaco,
             'Cascadia Code', 'Courier New', monospace;
```

### Escala Tipográfica

```css
/* Display (Headings) */
--text-5xl: 3rem;      /* 48px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Section headers */
--text-3xl: 1.875rem;  /* 30px */
--text-2xl: 1.5rem;    /* 24px - Card titles */
--text-xl:  1.25rem;   /* 20px - Subheadings */
--text-lg:  1.125rem;  /* 18px */

/* Body */
--text-base: 1rem;     /* 16px - Body text */
--text-sm:   0.875rem; /* 14px - Secondary text */
--text-xs:   0.75rem;  /* 12px - Labels, captions */
```

### Font Weights

```css
--font-light:    300;
--font-normal:   400;  /* Body text */
--font-medium:   500;  /* UI elements, buttons */
--font-semibold: 600;  /* Headings */
--font-bold:     700;  /* Emphasis */
```

### Line Heights

```css
--leading-tight:  1.25;  /* Headings */
--leading-snug:   1.375;
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Reading content */
--leading-loose:  2;
```

---

## Espaciado y Layout

### Sistema de Espaciado (4px base)

```css
--spacing-0:  0;
--spacing-1:  0.25rem;  /* 4px */
--spacing-2:  0.5rem;   /* 8px */
--spacing-3:  0.75rem;  /* 12px */
--spacing-4:  1rem;     /* 16px - Base unit */
--spacing-5:  1.25rem;  /* 20px */
--spacing-6:  1.5rem;   /* 24px */
--spacing-8:  2rem;     /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### Principios de Espaciado

- **Dentro de componentes**: `spacing-2` a `spacing-4`
- **Entre componentes relacionados**: `spacing-4` a `spacing-6`
- **Entre secciones**: `spacing-8` a `spacing-12`
- **Márgenes de página**: `spacing-6` a `spacing-8` (mobile), `spacing-12+` (desktop)

### Breakpoints

```css
--screen-sm: 640px;   /* Mobile large */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Desktop large */
--screen-2xl: 1536px; /* Wide screens */
```

---

## Componentes Base

### Borders

```css
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px */
--radius-base: 0.375rem;  /* 6px - Cards, inputs */
--radius-md:   0.5rem;    /* 8px */
--radius-lg:   0.75rem;   /* 12px - Modals */
--radius-xl:   1rem;      /* 16px */
--radius-full: 9999px;    /* Pills, avatars */
```

**Uso**:
- Buttons: `radius-base` (6px)
- Cards: `radius-lg` (12px)
- Modals: `radius-xl` (16px)
- Inputs: `radius-base` (6px)
- Pills/Badges: `radius-full`

### Shadows

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Cards, dropdowns */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Modals, popovers */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Heavy emphasis */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
             0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Estados Interactivos

```css
/* Hover states */
opacity: 0.9;
transform: translateY(-1px); /* Subtle lift */

/* Active/Pressed */
opacity: 0.8;
transform: translateY(0px);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;

/* Focus */
outline: 2px solid var(--ring);
outline-offset: 2px;
```

---

## Animaciones y Transiciones

### Duración

```css
--duration-75:  75ms;   /* Instant feedback */
--duration-100: 100ms;
--duration-150: 150ms;  /* Hover states */
--duration-200: 200ms;  /* Default transitions */
--duration-300: 300ms;  /* Modals, drawers */
--duration-500: 500ms;  /* Page transitions */
```

### Easing

```css
--ease-linear:    cubic-bezier(0, 0, 1, 1);
--ease-in:        cubic-bezier(0.4, 0, 1, 1);
--ease-out:       cubic-bezier(0, 0, 0.2, 1);      /* Default */
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful bounce */
```

### Principios

1. **Sutil pero perceptible** - 150-200ms para la mayoría de transiciones
2. **Contexto antes de acción** - Elementos entran antes de salir
3. **Natural** - Usar ease-out para feeling natural
4. **Consistencia** - Misma duración para acciones similares

---

## Patrones de UI

### Cards

```
┌─────────────────────────────────┐
│  Title                     Icon │
│  ───────────────────────────── │
│                                 │
│  Content with generous          │
│  spacing and clear hierarchy    │
│                                 │
│  [Action Button]                │
└─────────────────────────────────┘

- Border: 1px solid border-color
- Radius: radius-lg (12px)
- Padding: spacing-6 (24px)
- Shadow: shadow-sm on hover
```

### Inputs

```
┌─────────────────────────────────┐
│ Placeholder or value            │
└─────────────────────────────────┘

- Height: 40px (spacing-10)
- Padding: spacing-3 spacing-4
- Radius: radius-base (6px)
- Border: 1px solid input
- Focus: ring-2 ring-ring
```

### Buttons

```
Primary (filled):  [  Do Action  ]
                   - bg-primary
                   - hover: bg-primary/90

Secondary:         ┌──────────────┐
                   │  Do Action   │
                   └──────────────┘
                   - bg-secondary
                   - hover: bg-secondary/80

Outline:           ┌──────────────┐
                   │  Do Action   │
                   └──────────────┘
                   - border + shadow-xs
                   - hover: bg-accent

Ghost:             Do Action
                   - Transparent
                   - hover: bg-muted (gray)

Ghost (no hover):  Do Action
                   - Transparent
                   - No hover effect
                   - text-muted-foreground
                   - Uso: Navegación discreta

- Height: 40px (spacing-10)
- Padding: spacing-3 spacing-6
- Radius: radius-base (6px)
- Font: font-medium
- Transition: all duration-150
```

---

## Layout Patterns

### Dashboard Layout

```
┌────────────────────────────────────────┐
│  Topbar (60px)                         │
├────────┬───────────────────────────────┤
│        │                               │
│ Side   │  Main Content Area            │
│ bar    │  (Generous padding)           │
│ 240px  │                               │
│        │                               │
└────────┴───────────────────────────────┘

- Topbar: Fixed, z-10
- Sidebar: Collapsible on mobile
- Content: Max-width 1280px, centered
- Padding: spacing-6 to spacing-12
```

### Content Density

**Loose** (Default):
- Espaciado generoso
- Ideal para lectura y focus
- Tasks, Days, Annotations

**Compact**:
- Menor espaciado
- Tablas, listas largas
- Time entries list

---

## Iconografía

### Librería

**Lucide React** - Conjunto consistente, minimalista
```bash
npm install lucide-react
```

### Tamaños

```css
--icon-xs:  12px;  /* Inline text */
--icon-sm:  16px;  /* Buttons, labels */
--icon-md:  20px;  /* Default UI */
--icon-lg:  24px;  /* Headers */
--icon-xl:  32px;  /* Feature icons */
```

### Estilo

- Stroke weight: 2px
- Estilo: Outline (no filled)
- Color: Heredar del texto padre

---

## Accesibilidad

### Requisitos

1. **Contraste**: Mínimo WCAG AA (4.5:1 para texto)
2. **Focus visible**: Outline claro en todos los interactivos
3. **Keyboard navigation**: Tab order lógico
4. **Screen readers**: Semantic HTML, ARIA labels
5. **Touch targets**: Mínimo 44x44px en mobile

### Focus Management

```css
/* Remove default */
:focus { outline: none; }

/* Custom focus ring */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

---

## Responsive Design

### Mobile First

Diseñar primero para mobile, luego expandir:

```css
/* Mobile (default) */
.container { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; }
}
```

### Patrones

- **Mobile**: Single column, colapsible sidebar
- **Tablet**: 2 columns donde sea lógico
- **Desktop**: Multi-column, sidebar permanente

---

## Feedback & Estados

### Loading States

```
Spinner (Primary actions)
Skeleton (Content loading)
Progress bar (Long operations)
Shimmer effect (Optimistic UI)
```

### Empty States

```
┌─────────────────────┐
│                     │
│      [Icon]         │
│                     │
│   No items yet      │
│   Create your first │
│                     │
│   [+ Create]        │
│                     │
└─────────────────────┘

- Icon: icon-xl, muted color
- Text: muted-foreground
- CTA: Primary button
```

### Error States

```
⚠️ Error message
   Clear explanation
   [Retry] [Dismiss]

- Color: destructive
- Icon: AlertCircle
- Actions: Claras y disponibles
```

---

## Componentes shadcn/ui a Usar

### Básicos
- Button
- Input
- Textarea
- Select
- Checkbox
- Switch

### Layout
- Card
- Separator
- Tabs
- Dialog (Modal)
- Sheet (Drawer)
- Popover

### Feedback
- Toast (Notificaciones)
- Alert
- Badge
- Progress

### Formularios
- Form (con React Hook Form)
- Label
- Calendar
- Date Picker

### Avanzados
- Command (⌘K menu)
- Dropdown Menu
- Context Menu
- Tooltip

---

## Implementación

### CSS Variables

Todas las variables de diseño deben estar en [globals.css](../src/app/globals.css) usando CSS custom properties en formato **OKLCH**:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... mapeo de variables a clases Tailwind */
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.50 0.18 145);
  --accent: oklch(0.96 0.06 145);
  /* ... todas las variables */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --primary: oklch(0.70 0.20 145);
  /* ... valores dark mode */
}
```

### Tailwind v4

El proyecto usa **Tailwind CSS v4** con configuración CSS-first:

- No hay `tailwind.config.js` tradicional
- Configuración mediante `@theme inline` en CSS
- CSS custom properties mapeadas a clases de Tailwind
- Soporte nativo para OKLCH color space

### Componentes Reutilizables

Crear componentes base en `src/components/ui/` siguiendo shadcn/ui patterns.

---

## Referencias

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [shadcn/ui Design System](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Próximo paso**: Aplicar estos fundamentos en el spec de Days Management (002)
