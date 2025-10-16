"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useCallback, useContext, useMemo, useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormRegistryContext } from "./FormGenerator";
import { CheckboxFormItem } from "./FormItems/CheckboxFormItem";
import { RadioGroupFormItem } from "./FormItems/RadioGroupFormItem";
import { SelectFormItem } from "./FormItems/SelectFormItem";
import { TextFormItem } from "./FormItems/TextFormItem";
import { FormFieldConfig, FormItemType, StringOption } from "./types";

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> };
};

export function FormItemComponent<TFieldValues extends FieldValues>({
  control,
  config,
}: Props<TFieldValues>) {
  const [state, setState] = useState<FieldValues[keyof FieldValues]>(config);
  const name = config.name;
  const label = state.label;
  const { register, adapter } = useContext(FormRegistryContext);

  useMemo(() => {
    register?.(name, config, setState);
  }, [config, name, register]);

  const Component = useCallback(
    (field: { value: unknown; onChange: (value: unknown) => void }) => {
      if (adapter?.[state.type]) {
        const Component = adapter[state.type];
        return <Component value={field.value} onChange={field.onChange} />;
      }
      switch (state.type) {
        case FormItemType.TEXT:
          return (
            <TextFormItem
              value={(field.value as string) ?? undefined}
              onChange={field.onChange as (v: string) => void}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.RADIO:
          return (
            <RadioGroupFormItem
              value={(field.value as string) ?? undefined}
              onChange={field.onChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
            />
          );
        case FormItemType.SELECT:
          return (
            <SelectFormItem
              value={(field.value as string) ?? undefined}
              onChange={field.onChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.CHECKBOX:
          return (
            <CheckboxFormItem
              value={Boolean(field.value)}
              onChange={field.onChange as (v: boolean) => void}
            />
          );
        default:
          return null;
      }
    },
    [adapter, state.options, state.placeholder, state.type]
  );
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2 sm:space-y-3", "")}>
          <FormLabel className={cn("text-sm sm:text-base", "")}>
            {label}
          </FormLabel>
          <FormControl>
            <Component {...field} />
          </FormControl>
          <FormMessage className={cn("text-xs sm:text-sm", "")} />
        </FormItem>
      )}
    />
  );
}
