# 002 - Days Management

**Fecha**: 2025-11-13
**Estado**: 📋 Especificación
**Dependencias**: [000-design-foundation.md](./000-design-foundation.md)

## Resumen

Sistema de navegación y gestión de **Days** (entradas diarias de bitácora) mediante un sidebar lateral. Permite crear, editar, borrar, fijar y navegar entre días organizados cronológicamente.

---

## Layout Principal

```
┌──────────────────────────────────────────────────┐
│  ┌─────────────┬─────────────────────────────┐  │
│  │             │                             │  │
│  │   SIDEBAR   │    MAIN CONTENT             │  │
│  │   420px     │    (Day View)               │  │
│  │             │                             │  │
│  │             │                             │  │
│  └─────────────┴─────────────────────────────┘  │
└──────────────────────────────────────────────────┘

Mobile:
┌──────────────┐     ┌──────────────┐
│ [☰] Header  │     │ SIDEBAR      │
├──────────────┤     │ (Overlay)    │
│              │     │              │
│ Main Content │     │              │
│              │     │              │
└──────────────┘     └──────────────┘
```

### Dimensiones

- **Desktop**: Sidebar fijo 420px + contenido fluido
- **Desktop (colapsado)**: Sidebar 70px (solo íconos)
- **Tablet/Mobile**: Sidebar como overlay/drawer

---

## Sidebar - Estructura Completa

### Header (Top)

```
┌────────────────────────────────────────────┐
│  Kai  [Logo]            [─] [+]           │
└────────────────────────────────────────────┘
```

**Elementos**:
1. **Logo "Kai"** - Izquierda (text-lg font-semibold)
2. **Botón Colapsar** `[─]` - Derecha (ChevronLeft icon)
3. **Botón Crear** `[+]` - Extremo derecho (Plus icon)
   - Tooltip: "Create"
   - Dropdown menu: Day, Task, Project, Category
   - **Fase 1**: Solo "Create Day" activo

**Colapsado (70px)**:
```
┌──────┐
│  K   │
│      │
│ [─]  │
│ [+]  │
└──────┘
```

---

### Pinned Days (Collapsible)

```
┌────────────────────────────────────────────┐
│  ▼ Pinned                          [3]    │
├────────────────────────────────────────────┤
│  📌 13 de noviembre del 2025      [⋮]    │
│  📌 Mi día favorito               [⋮]    │
│  📌 Sprint Planning - Nov 1       [⋮]    │
└────────────────────────────────────────────┘
```

**Características**:
- **Sección colapsable** con chevron (▼/▶)
- **Contador** de days fijados [3]
- **Drag & drop** para reordenar (manual order)
- **Pin icon** 📌 visible siempre
- **Actions menu** [⋮] al hover

**Estados**:
- Normal: Solo título + pin icon
- Hover: Aparece menu [⋮] (slide-in desde derecha)
- Selected: Background `accent` color

---

### Days List (Grouped)

```
┌────────────────────────────────────────────┐
│  Hoy                                       │
├────────────────────────────────────────────┤
│  13 de noviembre del 2025         [⋮]    │
├────────────────────────────────────────────┤
│  Ayer                                      │
├────────────────────────────────────────────┤
│  12 de noviembre del 2025         [⋮]    │
├────────────────────────────────────────────┤
│  Esta semana                               │
├────────────────────────────────────────────┤
│  11 de noviembre del 2025         [⋮]    │
│  9 de noviembre del 2025          [⋮]    │
├────────────────────────────────────────────┤
│  La semana pasada                          │
├────────────────────────────────────────────┤
│  ...                                       │
└────────────────────────────────────────────┘
```

**Grupos cronológicos** (de más reciente a más antiguo):

1. **Hoy** - Day de fecha actual
2. **Ayer** - Day de hace 1 día
3. **Esta semana** - Lunes a Domingo de semana actual (excluyendo Hoy/Ayer)
4. **La semana pasada** - Lunes a Domingo de semana anterior
5. **Este mes** - Días del mes actual (excluyendo grupos anteriores)
6. **[Mes anterior]** - "Octubre", "Septiembre", etc.
7. **Este año** - Meses anteriores del año actual
8. **Más antiguo** - Años anteriores

**Group Headers**:
- Tipografía: `text-xs font-semibold uppercase`
- Color: `muted-foreground`
- Padding: `spacing-3` top/bottom
- Non-clickable

---

## Day Item - Anatomía y Estados

### Estado Normal

```
┌────────────────────────────────────────────┐
│  13 de noviembre del 2025                  │
└────────────────────────────────────────────┘
```

**Estructura**:
- Padding: `spacing-3` vertical, `spacing-4` horizontal
- Font: `text-sm font-normal`
- Color: `foreground`
- Radius: `radius-base` (6px)
- Cursor: `pointer`

