# 002 - Days Management

**Fecha**: 2025-11-14
**Estado**: 📐 En Definición

## Resumen

Sistema de gestión de entradas diarias (Days) para **Kai**. Cada día funciona como una página de bitácora donde el usuario registra sus tareas, pensamientos y progreso. Los días son la unidad organizativa principal de la aplicación.

---

## Objetivos

1. **Crear y visualizar días** - Interfaz intuitiva para crear entradas diarias
2. **Navegación temporal** - Moverse fácilmente entre días pasados, presente y futuros
3. **Vista resumen** - Ver múltiples días en formato calendario o lista
4. **Contexto visual** - Mostrar estadísticas y progreso de cada día
5. **Persistencia automática** - Auto-guardado de cambios

---

## Modelo de Datos

### Schema Existente (Prisma)

```prisma
model Day {
  id        String   @id @default(cuid())
  date      DateTime @unique @db.Date
  title     String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]
}
```

### Propiedades

- **date**: Fecha única del día (sin hora, solo fecha)
- **title**: Título opcional descriptivo del día (ej: "Sprint Planning", "Lanzamiento v1.0")
- **tasks**: Relación 1:N con tareas
- **userId**: Dueño del día

### Reglas de Negocio

1. Un usuario NO puede tener dos Days con la misma fecha
2. El título es opcional - si no se provee, se muestra solo la fecha
3. Los días se pueden crear en el pasado o futuro
4. Al eliminar un día, se eliminan todas sus tareas en cascada
5. La fecha no se puede modificar después de crear el día (inmutable)

---

## Features

### 1. Vista Diaria (Day View)

**Descripción**: Vista principal donde el usuario trabaja en las tareas de un día específico.

#### Componentes

```
┌─────────────────────────────────────────────────┐
│  ← Today (Nov 14, 2025)                     → │
│  ────────────────────────────────────────────  │
│                                                 │
│  [Optional Day Title - Editable inline]         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ☐ Task 1                            [⋯]│   │
│  │ ☑ Task 2 (completed)                   │   │
│  │ ☐ Task 3                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [+ Add Task]                                   │
│                                                 │
│  ┌─────────────── Stats ───────────────────┐   │
│  │ 2/3 tasks • 4h 30m tracked              │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### Elementos UI

1. **Header de navegación**:
   - Botón "←" (ir a día anterior)
   - Fecha central (clickeable para abrir DatePicker)
   - Botón "Today" (ir a hoy)
   - Botón "→" (ir a día siguiente)

2. **Day Title**:
   - Input inline editable (click para editar)
   - Placeholder: "Add a title for today..."
   - Auto-save al perder focus (debounced)
   - Max 100 caracteres

3. **Lista de Tasks**:
   - Ordenables drag & drop
   - Checkbox de completado
   - Título de tarea
   - Indicadores: proyecto, categorías, tiempo
   - Botón de opciones "⋯" (editar, eliminar)

4. **Add Task Button**:
   - Botón primario "+" o texto "+ Add task"
   - Abre input inline para crear tarea rápida
   - Enter para crear, Esc para cancelar

5. **Stats Footer**:
   - Progreso de tareas (X/Y completed)
   - Tiempo total trackeado
   - Opcional: Breakdown por proyecto

#### Comportamiento

- **Auto-creación**: Si navegas a una fecha sin día existente, se crea automáticamente al agregar la primera tarea
- **Empty state**: Si no hay tareas, mostrar ilustración + CTA "Create your first task"
- **Navegación con teclado**:
  - `←` / `→` para navegar días
  - `Ctrl/Cmd + T` para ir a Today
  - `N` para nueva tarea
- **Loading states**: Skeleton mientras cargan tasks

---

### 2. Vista Calendario (Calendar View)

**Descripción**: Vista mensual tipo calendario para visualizar múltiples días y su estado.

#### Layout

```
┌─────────────── November 2025 ───────────────┐
│  ← Month               [Today]            → │
├─────────────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat         │
├─────────────────────────────────────────────┤
│                   1     2     3     4       │
│                  ╔═══╗ ╔═══╗ [   ] [   ]   │
│                  ║ 5 ║ ║ 4 ║              │
│                  ╚═══╝ ╚═══╝              │
│                                             │
│   5     6     7     8     9    10    11    │
│  ╔═══╗ [   ] [   ] ╔═══╗ [   ] [   ] [   ]│
│  ║ 3 ║             ║ 7 ║                  │
│  ╚═══╝             ╚═══╝                  │
│  ...                                       │
└─────────────────────────────────────────────┘

