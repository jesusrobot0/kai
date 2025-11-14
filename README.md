# Kai - Development Journal

Kai is a development journal application for creative people. It allows you to create daily entries ("days") with tasks that can be organized by projects (@project) and categories (#category), with built-in time tracking capabilities.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL (Neon Tech)
- **ORM**: Prisma
- **State Management**: TanStack Query + Zustand
- **Validation**: Zod
- **Authentication**: Clerk (to be implemented)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API endpoints
│   └── ...                # Pages and layouts
├── components/
│   ├── ui/                # shadcn/ui components
│   └── features/          # Feature-specific components
├── lib/                   # Utilities and DB client
├── services/              # Business logic layer
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── stores/                # Zustand stores
└── validators/            # Zod validation schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon Tech recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with your Neon Tech database credentials:
```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech:5432/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.region.neon.tech:5432/dbname?sslmode=require"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Generate Prisma client:
```bash
npx prisma generate
```

7. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

The application uses the following main entities:

- **User**: User accounts
- **Day**: Daily journal entries
- **Task**: Individual tasks within a day
- **Project**: Projects that can be tagged with @project
- **Category**: Categories that can be tagged with #category
- **TimeEntry**: Time tracking records for tasks
- **Annotation**: Notes/messages related to tasks

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma client

## Development Workflow

1. Create feature specifications
2. Implement database schema changes (if needed)
3. Update services and validators
4. Create API routes
5. Build UI components
6. Test and iterate

## Next Steps

- [ ] Implement Clerk authentication
- [ ] Define feature specifications for each entity
- [ ] Build UI components for Days, Tasks, Projects, and Categories
- [ ] Implement time tracking functionality
- [ ] Add data visualization and reports

## Contributing

This project is currently in initial setup phase. Feature specifications will be defined before active development begins.

## License

[Your License Here]
