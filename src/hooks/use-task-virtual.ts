import { useState, useEffect, useCallback } from "react";
import { useTasks, useCreateTask } from "./use-tasks";

export function useTaskVirtual(dayId: string | null) {
  const [virtualIndex, setVirtualIndex] = useState<number>(0);
  const { data: tasks = [] } = useTasks(dayId);
  const createTask = useCreateTask(dayId || "");

  // Move virtual to end when tasks change
  useEffect(() => {
    setVirtualIndex(tasks.length);
  }, [tasks.length]);

  // Move virtual to specific index
  const moveVirtual = useCallback((index: number) => {
    setVirtualIndex(index);
  }, []);

  // Create task from virtual
  const handleCreate = useCallback(
    async (title: string) => {
      if (!dayId) return;

      const order = virtualIndex;

      try {
        await createTask.mutateAsync({ title, order });
        // Virtual will auto-move to end via useEffect when tasks update
      } catch (error) {
        // Error already handled in mutation
        console.error("Failed to create task:", error);
      }
    },
    [dayId, virtualIndex, createTask]
  );

  return {
    virtualIndex,
    moveVirtual,
    handleCreate,
    isCreating: createTask.isPending,
  };
}
