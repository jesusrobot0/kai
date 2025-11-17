import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdateTask, tasksKeys } from "./use-tasks";
import type { Task } from "@/types";
import type { DragEndEvent } from "@dnd-kit/core";

// Spacing constant for fractional ordering
const ORDER_SPACING = 1000;

/**
 * Calculate new order value for a moved task based on its neighbors
 * Uses fractional ordering to avoid updating all tasks
 */
function calculateNewOrder(reorderedTasks: Task[], movedTaskIndex: number): number {
  const taskCount = reorderedTasks.length;

  // Only task in the list
  if (taskCount === 1) {
    return ORDER_SPACING;
  }

  // Moved to beginning
  if (movedTaskIndex === 0) {
    return reorderedTasks[1].order - ORDER_SPACING;
  }

  // Moved to end
  if (movedTaskIndex === taskCount - 1) {
    return reorderedTasks[taskCount - 2].order + ORDER_SPACING;
  }

  // Moved to middle - calculate midpoint between neighbors
  const before = reorderedTasks[movedTaskIndex - 1].order;
  const after = reorderedTasks[movedTaskIndex + 1].order;

  // Use precise midpoint (allows decimals for tight spaces)
  const midpoint = (before + after) / 2;

  return midpoint;
}

export function useTaskReorder(tasks: Task[], dayId: string) {
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();

  // Configure sensors for drag & drop
  // Note: KeyboardSensor removed to prevent conflicts with input fields (Space key)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder array
    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
    const movedTask = reorderedTasks[newIndex];

    // Calculate new order for the moved task using fractional ordering
    const newOrder = calculateNewOrder(reorderedTasks, newIndex);

    // Update the moved task's order in the reordered array
    const updatedTasks = reorderedTasks.map((task, index) =>
      index === newIndex ? { ...task, order: newOrder } : task
    );

    // Optimistically update UI
    queryClient.setQueryData<Task[]>(tasksKeys.byDay(dayId), updatedTasks);

    // Update only the moved task (1 HTTP request instead of N)
    try {
      await updateTask.mutateAsync({ id: movedTask.id, order: newOrder });
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(tasksKeys.byDay(dayId), tasks);
      toast.error("Error al reordenar tareas");
    }
  };

  return { sensors, handleDragEnd };
}
