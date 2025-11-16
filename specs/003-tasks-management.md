# 003 - Tasks Management

**Fecha**: 2025-11-16
**Estado**: 📋 Especificación
**Dependencias**: [002-days-management.md](./002-days-management.md)

## Resumen

Sistema de gestión de **Tasks** (tareas) dentro de cada Day mediante una interfaz inline estilo Linear/Notion. Permite crear, editar, completar, reordenar y eliminar tareas con interacciones fluidas tipo "canvas infinito" usando un task virtual como placeholder.

---

## Filosofía de Diseño

**Canvas Infinito**: Siempre hay un espacio vacío para empezar a escribir (task virtual)
**Sin fricciones**: No hay botones de "Add Task" - simplemente escribes
**Optimista**: Todas las operaciones se reflejan instantáneamente en la UI
**Teclado primero**: Todas las operaciones son posibles solo con teclado

---

## Vista de Tasks en Day View

```
┌─────────────────────────────────────────────────────────┐
│  13 de noviembre del 2025                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ☐ Implementar autenticación                            │
│  ☑ Revisar PRs del equipo                               │
│  ☐ Escribir documentación de la API                     │
│  ☐ [task virtual - placeholder]                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Layout**:
- Dentro del `<DayView>` component
- Padding: `spacing-6` horizontal, `spacing-4` vertical
- Lista plana (sin secciones ni grupos)
- Siempre hay un task virtual al final para crear nuevos

---

## Task Virtual - El Placeholder Móvil

### Concepto

El **task virtual** es un placeholder UI que:
- NO existe en la base de datos
- Funciona como un "canvas infinito" para crear tasks
- Se convierte automáticamente en task normal al escribir
- **Solo puede haber UNO a la vez** en toda la lista

### Reglas del Task Virtual

#### 1. Conversión a Task Normal

```
Estado inicial:
□ [cursor aquí - task virtual]

Usuario escribe "H":
□ H [SE CREA en DB inmediatamente, ahora es task normal]
□ [APARECE nuevo virtual al final]
```

**Comportamiento**:
- Al escribir **primer carácter** → crea task en DB con título de 1 letra
- Task virtual desaparece
- Nuevo virtual aparece al final de la lista
- Focus se mantiene en el task recién creado

#### 2. El Virtual es Móvil (se mueve con Enter)

```
Estado con tasks:
□ Tarea 1
□ Tarea 2
□ Tarea 3
□ [virtual al final]

Usuario presiona Enter al final de "Tarea 2":
□ Tarea 1
□ Tarea 2
□ [virtual SE MOVIÓ AQUÍ] ← único virtual
□ Tarea 3
```

**Comportamiento**:
- Solo hay UN virtual en todo momento
- Enter en cualquier task → el virtual se mueve debajo de ese task
- El virtual anterior desaparece

#### 3. Backspace en Virtual Vacío

```
□ Tarea normal
□ [virtual - presiono backspace]
  ↓
[Virtual desaparece, focus regresa a "Tarea normal"]
```

**Comportamiento**:
- Backspace en virtual vacío → lo elimina
- Focus regresa al task anterior
- Si no hay task anterior, aparece nuevo virtual

#### 4. Enter en Virtual Vacío

```
□ [virtual - presiono Enter sin escribir]
  ↓
[NO pasa nada - no se puede crear virtual vacío sobre otro]
```

**Comportamiento**:
- Enter en virtual vacío → **no hace nada**
- Solo se puede presionar Enter en tasks normales

---

## Task Item - Anatomía y Estados

### Estado Normal

```
┌──────────────────────────────────────────────────────┐
│  ☐ Implementar autenticación                         │
└──────────────────────────────────────────────────────┘
```

**Estructura**:
```html
<div class="task-item">
  <Checkbox />  <!-- Izquierda -->
  <input
    value="Implementar autenticación"
    class="flex-1 bg-transparent"
  />