**Click**: Navega al day (muestra tasks en main content)

---

### Estado Hover

```
┌────────────────────────────────────────────┐
│  13 de noviembre del 2025    [✏️] [🗑️]   │
└────────────────────────────────────────────┘
```

**Aparecen desde la derecha** (animación slide-in):
- **Edit button** [✏️] - Pencil icon
- **Delete button** [🗑️] - Trash icon
- Animación: `translateX(0)` desde `translateX(20px)`
- Duration: `150ms ease-out`

---

### Estado Selected (Activo)

```
┌────────────────────────────────────────────┐
│█ 13 de noviembre del 2025                 █│
└────────────────────────────────────────────┘
```

**Estilos**:
- Background: `accent` color
- Font: `font-medium` (peso aumentado)
- Border-left: `3px solid primary` (opcional)

---

### Estado Editing

```
┌────────────────────────────────────────────┐
│  [Mi día especial____________]    [❌] [✓]│
└────────────────────────────────────────────┘
```

**Cuando se clickea Edit**:
1. Título se convierte en `<input>` inline
2. Auto-focus en input
3. Botones Edit/Delete → Cancel [❌] / Save [✓]
4. Enter: Save
5. Escape: Cancel

**Validación**:
- No vacío
- Max 100 caracteres

---

### Pinned Item

```
┌────────────────────────────────────────────┐
│  📌 13 de noviembre del 2025      [⋮]    │
└────────────────────────────────────────────┘
```

**Pin Icon** siempre visible (izquierda del título)

**Actions en menu [⋮]**:
- Edit
- Unpin
- Delete

---

## Crear Day

### Dropdown Menu

```
       [+] ← Click
         ↓
    ┌──────────┐
    │ Day      │  ← Solo activo en Fase 1
    ├──────────┤
    │ Task     │  (disabled)
    │ Project  │  (disabled)
    │ Category │  (disabled)
    └──────────┘
```

**Componente**: shadcn/ui `DropdownMenu`

**Comportamiento al crear Day**:
1. Valida que no exista un day con `date = hoy`
2. Si existe: Toast error "Ya existe un day para hoy"
3. Si no existe:
   - Crear day con:
     - `date`: Fecha actual (YYYY-MM-DD)
     - `title`: "13 de noviembre del 2025" (formato español)
     - `userId`: Usuario actual
   - Toast success: "Day creado"
   - Navegar automáticamente al nuevo day
   - Scroll sidebar para hacer visible el day

**Formato de título**:
```js
// Ejemplo: 13 de noviembre del 2025
const title = date.toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
```

---

## Editar Day

**Flow**:
1. Click en [✏️] Edit button
2. Day item entra en modo edición
3. Input con valor actual del `title`
4. Usuario edita
5. Click en [✓] o Enter: Guardar
6. Click en [❌] o Escape: Cancelar

**API Call**:
```
PATCH /api/days/[id]
Body: { title: "Nuevo título" }
```

**Validaciones**:
- `title` no vacío
- Max 100 caracteres
- No se puede cambiar la `date`

---

## Borrar Day

**Flow**:
1. Click en [🗑️] Delete button
2. Abrir modal de confirmación

### Delete Modal

```
┌─────────────────────────────────────────┐
│  Delete Day?                        [X] │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️  Are you sure you want to delete   │
│     "13 de noviembre del 2025"?        │
│                                         │
│     All associated tasks (12) will be   │
│     permanently deleted.                │
│                                         │
│  This action cannot be undone.          │
│                                         │
│           [Cancel]  [Delete]            │
└─────────────────────────────────────────┘
```

**Componente**: shadcn/ui `Dialog`

**Elementos**:
- Warning icon ⚠️
- Título del day a borrar (bold)
- Contador de tasks asociadas
- Advertencia de acción permanente
- Buttons:
  - Cancel (Secondary)
  - Delete (Destructive, red)

**API Call**:
```
DELETE /api/days/[id]
```

**Post-delete**:
1. Toast success: "Day deleted"
2. Si estaba viendo ese day:
   - Navegar al day de hoy (o crear si no existe)
3. Actualizar lista del sidebar

---

## Fijar/Desfijar Day

**Agregar campo al schema**:
```prisma
model Day {
  // ... campos existentes
  pinned    Boolean  @default(false)
  pinnedAt  DateTime?
}
```

**API**:
```
PATCH /api/days/[id]/pin
Body: { pinned: true }
```

**Comportamiento**:
1. Click en Pin icon (o menu option)
2. API call para toggle `pinned`
3. Si `pinned = true`:
   - Day se mueve a sección "Pinned"
   - `pinnedAt` = now (para ordering inicial)
