"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDay } from "@/hooks/use-days";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Day } from "@/types";

interface DeleteDayModalProps {
  day: Day | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDayModal({ day, open, onOpenChange }: DeleteDayModalProps) {
  const deleteDay = useDeleteDay();

  if (!day) return null;

  const displayTitle = day.title || format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es });

  const handleDelete = () => {
    deleteDay.mutate(day.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar día</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar "{displayTitle}"? Esta acción no se puede deshacer y se eliminarán todas las tareas asociadas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteDay.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDay.isPending}
          >
            {deleteDay.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
