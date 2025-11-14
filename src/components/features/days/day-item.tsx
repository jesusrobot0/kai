"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useUpdateDay } from "@/hooks/use-days";
import { DayItemActions } from "./day-item-actions";
import type { Day } from "@/types";

interface DayItemProps {
  day: Day;
  isPinned?: boolean;
  onDelete: (id: string) => void;
}

export function DayItem({ day, isPinned = false, onDelete }: DayItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(day.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDayId = useSidebarStore((state) => state.selectedDayId);
  const selectDay = useSidebarStore((state) => state.selectDay);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  const updateDay = useUpdateDay();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: day.id,
    disabled: !isPinned,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedDayId === day.id;
  const displayTitle = day.title || format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing && !isCollapsed) {
      selectDay(day.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(day.title || "");
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== day.title) {
      updateDay.mutate(
        { id: day.id, title: editValue.trim() },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(day.title || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={cn(
          "group relative h-10 flex items-center justify-center cursor-pointer",
          "rounded-md transition-all duration-200",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          isSelected && "bg-zinc-200 dark:bg-zinc-700",
          isDragging && "opacity-50"
        )}
      >
        <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        "group relative h-10 flex items-center gap-2 px-3 cursor-pointer",
        "rounded-md transition-all duration-200",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        isSelected && "bg-zinc-200 dark:bg-zinc-700",
        isDragging && "opacity-50"
      )}
    >
      {isPinned && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-zinc-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm bg-white dark:bg-zinc-900",
              "border border-zinc-300 dark:border-zinc-600 rounded",
              "focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            )}
            maxLength={100}
          />
        ) : (
          <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {displayTitle}
          </p>
        )}
      </div>

      {!isEditing && (
        <DayItemActions
          dayId={day.id}
          isPinned={day.pinned}
          onEdit={handleEdit}
          onDelete={() => onDelete(day.id)}
        />
      )}
    </div>
  );
}
