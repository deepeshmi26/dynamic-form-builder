"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormOption } from "../types";
import { Button } from "@/components/ui/button";

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
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <div className="flex items-center gap-0">
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
          type="button"
          variant="ghost"
          onClick={handleClear}
          className=" hover:text-red-500 transition-colors absolute right-16"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
};
