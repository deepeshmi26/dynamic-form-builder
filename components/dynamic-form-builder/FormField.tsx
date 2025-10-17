"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { ArrayFormField } from "./FormFields/ArrayFormField";
import { CheckboxFormField } from "./FormFields/CheckboxFormField";
import { RadioGroupFormField } from "./FormFields/RadioGroupFormField";
import { SelectFormField } from "./FormFields/SelectFormField";
import { TextFormField } from "./FormFields/TextFormField";
import { FormFieldConfig, FormItemType, FormRegistryContextType, StringOption } from "./types";

export const FormRegistryContext = createContext<
  FormRegistryContextType<FieldValues>
>({});

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> };
};

export function FormField<TFieldValues extends FieldValues>({
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
            <TextFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.RADIO:
          return (
            <RadioGroupFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
            />
          );
        case FormItemType.SELECT:
          return (
            <SelectFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as StringOption[]}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.ARRAY:
          return (
            <ArrayFormField
              name={name}
              structure={state.structure}
              path={path ?? ""}
            />
          );
        case FormItemType.CHECKBOX:
          return (
            <CheckboxFormField
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
              <FormLabel
                required={state.required}
                className={cn("text-sm sm:text-base", "")}
              >
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