</div>
```

**Estilos**:
- Height: `h-10` (40px)
- Padding: `px-2 py-1.5`
- Gap: `gap-2` entre checkbox e input
- Font: `text-sm`
- Border: Ninguno
- Background: `transparent`, hover `bg-muted/50`

---

### Estado Completed

```
┌──────────────────────────────────────────────────────┐
│  ☑ Revisar PRs del equipo                           │
└──────────────────────────────────────────────────────┘
```

**Estilos**:
- Checkbox: Checked (✓ icon)
- Text: `line-through opacity-60`
- Permanece en su posición (NO se mueve al final)
- Al hover: No cambia background (feedback visual de "completado")

**Transiciones**:
```css
.task-title {
  transition: opacity 150ms, text-decoration 150ms;
}
```

---

### Estado Editing (Focus)

```
┌──────────────────────────────────────────────────────┐
│  ☐ Implementar autenticación|                        │
└──────────────────────────────────────────────────────┘
```

**Estilos cuando tiene focus**:
- Border: Ninguno (seamless editing)
- Background: `bg-muted/50`
- Cursor: Text cursor visible
- Auto-select: NO (cursor al final o donde clickeaste)

---

### Estado Dragging (Reordenamiento)

```
┌──────────────────────────────────────────────────────┐
│  ☐ Tarea normal                                      │
├──────────────────────────────────────────────────────┤
│  [drop zone]                                         │
├──────────────────────────────────────────────────────┤
│  🤚 ☐ Tarea arrastrada (opacity-50)                 │
├──────────────────────────────────────────────────────┤
│  [drop zone]                                         │
├──────────────────────────────────────────────────────┤
│  ☐ Tarea normal                                      │
└──────────────────────────────────────────────────────┘
```

**Drag Handle**: Toda la fila es arrastrable
**Visual feedback**:
- Item arrastrado: `opacity-50`
- Drop zones: `border-t-2 border-primary` cuando hover
- Cursor: `cursor-grabbing`

**Restricciones**:
- Task virtual NO se puede arrastrar
- Tasks completadas SÍ se pueden arrastrar

---

## Operaciones CRUD

### Crear Task

**Flow Normal** (desde task virtual):

```
1. Usuario hace click o navega al task virtual
   □ [virtual con focus]

2. Usuario escribe "R"
   API: POST /api/tasks
   Body: {
     title: "R",
     dayId: "day-123",
     order: 0  // Al final
   }

3. UI actualiza optimistically
   □ R [task normal, guardando...]
   □ [nuevo virtual]

4. API responde con success
   □ R [task normal, id: "task-456"]
   □ [virtual]
```

**Flow desde Enter** (inserción en medio):

```
Estado inicial:
□ Tarea 1 [order: 0]
□ Tarea 2 [order: 1, cursor aquí]
□ Tarea 3 [order: 2]
□ [virtual]

Usuario presiona Enter:
□ Tarea 1 [order: 0]
□ Tarea 2 [order: 1]
□ [virtual SE MUEVE AQUÍ]
□ Tarea 3 [order: 2]

Usuario escribe "N":
API: POST /api/tasks
Body: {
  title: "N",
  dayId: "day-123",
  order: 2  // Inserción entre Tarea 2 y 3
}

API responde:
□ Tarea 1 [order: 0]
□ Tarea 2 [order: 1]
□ Nueva [order: 2]
□ Tarea 3 [order: 3] ← se recalcula
□ [virtual al final]
```

**Recálculo de `order`**:
- Tasks después del insertado: `order += 1`
- Se hace en el backend automáticamente

---

### Editar Task (Inline)

**Flow**:

```
1. Usuario edita título en el input
   onChange → actualiza estado local (optimistic)

2. Throttled save (máximo 1 request cada 200ms)
   API: PATCH /api/tasks/[id]
   Body: { title: "nuevo título" }

3. UI ya actualizada (optimistic)
   Si falla: revertir a valor anterior + toast error
