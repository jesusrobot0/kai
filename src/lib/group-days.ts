import {
  isToday,
  isYesterday,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subWeeks,
  startOfMonth,
  startOfYear,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Day } from "@/types";

export type DayGroup = {
  label: string;
  days: Day[];
};

export function groupDays(days: Day[]): DayGroup[] {
  const now = new Date();

  // Week starts on Monday (ISO 8601)
  const weekStart = startOfWeek(now, { weekStartsOn: 1, locale: es });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1, locale: es });

  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);

  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const groups: Record<string, Day[]> = {
    Hoy: [],
    Ayer: [],
    "Esta semana": [],
    "La semana pasada": [],
    "Este mes": [],
    "Este año": [],
    "Más antiguo": [],
  };

  // Sort days by date descending
  const sortedDays = [...days].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedDays.forEach((day) => {
    const date = new Date(day.date);

    if (isToday(date)) {
      groups["Hoy"].push(day);
    } else if (isYesterday(date)) {
      groups["Ayer"].push(day);
    } else if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
      groups["Esta semana"].push(day);
    } else if (
      isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd })
    ) {
      groups["La semana pasada"].push(day);
    } else if (isWithinInterval(date, { start: monthStart, end: now })) {
      groups["Este mes"].push(day);
    } else if (date >= yearStart) {
      // Group by month name for current year
      const monthKey = format(date, "MMMM", { locale: es });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(day);
    } else {
      groups["Más antiguo"].push(day);
    }
  });

  // Convert to array and filter empty groups
  return Object.entries(groups)
    .filter(([_, days]) => days.length > 0)
    .map(([label, days]) => ({ label, days }));
}
