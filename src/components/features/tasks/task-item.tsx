"use client";

import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import throttle from "lodash.throttle";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUpdateTask, useDeleteTask, useToggleTaskComplete } from "@/hooks/use-tasks";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onEnterPress?: () => void;
}

export function TaskItem({ task, onEnterPress }: TaskItemProps) {
  const [localTitle, setLocalTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs to track task state and user interaction
  const prevTaskIdRef = useRef(task.id);
  const userIsTypingRef = useRef(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();

  // Detect newly created tasks from optimistic update (temp ID)
  const isNewTask = task.id.startsWith("temp-");

  // Drag & drop setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Throttled save - using useRef to prevent re-creation on every render
  const throttledSaveRef = useRef<
    | (((id: string, title: string) => void) & {
        flush: () => void;
        cancel: () => void;
      })
    | undefined
  >(undefined);

  // Initialize throttle only once
  if (!throttledSaveRef.current) {
    throttledSaveRef.current = throttle(
      (id: string, title: string) => {
        updateTask.mutate({ id, title });
      },
      1000, // 1 second throttle - reduces requests significantly
      { leading: false, trailing: true }
    );
  }

  // Cleanup: flush pending throttled calls when component unmounts
  useEffect(() => {
    return () => {
      throttledSaveRef.current?.flush();
    };
  }, []);

  // Intelligent sync: Only update localTitle from task.title when it's safe
  useEffect(() => {
    const wasTemp = prevTaskIdRef.current.startsWith("temp-");
    const isReal = !task.id.startsWith("temp-");
    const idJustChangedToReal = wasTemp && isReal && prevTaskIdRef.current !== task.id;

    if (idJustChangedToReal) {
      // Task just got confirmed by backend (temp → real ID)
      // DON'T overwrite localTitle - user may still be typing
      // The clientId keeps the component mounted, preserving state
      prevTaskIdRef.current = task.id;
      return;
    }

    // Sync task.title → localTitle only when safe:
    // - User is NOT actively typing
    // - Input does NOT have focus
    // - Values are actually different (avoid unnecessary updates)
    if (
      task.title !== localTitle &&
      !userIsTypingRef.current &&
      document.activeElement !== inputRef.current
    ) {
      setLocalTitle(task.title);
    }

    prevTaskIdRef.current = task.id;
  }, [task.id, task.title, localTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    userIsTypingRef.current = true; // Mark that user is actively typing
    setLocalTitle(newTitle);
    throttledSaveRef.current?.(task.id, newTitle);
  };

  const handleBlur = () => {
    // Flush throttle and save immediately when losing focus
    throttledSaveRef.current?.flush();
    if (localTitle !== task.title) {
      updateTask.mutate({ id: task.id, title: localTitle });
    }
    userIsTypingRef.current = false; // User finished typing
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Backspace en input vacío → borrar task
    if (e.key === "Backspace" && localTitle === "") {
      e.preventDefault();
      deleteTask.mutate(task.id);

      // Move focus to previous input
      const prevElement = inputRef.current?.parentElement?.previousElementSibling;
      if (prevElement) {
        const prevInput = prevElement.querySelector("input");
        prevInput?.focus();
      }
      return;
    }

    // Enter → crear nuevo task debajo
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnterPress?.();
      return;
    }

    // Cmd/Ctrl + Enter → toggle completed
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleComplete.mutate(task.id);
      return;
    }

    // Escape → blur input
    if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.blur();
      return;
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    toggleComplete.mutate(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center gap-2 h-10 px-2 py-1.5",
        "rounded-md transition-colors cursor-grab",
        "hover:bg-muted/50",
        isDragging && "opacity-50 cursor-grabbing",
        task.completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleCheckboxChange}
        className="flex-shrink-0"
      />

      <input
        ref={inputRef}
        type="text"
        value={localTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus={isNewTask}
        maxLength={500}
        className={cn(
          "flex-1 bg-transparent border-none outline-none",
          "text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus:outline-none cursor-text",
          task.completed && "line-through"
        )}
        placeholder="Task title..."
      />
    </div>
  );
}