```

**Throttling con lodash.throttle**:

```typescript
const throttledSave = throttle(async (id: string, title: string) => {
  await updateTask({ id, title });
}, 200, { leading: false, trailing: true });

onChange={(e) => {
  setLocalTitle(e.target.value);  // Optimistic
  throttledSave(task.id, e.target.value);
}}
```

**Características**:
- Guardado automático (no hay botón "Save")
- Max 5 requests/segundo
- Trailing edge: garantiza que último cambio se guarde
- Optimistic updates para feedback instantáneo

---

### Completar/Incompletar Task

**Flow**:

```
1. Usuario hace click en checkbox

2. UI actualiza inmediatamente (optimistic)
   ☐ Tarea → ☑ Tarea (strikethrough)

3. API call
   PATCH /api/tasks/[id]
   Body: { completed: true }

4. Si falla: revertir + toast error
```

**Comportamiento**:
- Completed tasks se quedan en su posición (NO se mueven)
- Se puede "incompletar" haciendo click de nuevo
- Animación smooth de strikethrough (150ms)

---

### Borrar Task (Backspace en Vacío)

**Flow**:

```
Estado inicial:
□ Tarea 1
□ Mi tarea [usuario borra todo el texto]
□ Tarea 3

Usuario borra todo:
□ Tarea 1
□ [vacío - presiona último backspace]
□ Tarea 3

UI actualiza (optimistic):
□ Tarea 1
□ Tarea 3 [focus aquí]

API call:
DELETE /api/tasks/[id]
```

**Reglas**:
1. Solo se puede borrar si el título está completamente vacío
2. Último backspace en input vacío → trigger delete
3. Focus regresa al task anterior
4. Si es el último task → aparece virtual
5. Virtual NO se puede borrar (backspace lo elimina solo visualmente)

---

### Reordenar Task (Drag & Drop)

**Flow con @dnd-kit**:

```
1. Usuario arrastra "Tarea 2"
   onDragStart → aplicar opacity-50

2. Usuario suelta sobre "Tarea 4"
   onDragEnd → calcular nuevo order

3. UI actualiza (optimistic)
   Reordena visualmente la lista

4. API call (recalcular orders en backend)
   PATCH /api/tasks/[id]
   Body: { order: 3 }

5. Backend responde con todos los orders actualizados
```

**Estrategia de Order**:
- Usar índice numérico incremental (0, 1, 2, 3...)
- Al reordenar: recalcular todos los orders afectados
- Backend devuelve lista completa con orders actualizados

**Librería**: @dnd-kit/core + @dnd-kit/sortable

---

## Task Virtual - Casos Edge

### Caso 1: Último Task se Borra

```
Estado:
□ Única tarea [borro todo + backspace]

Resultado:
□ [virtual aparece]
```

**Lógica**: Siempre debe haber al menos un task (virtual) visible.

---

### Caso 2: Navegación entre Días

```
Day 1:
□ Tarea A
□ Tarea B
□ [virtual]

Usuario navega a Day 2:
□ [virtual nuevo en Day 2]
```

**Comportamiento**:
- Virtual de Day 1 se limpia del estado
- Nuevo virtual aparece en Day 2
- Estado del virtual es local al día actual

---

### Caso 3: Crear Task desde Virtual + Cambiar de Día Inmediatamente

```
1. Usuario escribe "H" en virtual
2. Task se crea (POST /api/tasks)
3. Usuario cambia de día ANTES de que API responda

