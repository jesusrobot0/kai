import { useState, useEffect, useCallback } from "react";
import { useTasks, useCreateTask } from "./use-tasks";
import type { Task } from "@/types";

// Spacing constant for initial order values
const ORDER_SPACING = 1000;

/**
 * Calculate order value for inserting a task at a specific position
 * Uses fractional ordering to avoid updating other tasks
 */
function calculateOrderBetweenTasks(tasks: Task[], index: number): number {
  // Empty list - start at ORDER_SPACING
  if (tasks.length === 0) {
    return ORDER_SPACING;
  }

  // Insert at the beginning - subtract spacing from first task
  if (index === 0) {
    return tasks[0].order - ORDER_SPACING;
  }

  // Insert at the end - add spacing to last task
  if (index >= tasks.length) {
    return tasks[tasks.length - 1].order + ORDER_SPACING;
  }

  // Insert in the middle - calculate midpoint between neighbors
  const before = tasks[index - 1].order;
  const after = tasks[index].order;

  // Use precise midpoint (allows decimals for tight spaces)
  const midpoint = (before + after) / 2;

  return midpoint;
}

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

      // Calculate fractional order based on position
      const order = calculateOrderBetweenTasks(tasks, virtualIndex);

      try {
        await createTask.mutateAsync({ title, order });
        // Virtual will auto-move to end via useEffect when tasks update
      } catch (error) {
        // Error already handled in mutation
        console.error("Failed to create task:", error);
      }
    },
    [dayId, virtualIndex, tasks, createTask]
  );

  return {
    virtualIndex,
    moveVirtual,
    handleCreate,
    isCreating: createTask.isPending,
  };
}
