"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormOption } from "../types";

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
    <Select onValueChange={onChange} value={value as string}>
      <SelectTrigger className="w-full text-sm sm:text-base !mb-0 text-left">
        <SelectValue
          placeholder={placeholder || "Select"}
          className="truncate text-left"
        />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
