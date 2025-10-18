"use client";

import { Input } from "@/components/ui/input";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const SpecialTextFormField = ({
  value,
  onChange,
  placeholder,
}: Props) => {
  return (
    <div className="relative">
      <Input
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="text-sm sm:text-base border-2 border-blue-200 focus:border-blue-400 transition-colors"
      />
      <div className="absolute -top-5 right-0 text-xs text-blue-500 italic">
        Special Input Component
      </div>
    </div>
  );
};