Legend:
╔═══╗ Day with tasks (bold border)
[   ] Day without tasks (light border)
• Number = task count
```

#### Elementos UI

1. **Header**:
   - Botón "← Month" (mes anterior)
   - Nombre del mes y año
   - Botón "Today" (ir al mes actual)
   - Botón "→ Month" (mes siguiente)

2. **Grid de días**:
   - Cada celda representa un día
   - Estados visuales:
     - **Con tareas**: Border destacado, muestra # de tareas
     - **Sin tareas**: Border sutil
     - **Hoy**: Background accent color
     - **Días fuera del mes**: Opacidad reducida
   - Indicador de progreso:
     - Color de fondo sutil si todas completadas (verde)
     - Color de fondo warning si hay pendientes (amarillo)

3. **Hover state**:
   - Preview tooltip con:
     - Título del día (si existe)
     - "X tasks (Y completed)"
     - Proyectos principales del día

4. **Click behavior**:
   - Click en día → Abre Day View de esa fecha
   - Días sin tareas → Abre Day View vacío (listo para crear)

#### Comportamiento

- **Lazy loading**: Solo cargar días del mes visible + 1 mes buffer
- **Indicadores de actividad**: Dot o badge en días con mucha actividad
- **Filtros** (opcional v2):
  - Mostrar solo días con tasks
  - Filtrar por proyecto/categoría

---

### 3. Vista Lista (List View)

**Descripción**: Lista cronológica de días para scroll infinito y búsqueda.

#### Layout

```
┌─────────────────────────────────────────────┐
│  Recent Days                                │
│  [Search days...]               [Filters]   │
├─────────────────────────────────────────────┤
│                                             │
│  Today - November 14, 2025                  │
│  ─────────────────────────────────────      │
│  Sprint Planning Session                    │
│  ☑ 5/8 tasks • 6h 20m • @kai-app #planning │
│                                             │
│  Yesterday - November 13, 2025              │
│  ─────────────────────────────────────      │
│  ☑ 12/12 tasks • 8h 45m • @kai-app         │
│                                             │
│  November 12, 2025                          │
│  ─────────────────────────────────────      │
│  Design System Work                         │
│  ☐ 3/10 tasks • 2h 15m • @kai-app #design  │
│                                             │
│  ...                                        │
│                                             │
│  [Load more]                                │
└─────────────────────────────────────────────┘
```

#### Elementos UI

1. **Search bar**:
   - Buscar por título de día o contenido de tareas
   - Debounced search (300ms)
   - Placeholder: "Search days by title or tasks..."

2. **Filters dropdown**:
   - Date range (Last 7 days, Last 30 days, Custom)
   - Projects filter
   - Categories filter
   - Completion status (All, Completed, In Progress, Not started)

3. **Day cards**:
   - Fecha en formato relativo (Today, Yesterday) o absoluto
   - Título del día (si existe)
   - Estadísticas: progreso, tiempo, tags de proyectos/categorías
   - Hover: Botones de acción (View, Delete)

4. **Infinite scroll**:
   - Cargar 20 días por página
   - Loading spinner al final de la lista
   - "Load more" button como fallback

#### Comportamiento

- **Ordenamiento**: Descendente (más reciente primero)
- **Grouping** (opcional): Por semana o mes
- **Click**: Abre Day View de ese día
- **Performance**: Virtualización si hay +100 días

---

## API Endpoints

### Endpoints Existentes

#### `GET /api/days`
Obtener todos los días del usuario.

**Query params**:
- `userId` (required): ID del usuario
- `startDate` (optional): Fecha inicio para rango
- `endDate` (optional): Fecha fin para rango
- `limit` (optional): Número máximo de resultados
- `offset` (optional): Para paginación

**Response**:
```json
{
  "days": [
    {
      "id": "cuid",
      "date": "2025-11-14T00:00:00.000Z",
      "title": "Sprint Planning",
      "userId": "user_cuid",
      "createdAt": "2025-11-14T10:00:00.000Z",
      "updatedAt": "2025-11-14T15:30:00.000Z",
      "tasks": [
        {
          "id": "task_cuid",
          "title": "Design mockups",
          "completed": true,
          // ... más campos
        }
      ]
    }
  ],
  "total": 45,
  "hasMore": true
}
```

#### `POST /api/days`
Crear un nuevo día.

**Body**:
```json
{
  "date": "2025-11-14",
  "title": "Sprint Planning",
  "userId": "user_cuid"
}
```

**Response**:
```json
{
  "day": {
    "id": "cuid",
    "date": "2025-11-14T00:00:00.000Z",
    "title": "Sprint Planning",
    "userId": "user_cuid",
    "createdAt": "2025-11-14T10:00:00.000Z",
    "updatedAt": "2025-11-14T10:00:00.000Z"
  }
}
```

### Nuevos Endpoints Necesarios

#### `GET /api/days/:id`
Obtener un día específico por ID.

**Response**:
```json
{
  "day": {
    "id": "cuid",
    "date": "2025-11-14T00:00:00.000Z",
    "title": "Sprint Planning",
    "tasks": [/* ... */],
    "stats": {
      "totalTasks": 8,
      "completedTasks": 5,
      "totalTime": 22800, // seconds
      "projects": ["@kai-app", "@website"],
      "categories": ["#planning", "#design"]
    }
  }
}
```

#### `GET /api/days/by-date/:date`
Obtener día por fecha (más común que por ID).

**Params**:
- `date`: Formato ISO date (2025-11-14)

**Response**: Igual que GET /api/days/:id

#### `PATCH /api/days/:id`
Actualizar día (solo title).

**Body**:
```json
{
  "title": "New title"
}
```

#### `DELETE /api/days/:id`
Eliminar día y todas sus tareas.

**Response**:
```json
{
  "success": true,
  "deletedId": "cuid"
}
```

#### `GET /api/days/stats`
Obtener estadísticas agregadas de días.

**Query params**:
- `userId` (required)
- `startDate` (optional)
- `endDate` (optional)

**Response**:
```json
{
  "stats": {
    "totalDays": 45,
    "daysWithTasks": 42,
    "totalTasks": 387,
    "completedTasks": 320,
    "totalTimeTracked": 156000,
    "averageTasksPerDay": 8.6,
    "averageTimePerDay": 3467,
    "mostProductiveDay": {
      "date": "2025-11-10",
      "tasks": 15,
      "timeTracked": 28800
    }
  }
}
```

---

## React Hooks

### Custom Hooks a Implementar

#### `useDayByDate(date: Date)`
Hook para obtener un día específico por fecha.

```typescript
import { useQuery } from '@tanstack/react-query';

