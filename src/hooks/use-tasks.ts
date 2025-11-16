import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Task } from "@/types";

// Query keys for cache management
export const tasksKeys = {
  all: ["tasks"] as const,
  byDay: (dayId: string) => [...tasksKeys.all, "byDay", dayId] as const,
  detail: (id: string) => [...tasksKeys.all, "detail", id] as const,
};

// Fetch all tasks for a specific day
export function useTasks(dayId: string | null) {
  return useQuery({
    queryKey: dayId ? tasksKeys.byDay(dayId) : ["tasks", "empty"],
    queryFn: async () => {
      if (!dayId) return [];

      const res = await fetch(`/api/tasks?dayId=${dayId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      return (data.data as Task[]) || [];
    },
    enabled: !!dayId,
  });
}

// Create a new task
export function useCreateTask(dayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dayId,
          userId: DEMO_USER_ID,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const response = await res.json();
      return response.data as Task;
    },
    onMutate: async (newTask) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: tasksKeys.byDay(dayId) });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(
        tasksKeys.byDay(dayId)
      );

      // Optimistically update
      queryClient.setQueryData<Task[]>(tasksKeys.byDay(dayId), (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          ...newTask,
          completed: false,
          dayId,
          userId: DEMO_USER_ID,
          projectId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Task,
      ]);

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Revert on error
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksKeys.byDay(dayId), context.previousTasks);
      }
      toast.error("Error al crear tarea");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.byDay(dayId) });
    },
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      completed?: boolean;
      order?: number;
    }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const response = await res.json();
      return response.data as Task;
    },
    onMutate: async ({ id, ...updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: tasksKeys.all,
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<Task[]>(
        { queryKey: tasksKeys.all },
        (old = []) =>
          old.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert all queries
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Error al actualizar tarea");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: tasksKeys.all,
      });

      // Optimistically remove from all queries
      queryClient.setQueriesData<Task[]>(
        { queryKey: tasksKeys.all },
        (old = []) => old.filter((task) => task.id !== id)
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      // Revert all queries
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Error al eliminar tarea");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

// Toggle task completion
export function useToggleTaskComplete() {
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: async (id: string) => {
      // Find current task to get its completed state
      const allQueries = queryClient.getQueriesData<Task[]>({
        queryKey: tasksKeys.all,
      });

      let task: Task | undefined;
      for (const [, data] of allQueries) {
        if (data) {
          task = data.find((t) => t.id === id);
          if (task) break;
        }
      }

      if (!task) throw new Error("Task not found");

      return updateTask.mutateAsync({
        id,
        completed: !task.completed,
      });
    },
  });
}
