"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormOption } from "../types";

type Props = {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: FormOption[];
};

export const CheckboxGroupFormField = ({ value, onChange, options }: Props) => {
  const selectedValues = new Set(value || []);

  const toggle = (val: string) => {
    const next = new Set(selectedValues);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    onChange?.(Array.from(next));
  };

  return (
    <div className="grid gap-2">
      {options?.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2">
          <Checkbox
            checked={selectedValues.has(opt.value)}
            disabled={opt.disabled}
            onCheckedChange={() => toggle(opt.value)}
          />
          <Label className="text-sm sm:text-base select-none">
            {opt.label}
          </Label>
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroupFormField;