export function useDayByDate(date: Date, userId: string) {
  return useQuery({
    queryKey: ['day', userId, date.toISOString()],
    queryFn: () => fetchDayByDate(date, userId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

#### `useDays(options)`
Hook para obtener múltiples días con filtros.

```typescript
export function useDays({
  userId,
  startDate,
  endDate,
  limit = 20,
  offset = 0,
}: UseDaysOptions) {
  return useQuery({
    queryKey: ['days', userId, { startDate, endDate, limit, offset }],
    queryFn: () => fetchDays({ userId, startDate, endDate, limit, offset }),
  });
}
```

#### `useCreateDay()`
Hook para crear días.

```typescript
export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDayData) => createDay(data),
    onSuccess: (newDay) => {
      // Invalidar cache de días
      queryClient.invalidateQueries({ queryKey: ['days'] });
      // Optimistic update
      queryClient.setQueryData(['day', newDay.userId, newDay.date], newDay);
    },
  });
}
```

#### `useUpdateDay()`
Hook para actualizar título de día.

```typescript
export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: UpdateDayData) => updateDay(id, { title }),
    onSuccess: (updatedDay) => {
      queryClient.invalidateQueries({ queryKey: ['day', updatedDay.id] });
    },
  });
}
```

#### `useDeleteDay()`
Hook para eliminar días.

```typescript
export function useDeleteDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDay(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['days'] });
      queryClient.removeQueries({ queryKey: ['day', deletedId] });
    },
  });
}
```

#### `useNavigateDay()`
Hook helper para navegación entre días.

```typescript
export function useNavigateDay() {
  const router = useRouter();

  return {
    goToToday: () => {
      router.push(`/days/${format(new Date(), 'yyyy-MM-dd')}`);
    },
    goToPrevious: (currentDate: Date) => {
      const prev = subDays(currentDate, 1);
      router.push(`/days/${format(prev, 'yyyy-MM-dd')}`);
    },
    goToNext: (currentDate: Date) => {
      const next = addDays(currentDate, 1);
      router.push(`/days/${format(next, 'yyyy-MM-dd')}`);
    },
    goToDate: (date: Date) => {
      router.push(`/days/${format(date, 'yyyy-MM-dd')}`);
    },
  };
}
```

---

## Componentes UI

### Estructura de Componentes

```
src/components/features/days/
├── DayView.tsx              # Vista principal de día
├── DayHeader.tsx            # Header con navegación
├── DayTitle.tsx             # Título editable inline
├── DayStats.tsx             # Footer con estadísticas
├── CalendarView.tsx         # Vista calendario mensual
├── CalendarDay.tsx          # Celda individual del calendario
├── DayListView.tsx          # Vista lista de días
├── DayCard.tsx              # Card de día en lista
├── DayPicker.tsx            # Date picker modal
└── EmptyDayState.tsx        # Empty state para día sin tareas
```

### Componente Principal: `DayView`

```typescript
// src/components/features/days/DayView.tsx

import { useDayByDate } from '@/hooks/useDayByDate';
import { useNavigateDay } from '@/hooks/useNavigateDay';
import { DayHeader } from './DayHeader';
import { DayTitle } from './DayTitle';
import { TaskList } from '@/components/features/tasks/TaskList';
import { DayStats } from './DayStats';

interface DayViewProps {
  date: Date;
  userId: string;
}

export function DayView({ date, userId }: DayViewProps) {
  const { data: day, isLoading } = useDayByDate(date, userId);
  const navigate = useNavigateDay();

  if (isLoading) {
    return <DayViewSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <DayHeader
        date={date}
        onPrevious={() => navigate.goToPrevious(date)}
        onNext={() => navigate.goToNext(date)}
        onToday={navigate.goToToday}
      />

      <DayTitle
        dayId={day?.id}
        initialTitle={day?.title}
        date={date}
      />

      <TaskList
        tasks={day?.tasks ?? []}
        dayId={day?.id}
        emptyState={<EmptyDayState />}
      />

      {day && <DayStats day={day} />}
    </div>
  );
}
```

### `DayHeader` - Navegación de días

```typescript
// src/components/features/days/DayHeader.tsx

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface DayHeaderProps {
  date: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateClick?: () => void;
}

export function DayHeader({
  date,
  onPrevious,
  onNext,
  onToday,
  onDateClick,
}: DayHeaderProps) {
  const dateText = isToday(date)
    ? 'Today'
    : format(date, 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3">
        <button
          onClick={onDateClick}
          className="text-2xl font-semibold hover:text-primary transition-colors"
        >
          {dateText}
        </button>

        {!isToday(date) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
          >
            Today
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

### `DayTitle` - Título editable

```typescript
// src/components/features/days/DayTitle.tsx

import { useState, useEffect } from 'react';
import { useUpdateDay } from '@/hooks/useUpdateDay';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';

interface DayTitleProps {
  dayId?: string;
  initialTitle?: string | null;
  date: Date;
}

export function DayTitle({ dayId, initialTitle, date }: DayTitleProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const debouncedTitle = useDebounce(title, 500);
  const updateDay = useUpdateDay();

  useEffect(() => {
    if (dayId && debouncedTitle !== initialTitle) {
      updateDay.mutate({ id: dayId, title: debouncedTitle || null });
    }
  }, [debouncedTitle]);

  return (
    <Input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Add a title for this day..."
      className="text-lg font-medium border-0 focus-visible:ring-0 px-0"
      maxLength={100}
    />
  );
}
```

### `DayStats` - Estadísticas del día

```typescript
// src/components/features/days/DayStats.tsx

import { Day, Task, TimeEntry } from '@prisma/client';
import { formatDuration } from '@/lib/utils';

type DayWithTasks = Day & {
  tasks: (Task & {
    timeEntries: TimeEntry[];
  })[];
};

interface DayStatsProps {
  day: DayWithTasks;
}

export function DayStats({ day }: DayStatsProps) {
  const totalTasks = day.tasks.length;
  const completedTasks = day.tasks.filter(t => t.completed).length;

  const totalTime = day.tasks.reduce((acc, task) => {
    const taskTime = task.timeEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
    return acc + taskTime;
  }, 0);

  if (totalTasks === 0) return null;

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
      <div>
        <span className="font-medium text-foreground">
          {completedTasks}/{totalTasks}
        </span>{' '}
        tasks completed
      </div>

      {totalTime > 0 && (
        <div>
          <span className="font-medium text-foreground">
            {formatDuration(totalTime)}
          </span>{' '}
          tracked
        </div>
      )}

      <div className="flex-1" />

      {/* Progress bar */}
      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${(completedTasks / totalTasks) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
```

---

## Routing

### Estructura de Rutas

```
app/
├── (dashboard)/
│   ├── layout.tsx              # Layout con sidebar
│   ├── page.tsx                # Redirect a /days/today
│   └── days/
│       ├── page.tsx            # Lista de días (DayListView)
│       ├── calendar/
│       │   └── page.tsx        # Vista calendario
│       └── [date]/
│           └── page.tsx        # Vista de día específico (DayView)
```

### Implementación de Rutas

#### `/app/(dashboard)/days/[date]/page.tsx`

```typescript
import { DayView } from '@/components/features/days/DayView';
import { parseISO } from 'date-fns';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface DayPageProps {
  params: Promise<{
    date: string; // Format: yyyy-MM-dd
  }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { userId } = await auth();
  const { date: dateParam } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  let date: Date;
  try {
    date = parseISO(dateParam);
  } catch {
    redirect('/days/today');
  }

  return <DayView date={date} userId={userId} />;
}

// Generate metadata
export async function generateMetadata({ params }: DayPageProps) {
  const { date } = await params;
  return {
    title: `Day - ${date} | Kai`,
  };
}
```

#### `/app/(dashboard)/days/page.tsx`

```typescript
import { DayListView } from '@/components/features/days/DayListView';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DaysPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <DayListView userId={userId} />;
}

export const metadata = {
  title: 'All Days | Kai',
};
```

#### `/app/(dashboard)/days/calendar/page.tsx`

```typescript
import { CalendarView } from '@/components/features/days/CalendarView';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function CalendarPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <CalendarView userId={userId} />;
}

export const metadata = {
  title: 'Calendar | Kai',
};
```

---

## UX Patterns

### 1. Navegación Fluida

**Keyboard shortcuts**:
- `←` / `→` : Navegar días anterior/siguiente
- `Ctrl/Cmd + .` : Ir a Today
- `Ctrl/Cmd + K` : Abrir Command palette (buscar días)
- `N` : Nueva tarea en día actual

**Gestures** (Mobile):
- Swipe left/right en DayView para cambiar de día
- Pull to refresh en listas

### 2. Auto-save

**Comportamiento**:
- Todos los cambios se guardan automáticamente
- Debounce de 500ms para evitar llamadas excesivas
- Indicador sutil de "Saving..." mientras persiste
- Optimistic updates para feedback inmediato

### 3. Empty States

**Día sin tareas**:
```
┌─────────────────────────────────┐
│                                 │
│         [Clipboard Icon]        │
│                                 │
│    No tasks for this day yet    │
│    Create your first task to    │
│         get started             │
│                                 │
│       [+ Create Task]           │
│                                 │
└─────────────────────────────────┘
```

**Sin días creados** (Usuario nuevo):
```
┌─────────────────────────────────┐
│                                 │
│         [Calendar Icon]         │
│                                 │
│    Welcome to your journal!     │
│    Start by adding a task to    │
│         today's entry           │
│                                 │
│      [Go to Today →]            │
│                                 │
└─────────────────────────────────┘
```

### 4. Loading States

**DayView skeleton**:
```typescript
function DayViewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>

      {/* Title */}
      <div className="h-10 w-96 bg-muted rounded" />

      {/* Tasks */}
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-muted rounded" />
      ))}
    </div>
  );
}
```

### 5. Error States

**Failed to load day**:
```typescript
function DayError({ error, retry }: DayErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to load day</AlertTitle>
      <AlertDescription>
        {error.message}
        <Button variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Performance

### Optimizaciones

1. **Query caching**:
   - TanStack Query con staleTime de 5 minutos
   - Cache persiste en sessionStorage para navegación rápida

2. **Prefetching**:
   - Prefetch día siguiente/anterior en hover de botones
   - Prefetch días del mes en Calendar view

3. **Virtualization**:
   - Lista de días usa react-window para listas largas (100+ días)
   - Solo renderizar días visibles en viewport

4. **Optimistic updates**:
   - Actualizaciones de título instantáneas
   - Crear/completar tasks sin esperar servidor

5. **Code splitting**:
   - Calendar view como lazy import
   - Day picker modal lazy loaded

### Límites y Paginación

- **DayListView**: 20 días por página
- **CalendarView**: 1 mes + buffer de 1 mes (total 2 meses en cache)
- **Tasks por día**: Sin límite, pero advertir si >50 tasks en un día

---

## Accesibilidad

### Requisitos WCAG AA

1. **Keyboard navigation**:
   - Todos los controles accesibles por teclado
   - Focus visible con outline personalizado
   - Tab order lógico

2. **Screen readers**:
   - Labels en botones de navegación
   - ARIA labels en date picker
   - Live regions para feedback de auto-save

3. **Color contrast**:
   - Textos cumplen ratio 4.5:1
   - Estados de hover/focus distinguibles sin color

4. **Touch targets**:
   - Mínimo 44x44px en mobile
   - Espaciado suficiente entre elementos clickeables

### Ejemplos

```typescript
// ARIA labels
<button aria-label="Go to previous day">
  <ChevronLeft />
</button>

// Live region para auto-save
<div role="status" aria-live="polite" className="sr-only">
  {isSaving && "Saving changes..."}
  {isSaved && "Changes saved"}
</div>

// Semantic HTML
<main aria-label="Day view">
  <header>...</header>
  <article aria-label={`Tasks for ${dateText}`}>
    ...
  </article>
</main>
```

---

## Testing

### Unit Tests

```typescript
// src/hooks/useDayByDate.test.ts
describe('useDayByDate', () => {
  it('fetches day by date', async () => {
    const { result } = renderHook(() =>
      useDayByDate(new Date('2025-11-14'), 'user_123')
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.date).toBe('2025-11-14');
  });

  it('returns null if day does not exist', async () => {
    // ...
  });
});
```

### Integration Tests

```typescript
// src/components/features/days/DayView.test.tsx
describe('DayView', () => {
  it('renders day with tasks', async () => {
    render(<DayView date={new Date()} userId="user_123" />);

    expect(await screen.findByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('navigates to previous day', async () => {
    const { user } = setup(<DayView date={new Date()} userId="user_123" />);

    await user.click(screen.getByLabelText('Previous day'));

    expect(router.push).toHaveBeenCalled();
  });

  it('updates day title on blur', async () => {
    // ...
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/days.spec.ts
test('create and view day', async ({ page }) => {
  await page.goto('/days/2025-11-14');

  // Add title
  await page.fill('input[placeholder*="Add a title"]', 'My Day');
  await page.blur('input[placeholder*="Add a title"]');

  // Verify saved
  await page.waitForSelector('text=Changes saved');

  // Navigate away and back
  await page.click('button[aria-label="Next day"]');
  await page.click('button[aria-label="Previous day"]');

  // Title persists
  expect(await page.inputValue('input[placeholder*="Add a title"]'))
    .toBe('My Day');
});
```

---

## Migración y Próximos Pasos

### Fase 1: Core Features (Semana 1-2)
- ✅ API endpoints completos (/api/days/*)
- ✅ Custom hooks (useDayByDate, useCreateDay, etc.)
- ✅ Componente DayView con navegación
- ✅ DayTitle editable con auto-save
- ✅ Integración con TaskList (del spec 003)

### Fase 2: Vistas Adicionales (Semana 3)
- ⏳ CalendarView con grid mensual
- ⏳ DayListView con infinite scroll
- ⏳ DayPicker modal para navegación rápida
- ⏳ DayStats con visualización de progreso

### Fase 3: Polish & UX (Semana 4)
- ⏳ Keyboard shortcuts
- ⏳ Mobile gestures (swipe navigation)
- ⏳ Loading/error states refinados
- ⏳ Prefetching y optimizaciones
- ⏳ Tests E2E completos

### Fase 4: Advanced Features (Futuro)
- ⏳ Búsqueda full-text en días y tareas
- ⏳ Filtros avanzados (por proyecto, categoría, tiempo)
- ⏳ Exportar días a Markdown/PDF
- ⏳ Templates de días (ej: "Sprint Planning Day")
- ⏳ Duplicar días
- ⏳ Archivar días antiguos

---

## Dependencias Adicionales

```json
{
  "dependencies": {
    "date-fns": "^3.0.0",           // Manipulación de fechas
    "react-window": "^1.8.10",      // Virtualización de listas
    "@dnd-kit/core": "^6.0.0",      // Drag & drop (futuro)
    "@dnd-kit/sortable": "^8.0.0"
  }
}
```

---

## Anexos

### A. Formato de Fechas

**Formatos usados**:
- **ISO Date** (storage): `2025-11-14` (sin timezone)
- **Display relativo**: "Today", "Yesterday", "Tomorrow"
- **Display absoluto**: "Monday, November 14, 2025"
- **URL param**: `/days/2025-11-14`

**Timezone handling**:
- Usar fecha local del usuario (no UTC)
- Convertir a inicio de día (00:00:00) para comparaciones
- Prisma almacena como @db.Date (sin hora)

### B. Edge Cases

1. **Usuario crea tarea antes de que exista el Day**:
   - Crear Day automáticamente en POST /api/tasks
   - Fecha del Day = fecha de la tarea

2. **Usuario elimina todas las tareas de un día**:
   - Day persiste (puede tener título)
   - Mostrar empty state, no eliminar Day

3. **Navegar a día muy futuro/pasado**:
   - No hay límite, permitir cualquier fecha válida
   - Advertir si fecha es >1 año en futuro

4. **Conflicto de zona horaria**:
   - Usar siempre fecha local del cliente
   - Backend almacena fecha sin hora

### C. Ejemplos de Uso

**Flujo típico del usuario**:
1. Abrir app → Redirige a `/days/today`
2. Ver día de hoy (puede estar vacío)
3. Agregar título: "Weekly Standup"
4. Crear tareas: Agregar 5 tareas del día
5. Navegar a ayer con `←` para revisar pendientes
6. Abrir Calendar view para ver progreso del mes
7. Click en día específico para ver detalle

---

## Notas de Implementación

### Prioridad Alta
- DayView es el componente más crítico (80% del uso)
- Navegación entre días debe ser <100ms (perceived performance)
- Auto-save debe ser imperceptible pero confiable

### Prioridad Media
- Calendar view es útil pero no esencial
- List view para power users

### Consideraciones de Diseño
- Mantener UI minimalista (filosofía del spec 000)
- Espaciado generoso entre elementos
- Animaciones sutiles (150-200ms)
- Mobile-first responsive

---

**Estado**: Ready para implementación
**Próximo spec**: 003 - Tasks Management
