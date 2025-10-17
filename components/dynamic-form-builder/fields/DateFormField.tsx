"use client";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const DateFormField = ({ value, onChange, placeholder }: Props) => {
  const dateValue = useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-sm sm:text-base",
            !dateValue && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : placeholder || "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(d) => {
            if (!d) {
              onChange?.("");
              return;
            }
            const iso = new Date(
              Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
            ).toISOString();
            onChange?.(iso);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateFormField;