4. Si `pinned = false`:
   - Day vuelve a su grupo cronológico

**Drag & Drop en Pinned**:
- Usar `@dnd-kit/core` (React)
- Mantener orden custom en campo `pinnedOrder` (int)

---

## Vista de Day (Main Content)

```
┌──────────────────────────────────────────┐
│  13 de noviembre del 2025                │
├──────────────────────────────────────────┤
│                                          │
│  [Task list aquí - Ver spec 003]        │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

**Header**:
- Título del day: `text-3xl font-semibold`
- Padding: `spacing-8` top, `spacing-6` horizontal

**Content**:
- Lista de tasks (definido en spec 003-tasks-management.md)

---

## Comportamiento Inicial (First Load)

**Al abrir la app**:
1. Fetch all days del usuario
2. Buscar day con `date = hoy`
3. **Si no existe**:
   - Crear day automáticamente
   - Title: Fecha de hoy formateada
   - Navegar a ese day
4. **Si existe**:
   - Navegar a ese day
5. Scroll sidebar para mostrar day actual

**Estado de carga**:
- Skeleton loaders en sidebar
- Loading spinner en main content

---

## API Endpoints

### Existentes (ya implementados)

```
GET  /api/days          - Obtener todos los days del usuario
POST /api/days          - Crear nuevo day
```

### Nuevos (a implementar)

```
PATCH /api/days/[id]
  Body: { title: string }
  Response: { success: true, data: Day }

DELETE /api/days/[id]
  Response: { success: true }

PATCH /api/days/[id]/pin
  Body: { pinned: boolean }
  Response: { success: true, data: Day }

PATCH /api/days/[id]/order
  Body: { pinnedOrder: number }
  Response: { success: true, data: Day }
```

---

## Componentes UI

### Estructura de Archivos

```
src/components/features/days/
├── Sidebar.tsx                  # Sidebar layout principal
├── SidebarHeader.tsx            # Logo + Collapse + Create
├── CreateDayDropdown.tsx        # Dropdown del botón [+]
├── PinnedDaysSection.tsx        # Sección de days fijados
├── DaysListSection.tsx          # Lista agrupada de days
├── DayGroup.tsx                 # Grupo cronológico (header + items)
├── DayItem.tsx                  # Item individual de day
├── DayItemActions.tsx           # Botones Edit/Delete al hover
├── DeleteDayModal.tsx           # Modal de confirmación
└── DayView.tsx                  # Vista principal del day
```

### Componentes shadcn/ui Necesarios

```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add scroll-area
```

### Librerías Adicionales

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns  # Para manejo de fechas
```

---

## State Management

### TanStack Query (Server State)

```typescript
// hooks/useDays.ts
export function useDays() {
  return useQuery({
    queryKey: ['days'],
    queryFn: async () => {
      const res = await fetch('/api/days');
      return res.json();
    },
  });
}

export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDayInput) => {
      const res = await fetch('/api/days', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days'] });
    },
  });
}

// Similar para update, delete, pin
```

### Zustand (UI State)

```typescript
// stores/sidebar-store.ts
interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  selectedDayId: string | null;
  pinnedSectionCollapsed: boolean;

  toggleSidebar: () => void;
  toggleCollapse: () => void;
  selectDay: (id: string) => void;
  togglePinnedSection: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCollapsed: false,
  selectedDayId: null,
  pinnedSectionCollapsed: false,

  toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  selectDay: (id) => set({ selectedDayId: id }),
  togglePinnedSection: () => set((s) => ({
    pinnedSectionCollapsed: !s.pinnedSectionCollapsed
  })),
}));
```

---

## Agrupación de Days - Lógica

```typescript
// lib/group-days.ts
import { startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

type DayGroup =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'month'      // Con nombre del mes
  | 'this-year'
  | 'older';

export function groupDays(days: Day[]): Record<string, Day[]> {
  const today = new Date();
  const yesterday = subDays(today, 1);

  // Inicio de semana: Lunes (ISO 8601)
  const weekStart = startOfWeek(today, { weekStartsOn: 1, locale: es });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1, locale: es });

  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);

  const monthStart = startOfMonth(today);
  const yearStart = startOfYear(today);

  const grouped: Record<string, Day[]> = {
    'Hoy': [],
    'Ayer': [],
    'Esta semana': [],
    'La semana pasada': [],
    'Este mes': [],
    'Este año': [],
    'Más antiguo': [],
  };

  days.forEach(day => {
    const date = new Date(day.date);

    if (isSameDay(date, today)) {
      grouped['Hoy'].push(day);
    } else if (isSameDay(date, yesterday)) {
      grouped['Ayer'].push(day);
    } else if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
      grouped['Esta semana'].push(day);
    } else if (isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd })) {
      grouped['La semana pasada'].push(day);
    } else if (isWithinInterval(date, { start: monthStart, end: today })) {
      grouped['Este mes'].push(day);
    } else if (date >= yearStart) {
      // Agrupar por mes individual
      const monthKey = format(date, 'MMMM', { locale: es });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(day);
    } else {
      grouped['Más antiguo'].push(day);
    }
  });

  // Remover grupos vacíos
  return Object.fromEntries(
    Object.entries(grouped).filter(([_, days]) => days.length > 0)
  );
}
```

