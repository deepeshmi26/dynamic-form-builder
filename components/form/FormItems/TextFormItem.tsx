"use client";

import { Input } from "@/components/ui/input";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const TextFormItem = ({ value, onChange, placeholder }: Props) => {
  return (
    <Input
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="text-sm sm:text-base"
    />
  );
};