Solución: Request se cancela (AbortController)
El task queda huérfano en Day anterior
```

**Estrategia**:
- Usar AbortController en fetch
- Cleanup en useEffect cuando cambia dayId
- Si request falla: no revertir (task ya creado en backend)

---

### Caso 4: Task Virtual en Lista Vacía

```
Day nuevo sin tasks:
□ [virtual al inicio]
```

**Comportamiento**: Virtual siempre está presente, incluso si no hay tasks.

---

## Keyboard Shortcuts

### En Task Normal

| Tecla | Acción |
|-------|--------|
| `Enter` | Mover virtual debajo del task actual |
| `Backspace` (en input vacío) | Borrar task |
| `Escape` | Blur input (perder focus) |
| `Cmd/Ctrl + Enter` | Toggle completed |
| `Cmd/Ctrl + ↑` | Mover task arriba (reordenar) |
| `Cmd/Ctrl + ↓` | Mover task abajo (reordenar) |
| `Tab` | Focus en siguiente task |
| `Shift + Tab` | Focus en task anterior |

### En Task Virtual

| Tecla | Acción |
|-------|--------|
| `Cualquier letra` | Crear task normal |
| `Enter` | No hace nada |
| `Backspace` | Eliminar virtual, focus a anterior |
| `Escape` | Blur (si hay tasks normales) |

---

## Componentes UI

### Estructura de Archivos

```
src/components/features/tasks/
├── task-list.tsx              # Contenedor de lista
├── task-item.tsx              # Item normal
├── task-virtual.tsx           # Placeholder virtual
├── task-checkbox.tsx          # Checkbox custom
├── task-input.tsx             # Input con throttling
└── hooks/
    ├── use-tasks.ts           # CRUD hooks (TanStack Query)
    ├── use-task-reorder.ts    # Drag & drop logic
    └── use-task-virtual.ts    # Virtual task state
```

---

### TaskList Component

```typescript
// src/components/features/tasks/task-list.tsx
interface TaskListProps {
  dayId: string;
}

export function TaskList({ dayId }: TaskListProps) {
  const { data: tasks = [], isLoading } = useTasks(dayId);
  const { virtualIndex, moveVirtual, handleCreate } = useTaskVirtual(dayId);
  const { sensors, handleDragEnd } = useTaskReorder(tasks);

  if (isLoading) return <TaskListSkeleton />;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5 py-4 px-6">
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <TaskItem task={task} />
              {virtualIndex === index + 1 && (
                <TaskVirtual onCreateTask={handleCreate} />
              )}
            </React.Fragment>
          ))}

          {virtualIndex === tasks.length && (
            <TaskVirtual onCreateTask={handleCreate} />
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

---

### TaskItem Component

```typescript
// src/components/features/tasks/task-item.tsx
interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [localTitle, setLocalTitle] = useState(task.title);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const throttledSave = useMemo(
    () => throttle((title: string) => {
      updateTask.mutate({ id: task.id, title });
    }, 200, { leading: false, trailing: true }),
    [task.id]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    throttledSave(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && localTitle === '') {
      e.preventDefault();
      deleteTask.mutate(task.id);
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleComplete.mutate(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center gap-2 h-10 px-2 py-1.5",
        "rounded-md transition-colors",
        "hover:bg-muted/50",
        task.completed && "opacity-60"
      )}
    >
      <TaskCheckbox
        checked={task.completed}
        onCheckedChange={() => toggleComplete.mutate(task.id)}
      />

      <input
        type="text"
        value={localTitle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 bg-transparent border-none outline-none",
          "text-sm text-foreground",
          "placeholder:text-muted-foreground",
          task.completed && "line-through"
        )}
        placeholder="Task title..."
      />
    </div>
  );
}
```

---

### TaskVirtual Component

```typescript
// src/components/features/tasks/task-virtual.tsx
interface TaskVirtualProps {
  onCreateTask: (title: string) => void;
}

export function TaskVirtual({ onCreateTask }: TaskVirtualProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Al escribir primer carácter → crear task
    if (newValue.length === 1 && value.length === 0) {
      onCreateTask(newValue);
      setValue('');  // Reset para próximo virtual
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && value === '') {
      // Eliminar virtual (solo visualmente, el padre maneja el state)
      e.preventDefault();
      // Mover focus al anterior task
      const prevInput = findPreviousInput(inputRef.current);
      prevInput?.focus();
    }

    if (e.key === 'Enter' && value === '') {
      // No hacer nada
      e.preventDefault();
    }
  };

  return (
    <div className="group flex items-center gap-2 h-10 px-2 py-1.5 rounded-md">
      <TaskCheckbox checked={false} disabled />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        placeholder="Add a task..."
      />
    </div>
  );
}
```

---

## Hooks y State Management

### use-tasks.ts

```typescript
// src/hooks/use-tasks.ts
export const tasksKeys = {
  all: ['tasks'] as const,
  byDay: (dayId: string) => [...tasksKeys.all, dayId] as const,
  detail: (id: string) => [...tasksKeys.all, 'detail', id] as const,
};

export function useTasks(dayId: string) {
  return useQuery({
    queryKey: tasksKeys.byDay(dayId),
    queryFn: async () => {
      const res = await fetch(`/api/tasks?dayId=${dayId}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      return data.data as Task[];
    },
    enabled: !!dayId,
  });
}

