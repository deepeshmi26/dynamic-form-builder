"use client";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const TextAreaFormField = ({ value, onChange, placeholder }: Props) => {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="text-sm sm:text-base"
    />
  );
};

export default TextAreaFormField;