---

## Animaciones

### Slide-in de Actions (Hover)

```css
/* DayItemActions.tsx */
.day-actions {
  transform: translateX(20px);
  opacity: 0;
  transition: all 150ms ease-out;
}

.day-item:hover .day-actions {
  transform: translateX(0);
  opacity: 1;
}
```

### Collapse Sidebar

```typescript
// Usando Framer Motion
<motion.div
  initial={{ width: 420 }}
  animate={{ width: isCollapsed ? 70 : 420 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  {/* Sidebar content */}
</motion.div>
```

### Drag & Drop (Pinned Days)

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function PinnedDaysSection({ days }: Props) {
  const handleDragEnd = (event) => {
    // Update pinnedOrder en DB
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={days} strategy={verticalListSortingStrategy}>
        {days.map(day => <SortableDayItem key={day.id} day={day} />)}
      </SortableContext>
    </DndContext>
  );
}
```

---

## Responsive Design

### Mobile (< 768px)

```
- Sidebar como Drawer (shadcn/ui Sheet)
- Botón hamburguesa en header
- Overlay cuando está abierto
- Cierra automáticamente al seleccionar day
```

### Tablet (768px - 1024px)

```
- Sidebar colapsable (70px ↔ 280px)
- Botón collapse siempre visible
```

### Desktop (> 1024px)

```
- Sidebar siempre visible (420px)
- Opción de colapsar a 70px (solo íconos)
```

---

## Casos Edge

### 1. No hay days
- Mostrar empty state en main content
- Mensaje: "No days yet. Create your first day!"
- Botón CTA: "Create Today"

### 2. Day de hoy ya existe
- No crear duplicado
- Navegar al existente
- Toast: "Navigated to today"

### 3. Borrar day que está viendo
- Post-delete: Navegar a day de hoy
- Si no existe hoy: Crear y navegar

### 4. Todos los days están fijados
- Sección "Days" vacía
- Mostrar mensaje: "All days are pinned"

### 5. Límite de days
- Sin límite funcional
- Infinite scroll en sidebar (virtualización si > 100 days)

---

## Accesibilidad

### Keyboard Navigation

```
Tab:           Navegar entre days
Enter/Space:   Seleccionar day
Arrow Up/Down: Navegar lista
Escape:        Cerrar modals, cancelar edición
```

### Screen Readers

```
- Aria-labels en botones de íconos
- Aria-current en day seleccionado
- Aria-expanded en grupos colapsables
- Role="navigation" en sidebar
```

### Focus Management

```
- Focus visible en todos los interactivos
- Focus trap en modals
- Restore focus después de cerrar modal
```

---

## Performance

### Optimizaciones

1. **Virtualización**: React Virtual para listas largas (> 50 days)
2. **Memoización**: `React.memo` en DayItem
3. **Debounce**: En input de edición (300ms)
4. **Optimistic updates**: TanStack Query
5. **Prefetch**: Prefetch tasks al hover en day item

---

## Testing

### Unit Tests

```typescript
// __tests__/group-days.test.ts
describe('groupDays', () => {
  it('groups today correctly', () => {});
  it('groups yesterday correctly', () => {});
  it('groups this week correctly', () => {});
  // ...
});
```

### Integration Tests

```typescript
// __tests__/days-sidebar.test.tsx
describe('Days Sidebar', () => {
  it('renders pinned days first', () => {});
  it('allows creating a new day', () => {});
  it('prevents duplicate days', () => {});
  it('deletes day with confirmation', () => {});
});
```

---

## Próximos Pasos

1. ✅ **Spec completado**
2. 🔨 Implementar API endpoints faltantes
3. 🎨 Crear componentes UI del sidebar
4. 🧪 Testing
5. 📝 Continuar con [003-tasks-management.md](./003-tasks-management.md)

---

## Referencias

- [000-design-foundation.md](./000-design-foundation.md) - Sistema de diseño
- [001-setup.md](./001-setup.md) - Infraestructura técnica
- [Prisma Schema](../prisma/schema.prisma) - Modelo Day
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - Componente base
