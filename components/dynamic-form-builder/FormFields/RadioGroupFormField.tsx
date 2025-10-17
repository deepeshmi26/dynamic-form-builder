"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StringOption } from "../types";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  options: StringOption[];
};

export const RadioGroupFormField = ({ value, onChange, options }: Props) => {
  return (
    <RadioGroup
      onValueChange={onChange}
      value={value as string}
      className="space-y-2"
    >
      {options?.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} disabled={opt.disabled} />
          <span className="text-sm sm:text-base">{opt.label}</span>
        </div>
      ))}
    </RadioGroup>
  );
};
