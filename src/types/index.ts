import { Prisma } from "@prisma/client";

// User types
export type User = Prisma.UserGetPayload<object>;

// Day types
export type Day = Prisma.DayGetPayload<object>;
export type DayWithTasks = Prisma.DayGetPayload<{
  include: {
    tasks: {
      include: {
        project: true;
        categories: { include: { category: true } };
        timeEntries: true;
      };
    };
  };
}>;

// Task types
export type Task = Prisma.TaskGetPayload<object> & {
  clientId?: string; // Client-side only, for stable React keys
};
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: true;
    categories: { include: { category: true } };
    timeEntries: true;
    annotations: true;
  };
}>;

// Project types
export type Project = Prisma.ProjectGetPayload<object>;

// Category types
export type Category = Prisma.CategoryGetPayload<object>;

// TimeEntry types
export type TimeEntry = Prisma.TimeEntryGetPayload<object>;
export type TimeEntryWithTask = Prisma.TimeEntryGetPayload<{
  include: { task: true };
}>;

// Annotation types
export type Annotation = Prisma.AnnotationGetPayload<object>;

// API Response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// Pagination types
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
};
