"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeft,
  PanelRight,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useDays, useCreateDay } from "@/hooks/use-days";
import { groupDays } from "@/lib/group-days";
import { DayItem } from "./day-item";
import { DeleteDayModal } from "./delete-day-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger, PopoverArrow } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import type { Day } from "@/types";

export function Sidebar() {
  const router = useRouter();
  const [dayToDelete, setDayToDelete] = useState<Day | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");

  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapse = useSidebarStore((state) => state.toggleCollapse);
  const pinnedSectionCollapsed = useSidebarStore((state) => state.pinnedSectionCollapsed);
  const togglePinnedSection = useSidebarStore((state) => state.togglePinnedSection);

  const { data: days = [], isLoading } = useDays();
  const createDay = useCreateDay();

  const pinnedDays = useMemo(
    () =>
      days
        .filter((day) => day.pinned)
        .sort((a, b) => {
          // Sort by pinnedAt descending (most recent first)
          if (!a.pinnedAt || !b.pinnedAt) return 0;
          return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
        }),
    [days]
  );

  const unpinnedDays = useMemo(
    () => days.filter((day) => !day.pinned),
    [days]
  );

  const groupedDays = useMemo(
    () => groupDays(unpinnedDays),
    [unpinnedDays]
  );

  const handleDelete = (day: Day) => {
    setDayToDelete(day);
    setDeleteModalOpen(true);
  };

  const handleCreateDay = () => {
    createDay.mutate({
      date: new Date(),
    });
  };

  const handlePopoverChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      setDropdownOpen(true);
    }
  };

  const handleCreateSpecificDay = () => {
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    createDay.mutate(
      {
        date: selectedDate,
        title: title.trim() || undefined,
      },
      {
        onSuccess: (newDay) => {
          toast.success("Día creado exitosamente");
          setPopoverOpen(false);
          setDropdownOpen(false);
          setSelectedDate(undefined);
          setTitle("");
          router.push(`/?day=${newDay.id}`);
        },
        onError: (error) => {
          const errorMessage = error.message || "Error al crear el día";
          if (errorMessage.includes("unique") || errorMessage.includes("duplicate")) {
            toast.error("Ya existe un día para esta fecha");
          } else {
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  const handleCancelCreate = () => {
    setPopoverOpen(false);
    setDropdownOpen(false);
    setSelectedDate(undefined);
    setTitle("");
  };

  if (isCollapsed) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: 60 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        className="h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleCollapse}
            aria-label="Expandir sidebar"
          >
            <PanelRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {pinnedDays.map((day) => (
              <DayItem
                key={day.id}
                day={day}
                isPinned
                onDelete={() => handleDelete(day)}
              />
            ))}
            {pinnedDays.length > 0 && unpinnedDays.length > 0 && (
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
            )}
            {unpinnedDays.slice(0, 10).map((day) => (
              <DayItem
                key={day.id}
                day={day}
                onDelete={() => handleDelete(day)}
              />
            ))}
          </div>
        </ScrollArea>

        <DeleteDayModal
          day={dayToDelete}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
        />
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: 320 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-semibold text-sm">K</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Kai</span>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={(open) => {
              // Bloquear completamente el cierre si el popover está abierto
              if (!open && popoverOpen) {
                return; // No permitir que se cierre mientras el popover está abierto
              }
              setDropdownOpen(open);
            }}
            modal={false}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8"
                aria-label="Crear día"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateDay}>
                <FileText className="w-4 h-4 mr-2" />
                Día de hoy
              </DropdownMenuItem>
              <Popover open={popoverOpen} onOpenChange={handlePopoverChange} modal={false}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Día específico
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  side="right"
                  align="start"
                  sideOffset={10}
                  alignOffset={0}
                  onInteractOutside={(e) => {
                    // Prevenir que clicks en el dropdown cierren el popover
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="menu"]')) {
                      e.preventDefault();
                    }
                  }}
                  onPointerDownOutside={(e) => {
                    // Solo cerrar si se clickea fuera tanto del dropdown como del popover
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="menu"]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <PopoverArrow className="fill-white dark:fill-zinc-950 drop-shadow" width={16} height={8} />
                  <div className="p-4 space-y-4">
                    {/* Calendar */}
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Optional title input */}
                    <div className="space-y-2">
                      <label htmlFor="day-title" className="text-sm font-medium">
                        Título (opcional)
                      </label>
                      <Input
                        id="day-title"
                        placeholder="Ej: Día productivo, Reunión importante..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        disabled={createDay.isPending}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelCreate}
                        disabled={createDay.isPending}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateSpecificDay}
                        disabled={createDay.isPending || !selectedDate}
                        size="sm"
                      >
                        {createDay.isPending ? "Creando..." : "Crear"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleCollapse}
            aria-label="Colapsar sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Pinned Section */}
          {pinnedDays.length > 0 && (
            <div>
              <button
                onClick={togglePinnedSection}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <span>ANCLADOS</span>
                <motion.div
                  animate={{ rotate: pinnedSectionCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {!pinnedSectionCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="mt-1 space-y-1">
                      {pinnedDays.map((day) => (
                        <DayItem
                          key={day.id}
                          day={day}
                          isPinned
                          onDelete={() => handleDelete(day)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Grouped Days */}
          {groupedDays.map((group) => (
            <div key={group.label}>
              <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {group.label.toUpperCase()}
              </div>
              <div className="mt-1 space-y-1">
                {group.days.map((day) => (
                  <DayItem
                    key={day.id}
                    day={day}
                    onDelete={() => handleDelete(day)}
                  />
                ))}
              </div>
            </div>
          ))}

          {!isLoading && days.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <p className="text-sm">No hay días todavía</p>
              <p className="text-xs mt-1">Crea tu primer día con el botón +</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <DeleteDayModal
        day={dayToDelete}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </motion.aside>
  );
}
