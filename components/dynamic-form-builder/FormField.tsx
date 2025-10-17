"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as RHFFormField,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
const ArrayFormField = dynamic(
  () => import("./fields/ArrayFormField").then((m) => m.ArrayFormField),
  { ssr: false }
);
const CheckboxFormField = dynamic(
  () => import("./fields/CheckboxFormField").then((m) => m.CheckboxFormField),
  { ssr: false }
);
const CheckboxGroupFormField = dynamic(
  () =>
    import("./fields/CheckboxGroupFormField").then(
      (m) => m.CheckboxGroupFormField
    ),
  { ssr: false }
);
const RadioGroupFormField = dynamic(
  () =>
    import("./fields/RadioGroupFormField").then((m) => m.RadioGroupFormField),
  { ssr: false }
);
const SelectFormField = dynamic(
  () => import("./fields/SelectFormField").then((m) => m.SelectFormField),
  { ssr: false }
);
const TextFormField = dynamic(
  () => import("./fields/TextFormField").then((m) => m.TextFormField),
  { ssr: false }
);
const TextAreaFormField = dynamic(
  () => import("./fields/TextAreaFormField").then((m) => m.TextAreaFormField),
  { ssr: false }
);
const DateFormField = dynamic(
  () => import("./fields/DateFormField").then((m) => m.DateFormField),
  { ssr: false }
);
import { useFormRegistryContext } from "./hooks/useFormRegistryContext";
import { FormFieldConfig, FormItemType, FormOption } from "./types";

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
  } = useFormRegistryContext<FieldValues>();
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
        case FormItemType.BOOLEAN:
          return (
            <CheckboxFormField
              value={Boolean(field.value)}
              onChange={handleChange as (v: boolean) => void}
            />
          );
        case FormItemType.TEXT:
          return (
            <TextFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.TEXTAREA:
          return (
            <TextAreaFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={state.placeholder}
            />
          );
        case FormItemType.DATE:
          return (
            <DateFormField
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
              options={(state.options || []) as FormOption[]}
            />
          );
        case FormItemType.SELECT:
          return (
            <SelectFormField
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as FormOption[]}
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
            <CheckboxGroupFormField
              value={
                Array.isArray(field.value) ? (field.value as string[]) : []
              }
              onChange={handleChange as (v: string[]) => void}
              options={(state.options || []) as FormOption[]}
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
        <RHFFormField<TFieldValues, FieldPath<TFieldValues>>
          control={control}
          name={name}
          render={({
            field,
          }: {
            field: { value: unknown; onChange: (value: unknown) => void };
          }) => (
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
