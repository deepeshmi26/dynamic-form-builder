"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { FormRegistryContext } from "./FormGenerator";
import { CheckboxFormItem } from "./FormItems/CheckboxFormItem";
import { RadioGroupFormItem } from "./FormItems/RadioGroupFormItem";
import { SelectFormItem } from "./FormItems/SelectFormItem";
import { TextFormItem } from "./FormItems/TextFormItem";
import { FormFieldConfig, FormItemType, StringOption } from "./types";
import { ArrayFormItem } from "./FormItems/ArrayFormItem";

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> };
};

export function FormItemComponent<TFieldValues extends FieldValues>({
  control,
  config,
  path,
}: Props<TFieldValues> & { path?: string }) {
  const [state, setState] = useState<FieldValues[keyof FieldValues]>(config);
  const name = config.name;
  const label = state.label;

  useEffect(() => {
    setState(config);
  }, [config]);

  const {
    register,
    adapter,
    onChange: globalChangeListener,
    unregister,
  } = useContext(FormRegistryContext);
  const form = useFormContext();

  useEffect(() => {
    register?.(name, config, setState);
    return () => {
      unregister?.(name);
    };
  }, [name, config, register, setState, unregister]);

  const Component = useCallback(
    (field: { value: unknown; onChange: (value: unknown) => void }) => {
      const handleChange = (value: unknown) => {
        field.onChange(value);
        if (globalChangeListener) {
          const allValues = form.getValues();
          globalChangeListener(name, value, allValues);
        }
      };
      if (adapter?.[state.type]) {
        const Component = adapter[state.type];
        return <Component value={field.value} onChange={handleChange} />;
      }
      switch (state.type) {
        case FormItemType.TEXT:
          return (
            <TextFormItem
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.RADIO:
          return (
            <RadioGroupFormItem
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
            />
          );
        case FormItemType.SELECT:
          return (
            <SelectFormItem
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.ARRAY:
          return (
            <ArrayFormItem
              name={name}
              structure={state.structure}
              path={path ?? ""}
            />
          );
        case FormItemType.CHECKBOX:
          return (
            <CheckboxFormItem
              value={Boolean(field.value)}
              onChange={handleChange as (v: boolean) => void}
            />
          );
        default:
          return null;
      }
    },
    [
      adapter,
      form,
      globalChangeListener,
      name,
      path,
      state.options,
      state.placeholder,
      state.structure,
      state.type,
    ]
  );
  return (
    <>
      {state.visible !== false && (
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
      )}
    </>
  );
}