export function useCreateTask(dayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dayId,
          userId: DEMO_USER_ID  // TODO: Get from auth
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: tasksKeys.byDay(dayId) });

      const previousTasks = queryClient.getQueryData<Task[]>(tasksKeys.byDay(dayId));

      queryClient.setQueryData<Task[]>(tasksKeys.byDay(dayId), (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          ...newTask,
          completed: false,
          dayId,
          userId: DEMO_USER_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Task,
      ]);

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Revert on error
      queryClient.setQueryData(tasksKeys.byDay(dayId), context?.previousTasks);
      toast.error('Error al crear tarea');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.byDay(dayId) });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; completed?: boolean; order?: number }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onMutate: async ({ id, ...updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      const previousData = queryClient.getQueryData(tasksKeys.all);

      // Update in all relevant queries
      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeys.all }, (old = []) =>
        old.map(task => task.id === id ? { ...task, ...updates } : task)
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(tasksKeys.all, context?.previousData);
      toast.error('Error al actualizar tarea');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      const previousData = queryClient.getQueryData(tasksKeys.all);

      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeys.all }, (old = []) =>
        old.filter(task => task.id !== id)
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(tasksKeys.all, context?.previousData);
      toast.error('Error al eliminar tarea');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useToggleTaskComplete() {
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: async (id: string) => {
      const tasks = queryClient.getQueryData<Task[]>(tasksKeys.all) || [];
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');

      return updateTask.mutateAsync({
        id,
        completed: !task.completed
      });
    },
  });
}
```

---

### use-task-virtual.ts

```typescript
// src/hooks/use-task-virtual.ts
export function useTaskVirtual(dayId: string) {
  const [virtualIndex, setVirtualIndex] = useState<number>(0);
  const createTask = useCreateTask(dayId);
  const { data: tasks = [] } = useTasks(dayId);

  // Mover virtual al final cuando tasks cambian
  useEffect(() => {
    setVirtualIndex(tasks.length);
  }, [tasks.length]);

  const moveVirtual = useCallback((index: number) => {
    setVirtualIndex(index);
  }, []);

  const handleCreate = useCallback(async (title: string) => {
    const order = virtualIndex;

    await createTask.mutateAsync({ title, order });

    // Mover virtual al final después de crear
    setVirtualIndex(tasks.length + 1);
  }, [virtualIndex, tasks.length, createTask]);

  return {
    virtualIndex,
    moveVirtual,
    handleCreate,
  };
}
```

---

### use-task-reorder.ts

```typescript
// src/hooks/use-task-reorder.ts
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function useTaskReorder(tasks: Task[]) {
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(tasksKeys.byDay(tasks[0].dayId), reorderedTasks);

    // Recalcular orders
    const updates = reorderedTasks.map((task, index) => ({
      id: task.id,
      order: index,
    }));

    // Batch update orders
    try {
      await Promise.all(
        updates.map(({ id, order }) =>
          updateTask.mutateAsync({ id, order })
        )
      );
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(tasksKeys.byDay(tasks[0].dayId), tasks);
      toast.error('Error al reordenar tareas');
    }
  };

  return { sensors, handleDragEnd };
}
```

---

## API Endpoints

### Existentes (Ya Implementados)

```
✅ POST   /api/tasks            - Crear task
✅ GET    /api/tasks/[id]       - Obtener task
✅ PATCH  /api/tasks/[id]       - Actualizar task
✅ DELETE /api/tasks/[id]       - Eliminar task
```

### GET /api/tasks (Con filtro por día)

**Agregar query param**:

```typescript
// src/app/api/tasks/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dayId = searchParams.get('dayId');

  if (!dayId) {
    return NextResponse.json({ error: 'dayId required' }, { status: 400 });
  }

  const tasks = await TaskService.getTasksByDayId(dayId);

  return NextResponse.json({ success: true, data: tasks });
}
```

**Ya implementado en TaskService.ts** ✅

---

## Animaciones

### Fade In (Crear Task)

```typescript
// Usando Framer Motion
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
>
  <TaskItem task={task} />
