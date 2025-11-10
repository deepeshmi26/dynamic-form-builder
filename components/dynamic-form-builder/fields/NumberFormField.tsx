"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
};

export const NumberFormField = ({ value, onChange, placeholder }: Props) => {
  return (
    <Input
      type="number"
      value={value || ""}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
      placeholder={placeholder}
      className={cn(
        "w-full justify-start text-left font-normal text-sm sm:text-base lg:text-base xl:text-base",
        "transition-all duration-200",
        !value && "text-muted-foreground"
      )}
    />
  );
};
