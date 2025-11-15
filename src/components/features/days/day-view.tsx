"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDay } from "@/hooks/use-days";

interface DayViewProps {
  dayId: string | null;
}

export function DayView({ dayId }: DayViewProps) {
  const { data: day, isLoading, error } = useDay(dayId);

  // Loading state
  if (isLoading && dayId) {
    return (
      <div className="h-full py-8 px-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-2/3 bg-muted rounded-md" />
          <div className="h-4 w-1/2 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && dayId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">Error al cargar el día</p>
          <p className="text-xs text-muted-foreground">
            Intenta seleccionar otro día
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no day selected
  if (!dayId || !day) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Selecciona un día del sidebar
              </p>
              <p className="text-xs text-muted-foreground">
                o crea uno nuevo con el botón +
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Success state - day loaded
  const displayTitle =
    day.title || format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={day.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="h-full"
      >
        {/* Header */}
        <div className="py-8 px-6 border-b border-border">
          <h1 className="text-3xl font-semibold text-foreground">
            {displayTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(day.date), "d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
          </p>
        </div>

        {/* Content - Tasks will go here */}
        <div className="py-6 px-6">
          <p className="text-sm text-muted-foreground">
            Las tareas aparecerán aquí próximamente...
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
