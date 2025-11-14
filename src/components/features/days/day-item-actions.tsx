"use client";

import { Pin, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePinDay } from "@/hooks/use-days";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayItemActionsProps {
  dayId: string;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function DayItemActions({
  dayId,
  isPinned,
  onEdit,
  onDelete,
}: DayItemActionsProps) {
  const pinDay = usePinDay();

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    pinDay.mutate({ id: dayId, pinned: !isPinned });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handlePin}
              className={cn(
                "p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600",
                "transition-colors",
                isPinned && "text-zinc-900 dark:text-zinc-100"
              )}
              aria-label={isPinned ? "Desanclar" : "Anclar"}
            >
              <Pin
                className={cn(
                  "w-3.5 h-3.5",
                  isPinned ? "fill-current" : "text-zinc-500 dark:text-zinc-400"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPinned ? "Desanclar" : "Anclar"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleEdit}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              aria-label="Editar"
            >
              <Edit2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
