"use client";

import React, { Fragment } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskVirtual } from "@/hooks/use-task-virtual";
import { useTaskReorder } from "@/hooks/use-task-reorder";
import { TaskItem } from "./task-item";
import { TaskVirtual } from "./task-virtual";

interface TaskListProps {
  dayId: string | null;
}

export function TaskList({ dayId }: TaskListProps) {
  const { data: tasks = [], isLoading } = useTasks(dayId);
  const { virtualIndex, moveVirtual, handleCreate } = useTaskVirtual(dayId);
  const { sensors, handleDragEnd } = useTaskReorder(tasks, dayId || "");

  if (!dayId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2 py-4 px-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 bg-muted/50 rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  const handleEnterPress = (index: number) => {
    // Mover virtual debajo del task actual
    moveVirtual(index + 1);

    // Focus en el virtual después de un pequeño delay
    setTimeout(() => {
      const virtualInput = document.querySelector(
        '[placeholder="Add a task..."]'
      ) as HTMLInputElement;
      virtualInput?.focus();
    }, 100);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5 py-4 px-6">
          {tasks.length === 0 && virtualIndex === 0 ? (
            // Empty state with virtual at start
            <TaskVirtual onCreateTask={handleCreate} />
          ) : (
            // Render tasks with virtual inserted at virtualIndex
            <>
              {tasks.map((task, index) => (
                <Fragment key={task.clientId || task.id}>
                  {virtualIndex === index && (
                    <TaskVirtual
                      onCreateTask={handleCreate}
                      onRemove={() => moveVirtual(tasks.length)}
                    />
                  )}
                  <TaskItem
                    task={task}
                    onEnterPress={() => handleEnterPress(index)}
                  />
                </Fragment>
              ))}

              {/* Virtual at end */}
              {virtualIndex >= tasks.length && (
                <TaskVirtual
                  onCreateTask={handleCreate}
                  onRemove={() => {
                    if (tasks.length > 0) {
                      // Move focus to last task
                      const lastInput = document.querySelectorAll(
                        'input[type="text"]'
                      );
                      const lastTaskInput = lastInput[
                        lastInput.length - 2
                      ] as HTMLInputElement;
                      lastTaskInput?.focus();
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
