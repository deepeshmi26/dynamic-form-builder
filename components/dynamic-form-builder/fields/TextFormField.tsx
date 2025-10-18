"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const TextFormField = ({ value, onChange, placeholder }: Props) => {
  return (
    <Input
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full justify-start text-left font-normal text-sm sm:text-base lg:text-base xl:text-base",
        "transition-all duration-200",
        !value && "text-muted-foreground"
      )}
    />
  );
};
