"use client";

import { Checkbox } from "@/components/ui/checkbox";

type CheckboxProps = { value?: boolean; onChange?: (value: boolean) => void };

export const CheckboxFormItem = ({ value, onChange }: CheckboxProps) => {
  return <Checkbox checked={value} onCheckedChange={onChange} />;
};
