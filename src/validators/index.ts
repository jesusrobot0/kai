import { z } from "zod";

// User validators
export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

// Day validators
export const daySchema = z.object({
  id: z.string().cuid(),
  date: z.date(),
  title: z.string().nullable(),
  userId: z.string().cuid(),
  pinned: z.boolean(),
  pinnedAt: z.date().nullable(),
  pinnedOrder: z.number().int().nullable(),
});

export const createDaySchema = z.object({
  date: z.coerce.date(),
  title: z.string().optional(),
  userId: z.string().cuid(),
});

export const updateDaySchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title too long").optional(),
});

export const pinDaySchema = z.object({
  pinned: z.boolean(),
});

export const reorderPinnedDaySchema = z.object({
  pinnedOrder: z.number().int().min(0),
});

// Task validators
export const taskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, "Title is required"),
  completed: z.boolean(),
  order: z.number().int().min(0),
  dayId: z.string().cuid(),
  projectId: z.string().cuid().nullable(),
  userId: z.string().cuid(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dayId: z.string().cuid(),
  projectId: z.string().cuid().optional(),
  userId: z.string().cuid(),
  order: z.number().int().min(0).default(0),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  projectId: z.string().cuid().nullable().optional(),
});

// Project validators
export const projectSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  userId: z.string().cuid(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#6366f1"),
  userId: z.string().cuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

// Category validators
export const categorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  userId: z.string().cuid(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#8b5cf6"),
  userId: z.string().cuid(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

// TimeEntry validators
export const timeEntrySchema = z.object({
  id: z.string().cuid(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  duration: z.number().int().min(0).nullable(),
  taskId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const createTimeEntrySchema = z.object({
  startTime: z.coerce.date(),
  taskId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const updateTimeEntrySchema = z.object({
  endTime: z.coerce.date(),
  duration: z.number().int().min(0),
});

// Annotation validators
export const annotationSchema = z.object({
  id: z.string().cuid(),
  content: z.string().min(1, "Content is required"),
  taskId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const createAnnotationSchema = z.object({
  content: z.string().min(1, "Content is required"),
  taskId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const updateAnnotationSchema = z.object({
  content: z.string().min(1, "Content is required"),
});
