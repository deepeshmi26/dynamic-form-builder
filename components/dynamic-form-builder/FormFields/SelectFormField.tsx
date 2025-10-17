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
      <SelectTrigger className="text-sm sm:text-base">
        <SelectValue placeholder={placeholder || "Select"} />
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
