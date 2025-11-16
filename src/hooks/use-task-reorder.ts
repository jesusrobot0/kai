import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdateTask, tasksKeys } from "./use-tasks";
import type { Task } from "@/types";
import type { DragEndEvent } from "@dnd-kit/core";

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

    // Optimistically update UI
    queryClient.setQueryData<Task[]>(
      tasksKeys.byDay(dayId),
      reorderedTasks
    );

    // Batch update orders in parallel
    try {
      await Promise.all(
        reorderedTasks.map((task, index) =>
          updateTask.mutateAsync({ id: task.id, order: index })
        )
      );
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(tasksKeys.byDay(dayId), tasks);
      toast.error("Error al reordenar tareas");
    }
  };

  return { sensors, handleDragEnd };
}
