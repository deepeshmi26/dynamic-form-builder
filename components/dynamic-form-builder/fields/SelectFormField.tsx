"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormOption } from "../types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  options: FormOption[];
  placeholder?: string;
};

export const SelectFormField = ({
  value,
  onChange,
  options,
  placeholder,
}: Props) => {
  return (
    <div className="relative grid gap-2 space-y-2">
      <Select onValueChange={onChange} value={value as string}>
        <SelectTrigger className="w-full text-sm sm:text-base !mb-0 text-left">
          <SelectValue
            placeholder={placeholder || "Select"}
            className="truncate text-left"
          />
        </SelectTrigger>

        <SelectContent>
          {options?.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          size="icon"
          onClick={() => onChange?.("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
