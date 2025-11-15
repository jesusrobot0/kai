"use client";

import { useState, useRef, useEffect } from "react";
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
        onClick={handleClick}
        className={cn(
          "group relative h-10 flex items-center justify-center cursor-pointer",
          "rounded-md transition-all duration-200",
          "hover:bg-accent",
          isSelected && "bg-accent border-l-2 border-primary"
        )}
      >
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          isSelected ? "bg-primary" : "bg-muted-foreground"
        )} />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative h-10 flex items-center gap-2 px-3 cursor-pointer",
        "rounded-md transition-all duration-200",
        "hover:bg-accent",
        isSelected && "bg-accent border-l-2 border-primary"
      )}
    >
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
              "w-full px-2 py-1 text-sm bg-background",
              "border border-input rounded",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            maxLength={100}
          />
        ) : (
          <p className={cn(
            "text-sm truncate transition-colors",
            isSelected ? "text-primary font-medium" : "text-foreground"
          )}>
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