</motion.div>
```

---

### Fade Out (Borrar Task)

```typescript
<motion.div
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
  <TaskItem task={task} />
</motion.div>
```

---

### Checkbox Animation

```typescript
// TaskCheckbox.tsx
<Checkbox
  className={cn(
    "transition-all duration-150",
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
  )}
/>
```

---

### Strikethrough Transition

```css
.task-title {
  transition: text-decoration 150ms ease-out, opacity 150ms ease-out;
}

.task-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}
```

---

### Drag & Drop (con @dnd-kit)

```typescript
// Automático con @dnd-kit
const style = {
  transform: CSS.Transform.toString(transform),
  transition,
};

// Aplicar al item arrastrado
<div style={style} {...attributes} {...listeners}>
```

**Visual feedback**:
- Item arrastrado: `opacity-50`
- Drop indicator: `border-t-2 border-primary`

---

## Casos Edge y Validaciones

### 1. Título Vacío

**Regla**: Se puede crear task con título de 1 letra
**Razón**: Virtual se convierte inmediatamente al escribir

```
Usuario escribe "A":
□ A [task normal creado]
□ [virtual]
```

---

### 2. Máximo de Caracteres

**Límite**: 500 caracteres (validado en backend)

```typescript
<input
  maxLength={500}
  value={localTitle}
  onChange={handleChange}
/>
```

---

### 3. Reordenar Task Completada

**Permitido**: Sí, tasks completadas se pueden reordenar

```
□ Tarea 1
☑ Tarea completada [se puede arrastrar]
□ Tarea 3
```

---

### 4. Completar Task Vacía

**Permitido**: Sí, se puede completar task con cualquier título

```
□  [vacío]
  ↓ click checkbox
☑  [vacío, completado]
```

---

### 5. Eliminar Único Task

```
□ Única tarea [borra todo + backspace]
  ↓
□ [virtual aparece]
```

**Garantía**: Siempre hay al menos un task (virtual) visible.

---

### 6. Navegación Rápida entre Días

**Problema**: Crear task → cambiar día antes de guardar

**Solución**:
```typescript
useEffect(() => {
  return () => {
    // Cleanup: cancelar requests pendientes
    abortController.abort();
  };
}, [dayId]);
```

---

### 7. Error de Red durante Guardado

**Comportamiento**:
1. UI ya actualizada (optimistic)
2. Request falla
3. Revertir cambios + mostrar toast error
4. Usuario puede reintentar

---

## Performance

### Optimizaciones

1. **Throttling de guardado**: 200ms
   - Evita sobrecarga de requests
   - Garantiza que último cambio se guarde

2. **Optimistic Updates**: Todas las operaciones
   - UI responde instantáneo
   - No espera respuesta del servidor

3. **Memoización**: TaskItem con React.memo
   ```typescript
   export const TaskItem = React.memo(TaskItemComponent);
   ```

4. **Virtualización**: Si > 50 tasks
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual';
   ```

