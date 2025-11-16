import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DayIconCalendarProps {
  date: Date;
  variant: "collapsed" | "expanded";
  isSelected?: boolean;
}

export function DayIconCalendar({ date, variant, isSelected = false }: DayIconCalendarProps) {
  const dayNumber = format(new Date(date), "d");

  if (variant === "collapsed") {
    return (
      <div className="relative flex items-center justify-center">
        <Calendar
          className={cn(
            "w-8 h-8 transition-colors",
            isSelected
              ? "text-primary"
              : "text-muted-foreground"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <span className={cn(
            "text-[10px] font-bold leading-none",
            isSelected
              ? "text-primary"
              : "text-muted-foreground"
          )}>
            {dayNumber}
          </span>
        </div>
      </div>
    );
  }

  // variant === "expanded"
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <Calendar
        className={cn(
          "w-6 h-6 transition-colors",
          isSelected
            ? "text-primary"
            : "text-muted-foreground"
        )}
      />
      <div className="absolute inset-0 flex items-center justify-center pt-1.5">
        <span className={cn(
          "text-[8px] font-bold leading-none",
          isSelected
            ? "text-primary"
            : "text-muted-foreground"
        )}>
          {dayNumber}
        </span>
      </div>
    </div>
  );
}
