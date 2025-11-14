# 001 - Setup Inicial del Proyecto

**Fecha**: 2025-11-13
**Estado**: ✅ Completado

## Resumen

Setup completo de **Kai**, una aplicación de bitácora de desarrollo con tracking de tiempo, proyectos y categorías.

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | TailwindCSS v4 + shadcn/ui |
| Base de datos | PostgreSQL (Neon Tech) |
| ORM | Prisma |
| Estado | TanStack Query + Zustand |
| Validación | Zod |
| Auth | Clerk (pendiente) |

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/                 # Endpoints REST
│   │   ├── days/route.ts
│   │   └── tasks/[route.ts, [id]/route.ts]
│   ├── layout.tsx           # QueryProvider integrado
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui
│   └── features/            # Componentes por feature
├── lib/
│   ├── db.ts               # Singleton de Prisma
│   ├── query-provider.tsx
│   └── utils.ts
├── services/               # Lógica de negocio (funciones)
│   ├── day.service.ts
│   ├── task.service.ts
│   ├── project.service.ts
│   ├── category.service.ts
│   ├── time-entry.service.ts
│   └── annotation.service.ts
├── hooks/                  # Custom React hooks
├── stores/
│   └── ui-store.ts        # Zustand store de ejemplo
├── types/
│   └── index.ts           # Tipos TypeScript
└── validators/
    └── index.ts           # Schemas Zod
```

## Schema de Base de Datos

### Entidades Principales

1. **User** - Usuarios del sistema
2. **Day** - Entradas diarias de la bitácora
   - `date` (unique), `title?`, relación con Tasks
3. **Task** - Tareas dentro de un día
   - `title`, `completed`, `order`
   - Relaciones: Day, Project, Categories, TimeEntries, Annotations
4. **Project** - Proyectos (@project)
   - `name` (unique por user), `color`
5. **Category** - Categorías (#category)
   - `name` (unique por user), `color`
6. **TimeEntry** - Registro de tiempo
   - `startTime`, `endTime?`, `duration?`
7. **Annotation** - Notas de tareas
   - `content`, relación con Task

### Relaciones Clave

- Day → Tasks (1:N)
- Task → Project (N:1, opcional)
- Task ↔ Categories (N:N via TaskCategory)
- Task → TimeEntries (1:N)
- Task → Annotations (1:N)

## Configuración Completada

### ✅ Instalación y Setup
- Next.js 16 inicializado con TypeScript
- TailwindCSS configurado
- shadcn/ui con componentes base (Button, Input, Separator, Select)
- Prisma instalado y schema creado
- TanStack Query + DevTools
- Zustand para UI state

### ✅ Archivos de Configuración
- `.env.example` - Template de variables de entorno
- `.env.local` - Variables locales (gitignored, valores placeholder)
- `tsconfig.json` - Path aliases (@/*)
- `prisma.config.ts` - Soporte dotenv
- `README.md` - Instrucciones completas

### ✅ API Routes (Implementación Base)
- `GET/POST /api/days`
- `POST /api/tasks`
- `GET/PATCH/DELETE /api/tasks/[id]`
- Validación con Zod en todos los endpoints
- Manejo de errores estructurado
- Soporte de Next.js 16 (params async)

### ✅ Services Layer
Funciones genéricas CRUD para todas las entidades. Listas para extender con lógica específica cuando se definan los specs de features.

### ✅ Validadores Zod
Schemas completos para crear, actualizar y validar todas las entidades.

### ✅ TypeScript Types
Tipos inferidos desde Prisma con utilidades para queries con relaciones.

## Próximos Pasos

### 1. Configurar Base de Datos
```bash
# 1. Crear proyecto en https://console.neon.tech/
# 2. Actualizar .env.local con credenciales reales
# 3. Ejecutar migraciones
npx prisma migrate dev --name init
```

### 2. Iniciar Desarrollo
```bash
npm run dev  # http://localhost:3000
```

### 3. Definir Specs de Features
- 002 - Gestión de Days
- 003 - Gestión de Tasks
- 004 - Projects & Categories
- 005 - Time Tracking
- 006 - Annotations
- 007 - Autenticación (Clerk)

## Notas Importantes

### Next.js 16
- **Breaking change**: `params` ahora es Promise (ya implementado)
- React Compiler disponible (no habilitado)

### Componentes shadcn/ui
Agregar más componentes según necesidad:
```bash
npx shadcn@latest add [component-name]
```

### Build Status
✅ Compilación exitosa sin errores TypeScript

## Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm start                # Servidor de producción
npm run lint             # ESLint
npx prisma studio        # GUI de base de datos
npx prisma migrate dev   # Crear migraciones
npx prisma generate      # Generar Prisma Client
```

---

**Status**: Infraestructura completa y lista para desarrollo de features