5. **Debounce de filtrado**: Si se agrega búsqueda
   ```typescript
   const debouncedSearch = useDebouncedValue(searchQuery, 300);
   ```

---

## Librerías Necesarias

```bash
# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Throttle/Debounce
npm install lodash.throttle
npm install -D @types/lodash.throttle

# Ya instaladas:
# - framer-motion (animaciones)
# - @tanstack/react-query (state management)
# - date-fns (fechas)
# - sonner (toasts)
```

---

## Testing

### Unit Tests

```typescript
// __tests__/use-task-virtual.test.ts
describe('useTaskVirtual', () => {
  it('moves virtual to end when task is created', () => {});
  it('allows only one virtual at a time', () => {});
  it('converts virtual to normal on first character', () => {});
});
```

### Integration Tests

```typescript
// __tests__/task-list.test.tsx
describe('TaskList', () => {
  it('renders virtual task placeholder', () => {});
  it('creates task when typing in virtual', () => {});
  it('deletes task with backspace on empty input', () => {});
  it('reorders tasks with drag and drop', () => {});
  it('completes task with checkbox click', () => {});
});
```

### E2E Tests (Playwright)

```typescript
// e2e/tasks.spec.ts
test('task lifecycle', async ({ page }) => {
  // Navigate to day
  await page.goto('/?day=day-123');

  // Create task
  await page.locator('[placeholder="Add a task..."]').fill('My task');
  await expect(page.locator('text=My task')).toBeVisible();

  // Complete task
  await page.locator('input[type="checkbox"]').first().click();
  await expect(page.locator('text=My task')).toHaveCSS('text-decoration', 'line-through');

  // Delete task
  await page.locator('text=My task').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(page.locator('text=My task')).not.toBeVisible();
});
```

---

## Accesibilidad

### Keyboard Navigation

✅ **Ya especificado** en sección "Keyboard Shortcuts"

### ARIA Labels

```typescript
<div
  role="list"
  aria-label="Tasks for today"
>
  {tasks.map(task => (
    <div
      key={task.id}
      role="listitem"
      aria-label={`Task: ${task.title}`}
    >
      <Checkbox
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      />
      <input aria-label="Task title" />
    </div>
  ))}
</div>
```

### Screen Reader Announcements

```typescript
// Anunciar cuando task se completa
useEffect(() => {
  if (task.completed) {
    announceToScreenReader('Task completed');
  }
}, [task.completed]);
```

---

## Integración con DayView

### Modificar day-view.tsx

```typescript
// src/components/features/days/day-view.tsx
export function DayView({ dayId }: DayViewProps) {
  const { data: day, isLoading } = useDay(dayId);

  if (!dayId || !day) {
    return <EmptyDayView />;
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="py-8 px-6 border-b border-border">
        <h1 className="text-3xl font-semibold text-foreground">
          {displayTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(day.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Task List */}
      <TaskList dayId={dayId} />
    </div>
  );
}
```

---

## Próximos Pasos

1. ✅ **Spec completado**
2. 🔨 Implementar hooks (use-tasks.ts, use-task-virtual.ts, use-task-reorder.ts)
3. 🎨 Crear componentes UI (TaskList, TaskItem, TaskVirtual, TaskCheckbox)
4. 🔌 Integrar con DayView
5. 🧪 Testing (unit + integration + e2e)
6. 📝 Continuar con [004-projects.md](./004-projects.md) (opcional)

---

## Referencias

- [002-days-management.md](./002-days-management.md) - Gestión de días
- [000-design-foundation.md](./000-design-foundation.md) - Sistema de diseño
- [Prisma Schema](../prisma/schema.prisma) - Modelo Task
- [Linear](https://linear.app) - Inspiración de UX
- [@dnd-kit](https://dndkit.com/) - Drag & drop library
- [TanStack Query](https://tanstack.com/query) - Server state management
