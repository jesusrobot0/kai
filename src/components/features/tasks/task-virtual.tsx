"use client";

import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskVirtualProps {
  onCreateTask: (title: string) => void;
  onRemove?: () => void;
}

export function TaskVirtual({ onCreateTask, onRemove }: TaskVirtualProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Al escribir primer carácter → crear task
    if (newValue.length === 1 && value.length === 0) {
      onCreateTask(newValue);
      setValue(""); // Reset para próximo virtual
    } else {
      setValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Backspace en virtual vacío → eliminar virtual
    if (e.key === "Backspace" && value === "") {
      e.preventDefault();
      onRemove?.();

      // Move focus to previous input
      const prevElement = inputRef.current?.previousElementSibling;
      if (prevElement) {
        const prevInput = prevElement.querySelector("input");
        prevInput?.focus();
      }
    }

    // Enter en virtual vacío → no hacer nada
    if (e.key === "Enter" && value === "") {
      e.preventDefault();
    }
  };

  return (
    <div className="group flex items-center gap-2 h-10 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
      <Checkbox disabled className="opacity-50" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 bg-transparent border-none outline-none",
          "text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus:outline-none"
        )}
        placeholder="Add a task..."
      />
    </div>
  );
}
