"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useUpdateDay, daysKeys } from "@/hooks/use-days";
import { DayItemActions } from "./day-item-actions";
import { DayIconCalendar } from "./day-icon-calendar";
import type { Day } from "@/types";

interface DayItemProps {
  day: Day;
  isPinned?: boolean;
  onDelete: (id: string) => void;
}

export function DayItem({ day, isPinned = false, onDelete }: DayItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(day.title || "");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  const updateDay = useUpdateDay();

  const selectedDayId = searchParams.get("day");
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
      router.push(`/?day=${day.id}`);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Prefetch day data on hover for instant navigation
    if (!isEditing && !isCollapsed) {
      queryClient.prefetchQuery({
        queryKey: daysKeys.detail(day.id),
        queryFn: async () => {
          const res = await fetch(`/api/days/${day.id}`);
          if (!res.ok) throw new Error("Failed to fetch day");
          const data = await res.json();
          return data.data;
        },
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(displayTitle);
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative h-10 flex items-center justify-center cursor-pointer",
          "rounded-md transition-all duration-200",
          !isSelected && "hover:bg-muted",
          isSelected && "bg-accent"
        )}
      >
        <DayIconCalendar
          date={day.date}
          variant="collapsed"
          isSelected={isSelected}
        />
      </div>
    );
  }

  return (
    <div
      onClick={!isEditing ? handleClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative h-10 flex items-center gap-2 px-3",
        !isEditing && "cursor-pointer",
        "rounded-md transition-all duration-200",
        !isSelected && !isEditing && "hover:bg-muted",
        isSelected && "bg-accent"
      )}
    >
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 px-2 py-1 text-sm bg-background",
              "border border-input rounded",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            maxLength={100}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
              aria-label="Cancelar"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
              aria-label="Guardar"
            >
              <Check className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </>
      ) : (
        <>
          <DayIconCalendar
            date={day.date}
            variant="expanded"
            isSelected={isSelected}
          />
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm truncate transition-colors",
              "text-foreground",
              isSelected && "font-medium group-hover:text-foreground/70"
            )}>
              {displayTitle}
            </p>
          </div>
          <DayItemActions
            dayId={day.id}
            isPinned={day.pinned}
            isHovered={isHovered}
            onEdit={handleEdit}
            onDelete={() => onDelete(day.id)}
          />
        </>
      )}
    </div>
  );
}
